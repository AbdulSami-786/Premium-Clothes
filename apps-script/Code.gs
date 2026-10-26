/**
 * Premium Clothes — Google Apps Script backend.
 *
 * A single Web App endpoint backed by a Google Sheet. Handles accounts,
 * password reset, orders, reviews, the wishlist and contact messages.
 *
 * Setup is documented in apps-script/README.md. In short:
 *   1. Create a Sheet, open Extensions > Apps Script, paste this file in.
 *   2. Run `setup` once from the editor and grant the permissions it asks for.
 *   3. Deploy > New deployment > Web app, execute as Me, access to Anyone.
 *   4. Put the /exec URL in the site's .env as VITE_API_URL.
 */

/* ------------------------------------------------------------------ *
 * Configuration
 * ------------------------------------------------------------------ */

var CONFIG = {
  STORE_NAME: 'Premium Clothes',
  // Where reset codes and order confirmations appear to come from.
  REPLY_TO: 'hello@premiumclothes.pk',
  // Reset codes expire after this many minutes.
  RESET_TTL_MIN: 30,
  // Sessions expire after this many days of no use.
  SESSION_TTL_DAYS: 30,
  // A browser may attempt this many failed logins per email before a pause.
  MAX_LOGIN_ATTEMPTS: 8,
  LOGIN_WINDOW_MIN: 15,
}

var SHEETS = {
  USERS: 'Users',
  SESSIONS: 'Sessions',
  ORDERS: 'Orders',
  ORDER_ITEMS: 'OrderItems',
  REVIEWS: 'Reviews',
  WISHLIST: 'Wishlist',
  MESSAGES: 'Messages',
  RESETS: 'PasswordResets',
  NEWSLETTER: 'Newsletter',
}

/** Column order for each sheet. Adding a column means appending it here. */
var COLUMNS = {
  Users: ['id', 'name', 'email', 'phone', 'passwordHash', 'salt', 'createdAt', 'updatedAt'],
  Sessions: ['token', 'userId', 'createdAt', 'expiresAt', 'userAgent'],
  Orders: [
    'id', 'userId', 'email', 'name', 'phone', 'address', 'city', 'postal',
    'notes', 'payment', 'subtotal', 'shipping', 'total', 'status', 'placedAt',
  ],
  OrderItems: [
    'orderId', 'productId', 'name', 'image', 'size', 'color', 'quantity',
    'unitPrice', 'lineTotal',
  ],
  Reviews: ['id', 'productId', 'userId', 'name', 'rating', 'title', 'body', 'status', 'createdAt'],
  Wishlist: ['userId', 'productId', 'addedAt'],
  Messages: ['id', 'name', 'email', 'subject', 'message', 'createdAt'],
  PasswordResets: ['email', 'codeHash', 'expiresAt', 'usedAt', 'requestedAt'],
  Newsletter: ['email', 'subscribedAt'],
}

/* ------------------------------------------------------------------ *
 * One-time setup
 * ------------------------------------------------------------------ */

/** Run this once from the Apps Script editor to build the sheets. */
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet()

  Object.keys(COLUMNS).forEach(function (name) {
    var sheet = ss.getSheetByName(name)
    if (!sheet) sheet = ss.insertSheet(name)

    var headers = COLUMNS[name]
    sheet.getRange(1, 1, 1, headers.length).setValues([headers])
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground('#121215')
      .setFontColor('#ffffff')
    sheet.setFrozenRows(1)
  })

  // Remove the default empty sheet if it is still there and unused.
  var def = ss.getSheetByName('Sheet1')
  if (def && ss.getSheets().length > 1 && def.getLastRow() === 0) ss.deleteSheet(def)

  cleanupExpired()
  return 'Setup complete. ' + Object.keys(COLUMNS).length + ' sheets ready.'
}

/**
 * Optional: install a daily trigger that clears expired sessions and reset
 * codes. Run once from the editor if you want the housekeeping automated.
 */
function installCleanupTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'cleanupExpired') ScriptApp.deleteTrigger(t)
  })
  ScriptApp.newTrigger('cleanupExpired').timeBased().everyDays(1).atHour(3).create()
  return 'Daily cleanup trigger installed.'
}

/* ------------------------------------------------------------------ *
 * HTTP entry points
 * ------------------------------------------------------------------ */

/**
 * The site calls this with a plain-text body so the browser treats it as a
 * simple request and skips the CORS preflight, which Apps Script cannot
 * answer. GET is used for health checks and cache-friendly reads.
 */
function doPost(e) {
  try {
    var body = {}
    if (e && e.postData && e.postData.contents) body = JSON.parse(e.postData.contents)
    return respond(route(String(body.action || ''), body, e))
  } catch (err) {
    return respond({ ok: false, error: friendlyError(err) })
  }
}

function doGet(e) {
  try {
    var params = (e && e.parameter) || {}
    var action = String(params.action || 'ping')
    return respond(route(action, params, e))
  } catch (err) {
    return respond({ ok: false, error: friendlyError(err) })
  }
}

function route(action, payload, e) {
  switch (action) {
    /* health */
    case 'ping': return { ok: true, service: CONFIG.STORE_NAME, time: nowIso() }

    /* accounts */
    case 'signup': return handleSignup(payload, e)
    case 'login': return handleLogin(payload, e)
    case 'logout': return handleLogout(payload)
    case 'me': return handleMe(payload)
    case 'updateProfile': return handleUpdateProfile(payload)
    case 'changePassword': return handleChangePassword(payload)

    /* password reset */
    case 'requestReset': return handleRequestReset(payload)
    case 'verifyReset': return handleVerifyReset(payload)
    case 'resetPassword': return handleResetPassword(payload)

    /* orders */
    case 'createOrder': return handleCreateOrder(payload)
    case 'myOrders': return handleMyOrders(payload)
    case 'getOrder': return handleGetOrder(payload)

    /* reviews */
    case 'addReview': return handleAddReview(payload)
    case 'productReviews': return handleProductReviews(payload)
    case 'reviewSummary': return handleReviewSummary(payload)

    /* wishlist */
    case 'getWishlist': return handleGetWishlist(payload)
    case 'toggleWishlist': return handleToggleWishlist(payload)
    case 'syncWishlist': return handleSyncWishlist(payload)

    /* misc */
    case 'contact': return handleContact(payload)
    case 'subscribe': return handleSubscribe(payload)

    default: return { ok: false, error: 'Unknown action: ' + action }
  }
}

/**
 * Apps Script Web Apps cannot set CORS headers, but a response served as
 * JSON from a simple request is readable by the browser regardless.
 */
function respond(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  )
}

/* ------------------------------------------------------------------ *
 * Accounts
 * ------------------------------------------------------------------ */

function handleSignup(p, e) {
  var name = trim(p.name)
  var email = normalizeEmail(p.email)
  var password = String(p.password || '')
  var phone = trim(p.phone)

  if (!name) return fail('Please enter your name.')
  if (!isEmail(email)) return fail('Please enter a valid email address.')
  var pwError = passwordProblem(password)
  if (pwError) return fail(pwError)

  var lock = LockService.getScriptLock()
  lock.waitLock(20000)
  try {
    if (findUserByEmail(email)) {
      return fail('An account already exists for that email. Try signing in.')
    }

    var salt = randomToken(16)
    var user = {
      id: 'U' + randomToken(10).toUpperCase(),
      name: name,
      email: email,
      phone: phone,
      passwordHash: hashPassword(password, salt),
      salt: salt,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }
    appendRow(SHEETS.USERS, user)

    var token = createSession(user.id, e)
    return { ok: true, token: token, user: publicUser(user) }
  } finally {
    lock.releaseLock()
  }
}

function handleLogin(p, e) {
  var email = normalizeEmail(p.email)
  var password = String(p.password || '')

  if (!isEmail(email) || !password) return fail('Enter your email and password.')

  if (isRateLimited(email)) {
    return fail('Too many attempts. Please wait a few minutes and try again.')
  }

  var user = findUserByEmail(email)
  // Same message either way, so the response cannot be used to discover
  // which email addresses have accounts.
  if (!user || hashPassword(password, user.salt) !== user.passwordHash) {
    recordFailedLogin(email)
    return fail('Email or password is incorrect.')
  }

  clearLoginAttempts(email)
  var token = createSession(user.id, e)
  return { ok: true, token: token, user: publicUser(user) }
}

function handleLogout(p) {
  var token = trim(p.token)
  if (!token) return { ok: true }

  var found = findRow(SHEETS.SESSIONS, 'token', token)
  if (found) deleteRowAt(SHEETS.SESSIONS, found.rowNumber)
  return { ok: true }
}

function handleMe(p) {
  var session = requireSession(p.token)
  if (session.error) return session
  return { ok: true, user: publicUser(session.user) }
}

function handleUpdateProfile(p) {
  var session = requireSession(p.token)
  if (session.error) return session

  var patch = {}
  if (p.name !== undefined) {
    if (!trim(p.name)) return fail('Name cannot be empty.')
    patch.name = trim(p.name)
  }
  if (p.phone !== undefined) patch.phone = trim(p.phone)
  patch.updatedAt = nowIso()

  updateRow(SHEETS.USERS, 'id', session.user.id, patch)
  var updated = findUserById(session.user.id)
  return { ok: true, user: publicUser(updated) }
}

function handleChangePassword(p) {
  var session = requireSession(p.token)
  if (session.error) return session

  var current = String(p.currentPassword || '')
  var next = String(p.newPassword || '')

  if (hashPassword(current, session.user.salt) !== session.user.passwordHash) {
    return fail('Your current password is not correct.')
  }
  var pwError = passwordProblem(next)
  if (pwError) return fail(pwError)

  var salt = randomToken(16)
  updateRow(SHEETS.USERS, 'id', session.user.id, {
    salt: salt,
    passwordHash: hashPassword(next, salt),
    updatedAt: nowIso(),
  })

  // A password change invalidates every other session.
  revokeSessionsForUser(session.user.id, p.token)
  return { ok: true, message: 'Password updated.' }
}

/* ------------------------------------------------------------------ *
 * Password reset
 * ------------------------------------------------------------------ */

function handleRequestReset(p) {
  var email = normalizeEmail(p.email)
  if (!isEmail(email)) return fail('Please enter a valid email address.')

  var user = findUserByEmail(email)

  // Always report success so the endpoint cannot be used to enumerate
  // which email addresses are registered.
  if (user) {
    var code = String(Math.floor(100000 + Math.random() * 900000))
    var expires = new Date(Date.now() + CONFIG.RESET_TTL_MIN * 60 * 1000)

    // Invalidate any earlier codes for this address.
    deleteRowsWhere(SHEETS.RESETS, 'email', email)
    appendRow(SHEETS.RESETS, {
      email: email,
      codeHash: sha256(code + '|' + email),
      expiresAt: expires.toISOString(),
      usedAt: '',
      requestedAt: nowIso(),
    })

    sendResetEmail(user, code)
  }

  return {
    ok: true,
    message: 'If an account exists for that address, a reset code is on its way.',
  }
}

function handleVerifyReset(p) {
  var check = checkResetCode(p.email, p.code)
  if (check.error) return check
  return { ok: true, message: 'Code accepted.' }
}

function handleResetPassword(p) {
  var check = checkResetCode(p.email, p.code)
  if (check.error) return check

  var pwError = passwordProblem(String(p.password || ''))
  if (pwError) return fail(pwError)

  var user = findUserByEmail(normalizeEmail(p.email))
  if (!user) return fail('That reset link is no longer valid.')

  var salt = randomToken(16)
  updateRow(SHEETS.USERS, 'id', user.id, {
    salt: salt,
    passwordHash: hashPassword(String(p.password), salt),
    updatedAt: nowIso(),
  })

  updateRow(SHEETS.RESETS, 'email', check.record.email, { usedAt: nowIso() })
  revokeSessionsForUser(user.id, null)

  return { ok: true, message: 'Password reset. You can sign in now.' }
}

/** Shared validation for verifyReset and resetPassword. */
function checkResetCode(rawEmail, rawCode) {
  var email = normalizeEmail(rawEmail)
  var code = trim(rawCode)
  if (!isEmail(email) || !code) return fail('Enter the code we emailed you.')

  var found = findRow(SHEETS.RESETS, 'email', email)
  if (!found) return fail('That code is not valid. Request a new one.')

  var rec = found.record
  if (rec.usedAt) return fail('That code has already been used.')
  if (new Date(rec.expiresAt).getTime() < Date.now()) {
    return fail('That code has expired. Request a new one.')
  }
  if (sha256(code + '|' + email) !== rec.codeHash) {
    return fail('That code is not valid. Check the email and try again.')
  }

  return { ok: true, record: rec, rowNumber: found.rowNumber }
}

function sendResetEmail(user, code) {
  var subject = CONFIG.STORE_NAME + ' — your password reset code'
  var text =
    'Hello ' + user.name + ',\n\n' +
    'Your password reset code is ' + code + '\n\n' +
    'It expires in ' + CONFIG.RESET_TTL_MIN + ' minutes. If you did not ask to ' +
    'reset your password, you can ignore this email.\n\n' +
    CONFIG.STORE_NAME

  var html =
    '<div style="font-family:Helvetica,Arial,sans-serif;max-width:480px">' +
    '<h2 style="font-weight:600">Password reset</h2>' +
    '<p>Hello ' + escapeHtml(user.name) + ',</p>' +
    '<p>Use this code to reset your password:</p>' +
    '<p style="font-size:30px;letter-spacing:7px;font-weight:700;margin:24px 0">' +
    code + '</p>' +
    '<p style="color:#666">It expires in ' + CONFIG.RESET_TTL_MIN + ' minutes. ' +
    'If you did not ask for this, you can ignore this email.</p>' +
    '<p style="color:#666">— ' + escapeHtml(CONFIG.STORE_NAME) + '</p></div>'

  try {
    MailApp.sendEmail({
      to: user.email,
      subject: subject,
      body: text,
      htmlBody: html,
      name: CONFIG.STORE_NAME,
      replyTo: CONFIG.REPLY_TO,
    })
  } catch (err) {
    // Out of daily quota, most likely. The code is still stored, so support
    // can read it from the sheet if a customer is stuck.
    console.error('Reset email failed for ' + user.email + ': ' + err)
  }
}

/* ------------------------------------------------------------------ *
 * Orders
 * ------------------------------------------------------------------ */

function handleCreateOrder(p) {
  var items = p.items
  if (!items || !items.length) return fail('Your bag is empty.')

  var customer = p.customer || {}
  if (!trim(customer.name)) return fail('Please enter a name for the delivery.')
  if (!isEmail(normalizeEmail(customer.email))) return fail('Please enter a valid email.')
  if (!trim(customer.address)) return fail('Please enter a delivery address.')

  // An order may be placed signed in or as a guest.
  var userId = ''
  if (p.token) {
    var session = getSession(p.token)
    if (session) userId = session.user.id
  }

  // Totals are recomputed here rather than trusted from the browser.
  var subtotal = 0
  items.forEach(function (it) {
    var qty = Math.max(1, Math.min(99, Number(it.quantity) || 1))
    subtotal += (Number(it.unitPrice) || 0) * qty
  })
  var shipping = subtotal === 0 || subtotal >= 10000 ? 0 : 350
  var total = subtotal + shipping

  var order = {
    id: 'PC' + String(Date.now()).slice(-8),
    userId: userId,
    email: normalizeEmail(customer.email),
    name: trim(customer.name),
    phone: trim(customer.phone),
    address: trim(customer.address),
    city: trim(customer.city),
    postal: trim(customer.postal),
    notes: trim(customer.notes),
    payment: trim(p.payment) || 'cod',
    subtotal: subtotal,
    shipping: shipping,
    total: total,
    status: 'Confirmed',
    placedAt: nowIso(),
  }

  var lock = LockService.getScriptLock()
  lock.waitLock(20000)
  try {
    appendRow(SHEETS.ORDERS, order)

    var rows = items.map(function (it) {
      var qty = Math.max(1, Math.min(99, Number(it.quantity) || 1))
      var unit = Number(it.unitPrice) || 0
      return {
        orderId: order.id,
        productId: trim(it.productId),
        name: trim(it.name),
        image: trim(it.image),
        size: trim(it.size),
        color: trim(it.color),
        quantity: qty,
        unitPrice: unit,
        lineTotal: unit * qty,
      }
    })
    appendRows(SHEETS.ORDER_ITEMS, rows)
  } finally {
    lock.releaseLock()
  }

  sendOrderEmail(order, items)
  return { ok: true, order: withItems(order, items) }
}

function handleMyOrders(p) {
  var session = requireSession(p.token)
  if (session.error) return session

  var orders = readAll(SHEETS.ORDERS).filter(function (o) {
    return String(o.userId) === session.user.id
  })
  var items = readAll(SHEETS.ORDER_ITEMS)

  var result = orders
    .map(function (o) {
      return withItems(
        o,
        items.filter(function (i) { return String(i.orderId) === String(o.id) }),
      )
    })
    .sort(function (a, b) {
      return new Date(b.placedAt) - new Date(a.placedAt)
    })

  return { ok: true, orders: result }
}

/** Looks an order up by number, plus the email it was placed with. */
function handleGetOrder(p) {
  var id = trim(p.orderId).toUpperCase()
  var email = normalizeEmail(p.email)
  if (!id) return fail('Enter your order number.')

  var found = findRow(SHEETS.ORDERS, 'id', id)
  if (!found) return fail('No order found with that number.')

  var order = found.record
  var authorised = false

  if (p.token) {
    var session = getSession(p.token)
    if (session && String(order.userId) === session.user.id) authorised = true
  }
  if (!authorised && email && normalizeEmail(order.email) === email) authorised = true

  if (!authorised) {
    return fail('Enter the email address the order was placed with.')
  }

  var items = readAll(SHEETS.ORDER_ITEMS).filter(function (i) {
    return String(i.orderId) === String(order.id)
  })
  return { ok: true, order: withItems(order, items) }
}

function withItems(order, items) {
  return {
    id: order.id,
    status: order.status,
    placedAt: order.placedAt,
    payment: order.payment,
    totals: {
      subtotal: Number(order.subtotal) || 0,
      shipping: Number(order.shipping) || 0,
      total: Number(order.total) || 0,
    },
    customer: {
      name: order.name,
      email: order.email,
      phone: order.phone,
      address: order.address,
      city: order.city,
      postal: order.postal,
    },
    items: items.map(function (i) {
      return {
        productId: i.productId,
        name: i.name,
        image: i.image,
        size: i.size,
        color: i.color,
        quantity: Number(i.quantity) || 1,
        lineTotal: Number(i.lineTotal) || 0,
      }
    }),
  }
}

function sendOrderEmail(order, items) {
  var lines = items.map(function (i) {
    return '· ' + i.name + ' (' + i.size + ', ' + i.color + ') × ' + i.quantity
  }).join('\n')

  var text =
    'Thank you for your order, ' + order.name + '.\n\n' +
    'Order number: ' + order.id + '\n\n' + lines + '\n\n' +
    'Total: PKR ' + order.total + '\n' +
    'Delivering to: ' + order.address + ', ' + order.city + '\n\n' +
    'We will email again when it ships.\n\n' + CONFIG.STORE_NAME

  try {
    MailApp.sendEmail({
      to: order.email,
      subject: CONFIG.STORE_NAME + ' — order ' + order.id + ' confirmed',
      body: text,
      name: CONFIG.STORE_NAME,
      replyTo: CONFIG.REPLY_TO,
    })
  } catch (err) {
    console.error('Order email failed for ' + order.id + ': ' + err)
  }
}

/* ------------------------------------------------------------------ *
 * Reviews
 * ------------------------------------------------------------------ */

function handleAddReview(p) {
  var session = requireSession(p.token)
  if (session.error) return session

  var productId = trim(p.productId)
  var rating = Math.round(Number(p.rating) || 0)
  var body = trim(p.body)

  if (!productId) return fail('Missing product.')
  if (rating < 1 || rating > 5) return fail('Please choose a rating from 1 to 5.')
  if (body.length < 10) return fail('Please write a little more in your review.')

  var already = readAll(SHEETS.REVIEWS).some(function (r) {
    return String(r.productId) === productId && String(r.userId) === session.user.id
  })
  if (already) return fail('You have already reviewed this product.')

  var review = {
    id: 'R' + randomToken(10).toUpperCase(),
    productId: productId,
    userId: session.user.id,
    name: session.user.name,
    rating: rating,
    title: trim(p.title),
    body: body,
    status: 'Published',
    createdAt: nowIso(),
  }
  appendRow(SHEETS.REVIEWS, review)

  return { ok: true, review: publicReview(review) }
}

function handleProductReviews(p) {
  var productId = trim(p.productId)
  if (!productId) return fail('Missing product.')

  var reviews = readAll(SHEETS.REVIEWS)
    .filter(function (r) {
      return String(r.productId) === productId && String(r.status) !== 'Hidden'
    })
    .sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt) })
    .map(publicReview)

  return { ok: true, reviews: reviews, summary: summarise(reviews) }
}

/** Ratings for many products at once, so a grid needs only one call. */
function handleReviewSummary(p) {
  var ids = p.productIds
  if (typeof ids === 'string') ids = ids.split(',')
  var wanted = (ids || []).map(function (i) { return trim(i) })

  var byProduct = {}
  readAll(SHEETS.REVIEWS).forEach(function (r) {
    if (String(r.status) === 'Hidden') return
    var pid = String(r.productId)
    if (wanted.length && wanted.indexOf(pid) === -1) return
    if (!byProduct[pid]) byProduct[pid] = []
    byProduct[pid].push({ rating: Number(r.rating) || 0 })
  })

  var out = {}
  Object.keys(byProduct).forEach(function (pid) {
    out[pid] = summarise(byProduct[pid])
  })
  return { ok: true, summary: out }
}

function summarise(reviews) {
  if (!reviews.length) return { count: 0, average: 0 }
  var sum = reviews.reduce(function (t, r) { return t + (Number(r.rating) || 0) }, 0)
  return { count: reviews.length, average: Math.round((sum / reviews.length) * 10) / 10 }
}

function publicReview(r) {
  return {
    id: r.id,
    productId: r.productId,
    name: r.name,
    rating: Number(r.rating) || 0,
    title: r.title,
    body: r.body,
    createdAt: r.createdAt,
  }
}

/* ------------------------------------------------------------------ *
 * Wishlist
 * ------------------------------------------------------------------ */

function handleGetWishlist(p) {
  var session = requireSession(p.token)
  if (session.error) return session

  var ids = readAll(SHEETS.WISHLIST)
    .filter(function (w) { return String(w.userId) === session.user.id })
    .map(function (w) { return String(w.productId) })

  return { ok: true, productIds: ids }
}

function handleToggleWishlist(p) {
  var session = requireSession(p.token)
  if (session.error) return session

  var productId = trim(p.productId)
  if (!productId) return fail('Missing product.')

  var rows = readAllWithRows(SHEETS.WISHLIST)
  var existing = null
  for (var i = 0; i < rows.length; i++) {
    if (
      String(rows[i].record.userId) === session.user.id &&
      String(rows[i].record.productId) === productId
    ) {
      existing = rows[i]
      break
    }
  }

  if (existing) {
    deleteRowAt(SHEETS.WISHLIST, existing.rowNumber)
    return { ok: true, wishlisted: false }
  }

  appendRow(SHEETS.WISHLIST, {
    userId: session.user.id,
    productId: productId,
    addedAt: nowIso(),
  })
  return { ok: true, wishlisted: true }
}

/**
 * Merges the ids a visitor saved before signing in with whatever the account
 * already had, then returns the union.
 */
function handleSyncWishlist(p) {
  var session = requireSession(p.token)
  if (session.error) return session

  var incoming = p.productIds || []
  if (typeof incoming === 'string') incoming = incoming.split(',')

  var mine = readAll(SHEETS.WISHLIST).filter(function (w) {
    return String(w.userId) === session.user.id
  })
  var have = {}
  mine.forEach(function (w) { have[String(w.productId)] = true })

  var toAdd = []
  incoming.forEach(function (raw) {
    var pid = trim(raw)
    if (pid && !have[pid]) {
      have[pid] = true
      toAdd.push({ userId: session.user.id, productId: pid, addedAt: nowIso() })
    }
  })
  if (toAdd.length) appendRows(SHEETS.WISHLIST, toAdd)

  return { ok: true, productIds: Object.keys(have) }
}

/* ------------------------------------------------------------------ *
 * Contact and newsletter
 * ------------------------------------------------------------------ */

function handleContact(p) {
  var name = trim(p.name)
  var email = normalizeEmail(p.email)
  var message = trim(p.message)

  if (!name) return fail('Please tell us your name.')
  if (!isEmail(email)) return fail('Please enter a valid email address.')
  if (message.length < 10) return fail('Please add a little more detail.')

  appendRow(SHEETS.MESSAGES, {
    id: 'M' + randomToken(8).toUpperCase(),
    name: name,
    email: email,
    subject: trim(p.subject) || 'General enquiry',
    message: message,
    createdAt: nowIso(),
  })

  try {
    MailApp.sendEmail({
      to: CONFIG.REPLY_TO,
      subject: '[' + CONFIG.STORE_NAME + '] ' + (trim(p.subject) || 'New message'),
      body: 'From: ' + name + ' <' + email + '>\n\n' + message,
      replyTo: email,
    })
  } catch (err) {
    console.error('Contact notification failed: ' + err)
  }

  return { ok: true, message: 'Thank you — we will reply shortly.' }
}

function handleSubscribe(p) {
  var email = normalizeEmail(p.email)
  if (!isEmail(email)) return fail('Please enter a valid email address.')

  if (!findRow(SHEETS.NEWSLETTER, 'email', email)) {
    appendRow(SHEETS.NEWSLETTER, { email: email, subscribedAt: nowIso() })
  }
  return { ok: true, message: 'You are on the list.' }
}

/* ------------------------------------------------------------------ *
 * Sessions
 * ------------------------------------------------------------------ */

function createSession(userId, e) {
  var token = randomToken(32)
  var ua = ''
  try {
    ua = (e && e.parameter && e.parameter.ua) || ''
  } catch (err) { ua = '' }

  appendRow(SHEETS.SESSIONS, {
    token: token,
    userId: userId,
    createdAt: nowIso(),
    expiresAt: new Date(
      Date.now() + CONFIG.SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString(),
    userAgent: String(ua).slice(0, 200),
  })
  return token
}

/** Returns { user } for a valid token, or null. */
function getSession(token) {
  token = trim(token)
  if (!token) return null

  var found = findRow(SHEETS.SESSIONS, 'token', token)
  if (!found) return null

  if (new Date(found.record.expiresAt).getTime() < Date.now()) {
    deleteRowAt(SHEETS.SESSIONS, found.rowNumber)
    return null
  }

  var user = findUserById(found.record.userId)
  if (!user) return null
  return { user: user, session: found.record }
}

/** Same as getSession but returns an error object pages can return directly. */
function requireSession(token) {
  var session = getSession(token)
  if (!session) return { ok: false, error: 'Please sign in again.', code: 'AUTH' }
  return session
}

function revokeSessionsForUser(userId, keepToken) {
  var rows = readAllWithRows(SHEETS.SESSIONS)
  // Delete from the bottom so earlier row numbers stay valid.
  for (var i = rows.length - 1; i >= 0; i--) {
    var r = rows[i]
    if (String(r.record.userId) === String(userId) && r.record.token !== keepToken) {
      deleteRowAt(SHEETS.SESSIONS, r.rowNumber)
    }
  }
}

/** Clears expired sessions and reset codes. Safe to run any time. */
function cleanupExpired() {
  var now = Date.now()
  var removed = 0

  var sessions = readAllWithRows(SHEETS.SESSIONS)
  for (var i = sessions.length - 1; i >= 0; i--) {
    if (new Date(sessions[i].record.expiresAt).getTime() < now) {
      deleteRowAt(SHEETS.SESSIONS, sessions[i].rowNumber)
      removed++
    }
  }

  var resets = readAllWithRows(SHEETS.RESETS)
  for (var j = resets.length - 1; j >= 0; j--) {
    var rec = resets[j].record
    if (rec.usedAt || new Date(rec.expiresAt).getTime() < now) {
      deleteRowAt(SHEETS.RESETS, resets[j].rowNumber)
      removed++
    }
  }

  return 'Removed ' + removed + ' expired rows.'
}

/* ------------------------------------------------------------------ *
 * Login rate limiting (cache-based, resets on its own)
 * ------------------------------------------------------------------ */

function loginKey(email) { return 'login:' + sha256(email).slice(0, 24) }

function isRateLimited(email) {
  var raw = CacheService.getScriptCache().get(loginKey(email))
  return raw ? Number(raw) >= CONFIG.MAX_LOGIN_ATTEMPTS : false
}

function recordFailedLogin(email) {
  var cache = CacheService.getScriptCache()
  var key = loginKey(email)
  var n = Number(cache.get(key) || 0) + 1
  cache.put(key, String(n), CONFIG.LOGIN_WINDOW_MIN * 60)
}

function clearLoginAttempts(email) {
  CacheService.getScriptCache().remove(loginKey(email))
}

/* ------------------------------------------------------------------ *
 * Sheet helpers
 * ------------------------------------------------------------------ */

function sheet(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet()
  var s = ss.getSheetByName(name)
  if (!s) {
    s = ss.insertSheet(name)
    var headers = COLUMNS[name] || []
    if (headers.length) {
      s.getRange(1, 1, 1, headers.length).setValues([headers])
      s.setFrozenRows(1)
    }
  }
  return s
}

function headersOf(name) {
  var s = sheet(name)
  var width = Math.max(1, s.getLastColumn())
  return s.getRange(1, 1, 1, width).getValues()[0].filter(String)
}

/** Every data row as objects keyed by header. */
function readAll(name) {
  var s = sheet(name)
  var lastRow = s.getLastRow()
  if (lastRow < 2) return []

  var headers = headersOf(name)
  var values = s.getRange(2, 1, lastRow - 1, headers.length).getValues()

  return values
    .filter(function (row) {
      return row.some(function (c) { return c !== '' && c !== null })
    })
    .map(function (row) { return rowToObject(headers, row) })
}

/** As readAll, but each entry carries its 1-based sheet row number. */
function readAllWithRows(name) {
  var s = sheet(name)
  var lastRow = s.getLastRow()
  if (lastRow < 2) return []

  var headers = headersOf(name)
  var values = s.getRange(2, 1, lastRow - 1, headers.length).getValues()

  var out = []
  values.forEach(function (row, i) {
    var blank = row.every(function (c) { return c === '' || c === null })
    if (!blank) out.push({ record: rowToObject(headers, row), rowNumber: i + 2 })
  })
  return out
}

function rowToObject(headers, row) {
  var obj = {}
  headers.forEach(function (h, i) {
    var v = row[i]
    // Dates come back as Date objects; keep everything as strings so the
    // JSON the site receives is predictable.
    obj[h] = v instanceof Date ? v.toISOString() : v
  })
  return obj
}

function findRow(name, column, value) {
  var target = String(value)
  var rows = readAllWithRows(name)
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i].record[column]) === target) return rows[i]
  }
  return null
}

function appendRow(name, obj) {
  var headers = headersOf(name)
  sheet(name).appendRow(headers.map(function (h) {
    return obj[h] === undefined ? '' : obj[h]
  }))
}

/** One setValues call for many rows — much faster than appendRow in a loop. */
function appendRows(name, objects) {
  if (!objects || !objects.length) return
  var s = sheet(name)
  var headers = headersOf(name)
  var values = objects.map(function (obj) {
    return headers.map(function (h) { return obj[h] === undefined ? '' : obj[h] })
  })
  s.getRange(s.getLastRow() + 1, 1, values.length, headers.length).setValues(values)
}

function updateRow(name, column, value, patch) {
  var found = findRow(name, column, value)
  if (!found) return false

  var headers = headersOf(name)
  var merged = found.record
  Object.keys(patch).forEach(function (k) { merged[k] = patch[k] })

  sheet(name)
    .getRange(found.rowNumber, 1, 1, headers.length)
    .setValues([headers.map(function (h) {
      return merged[h] === undefined ? '' : merged[h]
    })])
  return true
}

function deleteRowAt(name, rowNumber) {
  sheet(name).deleteRow(rowNumber)
}

function deleteRowsWhere(name, column, value) {
  var target = String(value)
  var rows = readAllWithRows(name)
  for (var i = rows.length - 1; i >= 0; i--) {
    if (String(rows[i].record[column]) === target) {
      deleteRowAt(name, rows[i].rowNumber)
    }
  }
}

function findUserByEmail(email) {
  var found = findRow(SHEETS.USERS, 'email', normalizeEmail(email))
  return found ? found.record : null
}

function findUserById(id) {
  var found = findRow(SHEETS.USERS, 'id', id)
  return found ? found.record : null
}

/** Never return the hash or salt to the browser. */
function publicUser(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    createdAt: u.createdAt,
  }
}

/* ------------------------------------------------------------------ *
 * Small utilities
 * ------------------------------------------------------------------ */

function fail(message) { return { ok: false, error: message } }

function nowIso() { return new Date().toISOString() }

function trim(v) { return String(v === undefined || v === null ? '' : v).trim() }

function normalizeEmail(v) { return trim(v).toLowerCase() }

function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v)) }

function passwordProblem(pw) {
  if (String(pw).length < 8) return 'Password must be at least 8 characters.'
  if (String(pw).length > 128) return 'That password is too long.'
  return null
}

function sha256(text) {
  var bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    String(text),
    Utilities.Charset.UTF_8,
  )
  return bytes.map(function (b) {
    return ('0' + (b & 0xff).toString(16)).slice(-2)
  }).join('')
}

/**
 * Apps Script has no bcrypt or scrypt. Salted SHA-256, stretched by repeated
 * hashing, is the strongest option available here. It is good protection for
 * a leaked sheet but is not equivalent to bcrypt — see apps-script/README.md.
 */
function hashPassword(password, salt) {
  var digest = sha256(salt + '|' + password)
  for (var i = 0; i < 600; i++) digest = sha256(digest + salt)
  return digest
}

function randomToken(length) {
  var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  var out = ''
  for (var i = 0; i < length; i++) {
    out += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return out
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function friendlyError(err) {
  var msg = String((err && err.message) || err)
  console.error(msg)
  return 'Something went wrong on our side. Please try again.'
}
