# Google Sheets backend (Apps Script)

`Code.gs` is the whole backend: accounts, password reset, orders, reviews,
wishlist, contact messages and newsletter signups, all stored in one Google
Sheet. It costs nothing to run.

## Setup — about ten minutes

### 1. Create the spreadsheet

Go to [sheets.new](https://sheets.new) and name it something like
**Premium Clothes — Store Data**.

### 2. Add the script

In that sheet: **Extensions → Apps Script**. Delete the sample `myFunction`
code, paste in the entire contents of `Code.gs`, and save (Ctrl+S).

While you are here, open `CONFIG` at the top and set `REPLY_TO` to the address
you want customer emails to reply to.

### 3. Run `setup` once

In the Apps Script toolbar, choose **setup** from the function dropdown and
press **Run**.

Google will ask for permission the first time. It shows a warning screen
because the script is not verified — this is normal for your own scripts:

1. Click **Review permissions**
2. Choose your Google account
3. Click **Advanced**, then **Go to (project name) (unsafe)**
4. Click **Allow**

It needs those permissions to write to your sheet and send email. When it
finishes you will see nine new tabs: Users, Sessions, Orders, OrderItems,
Reviews, Wishlist, Messages, PasswordResets and Newsletter.

### 4. Deploy as a Web App

**Deploy → New deployment**, then:

| Setting | Value |
| --- | --- |
| Type (gear icon) | **Web app** |
| Description | anything, e.g. `v1` |
| Execute as | **Me** |
| Who has access | **Anyone** |

"Anyone" sounds alarming but is required — it means anyone can *call the URL*,
not that anyone can read your sheet. The script decides what each request is
allowed to do. Without it the browser gets Google's login page instead of your
data.

Click **Deploy** and copy the **Web app URL**. It ends in `/exec`.

### 5. Point the site at it

Open `src/data/config.js` and paste the URL in:

```js
export const API_URL = 'https://script.google.com/macros/s/AKfycb.../exec'
```

Save. The "Accounts are not connected yet" notices disappear and sign-up starts
working — the dev server picks the change up on its own.

> Use the `/exec` URL, not `/dev`. The `/dev` one requires a Google login and
> will not work from the site.

The URL ends up in the built JavaScript, where anyone can read it. That is
expected for an Apps Script Web App — the endpoint is public and the script
decides what each request is allowed to do. Do not add anything secret to that
file.

### 6. Optional: automatic cleanup

Run the `installCleanupTrigger` function once to have Google clear expired
sessions and reset codes nightly. Without it nothing breaks — the rows simply
accumulate.

## After you change `Code.gs`

Editing the script is not enough; you must redeploy:

**Deploy → Manage deployments → pencil icon → Version: New version → Deploy**

The URL stays the same, so `src/data/config.js` does not change. If you create
a *new* deployment instead, you get a new URL and must update that file.

## What each sheet holds

| Sheet | Contents |
| --- | --- |
| **Users** | One row per account. `passwordHash` and `salt` — never the password. |
| **Sessions** | Active sign-ins. Deleting a row signs that device out. |
| **Orders** | One row per order, with totals and status. |
| **OrderItems** | One row per line item, linked by `orderId`. |
| **Reviews** | Product reviews. Set `status` to `Hidden` to unpublish one. |
| **Wishlist** | One row per saved product, per user. |
| **Messages** | Contact form submissions. |
| **PasswordResets** | Pending reset codes, hashed. Cleared once used. |
| **Newsletter** | Subscriber email addresses. |

### Running the shop from the sheet

The sheet is the admin panel. Useful things you can do by editing cells:

- **Update an order's status** — change the `status` cell in Orders to
  `Packed`, `Shipped`, `Delivered` or `Cancelled`. The customer sees it on
  their account page and when tracking the order.
- **Hide a review** — set its `status` to `Hidden`.
- **Sign someone out everywhere** — delete their rows from Sessions.
- **Export your mailing list** — File → Download from the Newsletter tab.

Do not rename or reorder the header row; the script reads columns by name.

## Security

What this does:

- Passwords are salted and hashed 600 times with SHA-256. The plain password is
  never stored or emailed.
- Reset codes are stored hashed, expire after 30 minutes, and work once.
- Resetting a password signs out every existing session for that account.
- Failed logins are rate-limited per email address.
- Sign-in and password-reset responses are deliberately vague about whether an
  account exists, so the endpoints cannot be used to harvest customer emails.
- Order totals are recalculated on the server from unit prices, so a modified
  browser cannot change what an order costs.

What you should know:

- **Apps Script has no bcrypt.** Salted, stretched SHA-256 is the strongest
  option available in this environment. It is solid protection if the sheet
  leaks, but it is weaker than bcrypt or Argon2 against a determined attacker
  with the file. If you grow to the point of holding many accounts, move
  authentication to a real backend.
- **There is no payment processing.** Orders are recorded, not charged. Cash on
  delivery works as-is; for card payments you need a real gateway.
- **Google's quotas apply.** A free account sends about 100 emails a day. Past
  that, reset emails stop sending — the code is still written to the sheet, so
  you can read it out manually for a stuck customer.
- **Keep the sheet private.** Anyone you share it with can read every customer
  address and order.

## Troubleshooting

**"The server sent an unexpected response"**
The deployment is not set to "Anyone", so Google is returning a login page.
Redeploy with that access level.

**"Could not reach the server"**
`API_URL` in `src/data/config.js` is wrong or still empty. Check it is the
`/exec` URL and that you saved the file.

**Reset emails never arrive**
Check spam first. Then in the Apps Script editor open **Executions** to see
whether `sendResetEmail` logged a quota error. The code is always written to
the PasswordResets sheet regardless, so you can read it from there.

**Changes to Code.gs have no effect**
You saved but did not redeploy. See "After you change Code.gs" above.

**Everything is slow**
Apps Script reads the whole sheet on most calls. This is fine into the
thousands of rows. Well beyond that, move to a real database.

## API reference

All calls are `POST` to the Web App URL with a JSON body containing an
`action`. Responses are `{ ok: true, ... }` or `{ ok: false, error: "..." }`.

| Action | Needs token | Purpose |
| --- | --- | --- |
| `ping` | — | Health check |
| `signup` | — | Create an account, returns a session token |
| `login` | — | Sign in, returns a session token |
| `logout` | yes | End the session |
| `me` | yes | Current user |
| `updateProfile` | yes | Change name or phone |
| `changePassword` | yes | Change password, signs out other devices |
| `requestReset` | — | Email a six-digit reset code |
| `verifyReset` | — | Check a code without using it |
| `resetPassword` | — | Set a new password with a valid code |
| `createOrder` | optional | Place an order (guest or signed in) |
| `myOrders` | yes | The signed-in customer's orders |
| `getOrder` | optional | One order, by number plus email or token |
| `addReview` | yes | Publish a review, one per product per customer |
| `productReviews` | — | Reviews and rating summary for a product |
| `reviewSummary` | — | Ratings for many products in one call |
| `getWishlist` | yes | Saved product ids |
| `toggleWishlist` | yes | Add or remove one product |
| `syncWishlist` | yes | Merge a guest list into the account |
| `contact` | — | Store a contact message and notify you |
| `subscribe` | — | Add an email to the newsletter |
