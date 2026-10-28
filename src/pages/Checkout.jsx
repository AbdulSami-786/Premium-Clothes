import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Banknote, Check, CreditCard, Lock, Smartphone } from 'lucide-react'
import Breadcrumbs from '../components/Breadcrumbs'
import Alert from '../components/Alert'
import { useShop } from '../context/ShopContext'
import { useAuth } from '../context/AuthContext'
import { api, apiConfigured } from '../utils/api'
import { formatPrice } from '../utils/format'
import { ONLINE_PAYMENTS } from '../data/config'

const STEPS = ['Contact', 'Delivery', 'Payment']

const ALL_PAYMENT_METHODS = [
  {
    id: 'cod',
    icon: Banknote,
    label: 'Cash on delivery',
    hint: 'Pay the courier when your order arrives',
  },
  {
    id: 'card',
    icon: CreditCard,
    label: 'Credit / debit card',
    hint: 'Visa and Mastercard accepted',
  },
  {
    id: 'wallet',
    icon: Smartphone,
    label: 'EasyPaisa / JazzCash',
    hint: 'Confirm the payment on your phone',
  },
]

/* Online methods stay hidden until a gateway is connected — see ONLINE_PAYMENTS. */
const PAYMENT_METHODS = ALL_PAYMENT_METHODS.filter((m) => ONLINE_PAYMENTS || m.id === 'cod')

const CITIES = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Hyderabad',
  'Sialkot',
]

const EMPTY_FORM = {
  email: '',
  phone: '',
  firstName: '',
  lastName: '',
  address: '',
  city: CITIES[0],
  postal: '',
  notes: '',
  payment: 'cod',
  cardNumber: '',
  cardExpiry: '',
  cardCvc: '',
}

const digitsOnly = (value) => value.replace(/\D/g, '')

/** Standard card-number checksum, so a mistyped digit is caught before submitting. */
const passesLuhn = (number) => {
  let sum = 0
  let double = false
  for (let i = number.length - 1; i >= 0; i--) {
    let digit = Number(number[i])
    if (double) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    double = !double
  }
  return sum % 10 === 0
}

const expiryInPast = (mm, yy) => {
  const now = new Date()
  const year = 2000 + Number(yy)
  const month = Number(mm)
  return year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)
}

/* Typing helpers: keep only digits and add the separators as the shopper types. */
const formatCardNumber = (value) =>
  digitsOnly(value).slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ')

const formatExpiry = (value) => {
  const d = digitsOnly(value).slice(0, 4)
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
}

/** Waits for the stored session to be checked so the form can be pre-filled once. */
export default function Checkout() {
  const { ready } = useAuth()

  if (!ready) {
    return (
      <div className="container-px flex min-h-[50vh] items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-ink-200 border-t-ink-900" />
      </div>
    )
  }
  return <CheckoutForm />
}

function CheckoutForm() {
  const { items, totals, clearCart } = useShop()
  const { token, user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  /* A signed-in shopper starts with their details already filled in. */
  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM,
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    firstName: user?.name?.split(' ')[0] ?? '',
    lastName: user?.name?.split(' ').slice(1).join(' ') ?? '',
  }))
  const [errors, setErrors] = useState({})
  const [placing, setPlacing] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const set = (field) => (e) => {
    const value = e.target.value
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
  }

  const setFormatted = (field, format) => (e) => {
    const value = format(e.target.value)
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
  }

  /* Validation runs per step so the shopper is never shown errors for fields
     they have not reached yet. */
  const validateStep = (index) => {
    const next = {}
    if (index === 0) {
      if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address'
      if (form.phone.replace(/\D/g, '').length < 10)
        next.phone = 'Enter a valid phone number'
    }
    if (index === 1) {
      if (!form.firstName.trim()) next.firstName = 'Required'
      if (!form.lastName.trim()) next.lastName = 'Required'
      if (form.address.trim().length < 8) next.address = 'Enter your full street address'
    }
    if (index === 2 && form.payment === 'card') {
      const number = digitsOnly(form.cardNumber)
      if (number.length < 13 || number.length > 19 || !passesLuhn(number))
        next.cardNumber = 'Enter a valid card number'

      const expiry = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(form.cardExpiry)
      if (!expiry) next.cardExpiry = 'Use MM/YY'
      else if (expiryInPast(expiry[1], expiry[2])) next.cardExpiry = 'Card has expired'

      if (!/^\d{3,4}$/.test(form.cardCvc)) next.cardCvc = '3 or 4 digits'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const advance = () => {
    if (!validateStep(step)) return
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const placeOrder = (e) => {
    e.preventDefault()

    /* This form submits in three ways: the Place order button, Enter in a
       field, and — because React's onClick runs first and advances the step —
       a click on Continue. Only the first should ever place an order, so the
       other two just move the shopper along. */
    const fromPlaceOrder = e.nativeEvent?.submitter?.dataset?.role === 'place-order'
    if (!fromPlaceOrder) {
      advance()
      return
    }

    if (placing) return
    if (!validateStep(2)) return

    submitOrder()
  }

  const submitOrder = async () => {
    setPlacing(true)
    setSubmitError('')

    const customer = {
      name: `${form.firstName} ${form.lastName}`.trim(),
      email: form.email,
      phone: form.phone,
      address: form.address,
      city: form.city,
      postal: form.postal,
      notes: form.notes,
    }

    try {
      let order

      if (apiConfigured) {
        /* The server recalculates the totals from unit prices, so what it
           returns — not what we sent — is what the customer is shown. */
        const res = await api.createOrder({
          token,
          payment: form.payment,
          customer,
          items: items.map((i) => ({
            productId: i.product.id,
            name: i.product.name,
            image: i.image,
            size: i.size,
            color: i.color,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
        })
        order = res.order
      } else {
        // No backend configured — keep the flow working locally.
        order = {
          id: `PC${Date.now().toString().slice(-8)}`,
          placedAt: new Date().toISOString(),
          status: 'Confirmed',
          payment: form.payment,
          totals,
          customer,
          items: items.map((i) => ({
            productId: i.product.id,
            name: i.product.name,
            image: i.image,
            size: i.size,
            color: i.color,
            quantity: i.quantity,
            lineTotal: i.lineTotal,
          })),
        }
      }

      try {
        window.localStorage.setItem('pc.lastOrder', JSON.stringify(order))
      } catch {
        /* Confirmation page falls back to a generic message without storage. */
      }

      clearCart()
      navigate('/order-confirmed', { state: { order } })
    } catch (err) {
      // The cart is deliberately left intact so nothing is lost on a failure.
      setSubmitError(err.message)
      setPlacing(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="container-px flex flex-col items-center gap-5 py-28 text-center">
        <h1 className="font-display text-3xl text-ink-900">Nothing to check out</h1>
        <p className="max-w-sm text-sm text-ink-400">
          Your bag is empty. Add a piece and the checkout will open up.
        </p>
        <Link to="/shop" className="btn-primary mt-2">
          Browse the collection
        </Link>
      </div>
    )
  }

  return (
    <div className="container-px py-8 lg:py-12">
      <Breadcrumbs trail={[{ label: 'Bag', to: '/cart' }, { label: 'Checkout' }]} />

      <h1 className="mt-6 font-display text-3xl text-ink-900 sm:text-4xl">Checkout</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-5 lg:gap-14">
        <div className="lg:col-span-3">
          <ol className="mb-9 flex items-center">
            {STEPS.map((label, i) => (
              <li key={label} className="flex flex-1 items-center last:flex-none">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-semibold transition-all duration-300 ${
                      i < step
                        ? 'bg-gold-500 text-ink-900'
                        : i === step
                          ? 'bg-ink-900 text-white'
                          : 'bg-ink-100 text-ink-400'
                    }`}
                  >
                    {i < step ? <Check size={14} strokeWidth={3} /> : i + 1}
                  </span>
                  <span
                    className={`hidden text-xs font-semibold uppercase tracking-[0.14em] sm:block ${
                      i <= step ? 'text-ink-900' : 'text-ink-400'
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <span className="mx-3 h-px flex-1 bg-ink-200">
                    <motion.span
                      className="block h-full bg-gold-500"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: i < step ? 1 : 0 }}
                      style={{ transformOrigin: 'left' }}
                      transition={{ duration: 0.4 }}
                    />
                  </span>
                )}
              </li>
            ))}
          </ol>

          <form onSubmit={placeOrder}>
            <AnimatePresence mode="wait">
              {step === 0 && (
                <StepPanel key="contact" title="Contact details">
                  <Field
                    label="Email address"
                    error={errors.email}
                    type="email"
                    value={form.email}
                    onChange={set('email')}
                    placeholder="you@email.com"
                    autoComplete="email"
                  />
                  <Field
                    label="Phone number"
                    error={errors.phone}
                    type="tel"
                    value={form.phone}
                    onChange={set('phone')}
                    placeholder="03XX XXXXXXX"
                    autoComplete="tel"
                  />
                  <p className="text-xs leading-relaxed text-ink-400">
                    We use these only to confirm the order and share tracking updates.
                  </p>
                </StepPanel>
              )}

              {step === 1 && (
                <StepPanel key="delivery" title="Delivery address">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="First name"
                      error={errors.firstName}
                      value={form.firstName}
                      onChange={set('firstName')}
                      autoComplete="given-name"
                    />
                    <Field
                      label="Last name"
                      error={errors.lastName}
                      value={form.lastName}
                      onChange={set('lastName')}
                      autoComplete="family-name"
                    />
                  </div>

                  <Field
                    label="Street address"
                    error={errors.address}
                    value={form.address}
                    onChange={set('address')}
                    placeholder="House / flat, street, area"
                    autoComplete="street-address"
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="label" htmlFor="city">
                        City
                      </label>
                      <select
                        id="city"
                        value={form.city}
                        onChange={set('city')}
                        className="field cursor-pointer"
                      >
                        {CITIES.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <Field
                      label="Postal code (optional)"
                      value={form.postal}
                      onChange={set('postal')}
                      autoComplete="postal-code"
                    />
                  </div>

                  <div>
                    <label className="label" htmlFor="notes">
                      Delivery notes (optional)
                    </label>
                    <textarea
                      id="notes"
                      rows={3}
                      value={form.notes}
                      onChange={set('notes')}
                      placeholder="Landmark, preferred delivery time…"
                      className="field resize-none"
                    />
                  </div>
                </StepPanel>
              )}

              {step === 2 && (
                <StepPanel key="payment" title="Payment method">
                  <div className="space-y-3">
                    {PAYMENT_METHODS.map(({ id, icon: Icon, label, hint }) => (
                      <label
                        key={id}
                        className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all duration-200 ${
                          form.payment === id
                            ? 'border-ink-900 bg-ink-50/60'
                            : 'border-ink-200 hover:border-ink-400'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={id}
                          checked={form.payment === id}
                          onChange={set('payment')}
                          className="sr-only"
                        />
                        <span
                          className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition-colors ${
                            form.payment === id ? 'border-ink-900' : 'border-ink-300'
                          }`}
                        >
                          {form.payment === id && (
                            <motion.span
                              layoutId="payment-dot"
                              className="h-2.5 w-2.5 rounded-full bg-ink-900"
                            />
                          )}
                        </span>
                        <Icon size={19} className="shrink-0 text-ink-500" />
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-ink-900">
                            {label}
                          </span>
                          <span className="block text-xs text-ink-400">{hint}</span>
                        </span>
                      </label>
                    ))}
                  </div>

                  <AnimatePresence>
                    {form.payment === 'card' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-4 rounded-xl bg-ink-50/70 p-5">
                          <Field
                            label="Card number"
                            error={errors.cardNumber}
                            value={form.cardNumber}
                            onChange={setFormatted('cardNumber', formatCardNumber)}
                            placeholder="4242 4242 4242 4242"
                            inputMode="numeric"
                            autoComplete="cc-number"
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <Field
                              label="Expiry"
                              error={errors.cardExpiry}
                              value={form.cardExpiry}
                              onChange={setFormatted('cardExpiry', formatExpiry)}
                              placeholder="MM/YY"
                              inputMode="numeric"
                              autoComplete="cc-exp"
                            />
                            <Field
                              label="CVC"
                              error={errors.cardCvc}
                              value={form.cardCvc}
                              onChange={setFormatted('cardCvc', (v) => digitsOnly(v).slice(0, 4))}
                              placeholder="123"
                              inputMode="numeric"
                              autoComplete="cc-csc"
                            />
                          </div>
                          <p className="flex items-center gap-2 text-xs text-ink-400">
                            <Lock size={12} />
                            This demo does not process real payments.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {form.payment === 'wallet' && (
                    <p className="flex items-center gap-2 text-xs text-ink-400">
                      <Lock size={12} />
                      This demo does not process real payments.
                    </p>
                  )}
                </StepPanel>
              )}
            </AnimatePresence>

            {submitError && (
              <Alert tone="error" className="mt-6">
                {submitError} Your bag has been kept, so nothing is lost.
              </Alert>
            )}

            {/* Gives Enter something to submit on the first two steps, where the
                visible button is a plain "Continue". placeOrder treats it as
                "advance", never as "place the order". */}
            {step < 2 && (
              <button key="enter" type="submit" tabIndex={-1} aria-hidden="true" className="sr-only" />
            )}

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="btn-outline"
                >
                  <ArrowLeft size={15} />
                  Back
                </button>
              ) : (
                <Link to="/cart" className="btn-outline">
                  <ArrowLeft size={15} />
                  Back to bag
                </Link>
              )}

              {step < 2 ? (
                /* Distinct keys stop React reusing this DOM node for the submit
                   button below — otherwise advancing to the payment step turns
                   the button being clicked into "Place order" mid-click, and
                   the browser delivers that click to it. */
                <button
                  key="continue"
                  type="button"
                  onClick={advance}
                  className="btn-primary flex-1 sm:flex-none"
                >
                  Continue
                </button>
              ) : (
                <button
                  key="place-order"
                  type="submit"
                  data-role="place-order"
                  disabled={placing}
                  className="btn-primary flex-1 sm:flex-none"
                >
                  {placing ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Placing order…
                    </>
                  ) : (
                    <>
                      <Lock size={14} />
                      Place order · {formatPrice(totals.total)}
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        <aside className="lg:col-span-2 lg:sticky lg:top-28 lg:h-fit">
          <div className="rounded-2xl border border-ink-100 bg-ink-50/50 p-6">
            <h2 className="font-display text-xl text-ink-900">Your order</h2>

            <ul className="mt-5 max-h-72 space-y-4 overflow-y-auto pr-1">
              {items.map((item) => (
                <li key={item.key} className="flex gap-3">
                  <div className="relative shrink-0">
                    <img
                      src={item.image}
                      alt=""
                      className="h-20 w-16 rounded-lg object-cover"
                    />
                    <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-ink-900 text-[0.6rem] font-bold text-white">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-900">
                      {item.product.name}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-400">
                      {item.size} · {item.color}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-ink-900">
                    {formatPrice(item.lineTotal)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="mt-5 space-y-3 border-t border-ink-200 pt-5 text-sm">
              <div className="flex justify-between text-ink-600">
                <dt>Subtotal</dt>
                <dd className="font-medium text-ink-900">{formatPrice(totals.subtotal)}</dd>
              </div>
              <div className="flex justify-between text-ink-600">
                <dt>Delivery</dt>
                <dd className="font-medium text-ink-900">
                  {totals.shipping === 0 ? 'Free' : formatPrice(totals.shipping)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-ink-200 pt-3">
                <dt className="font-display text-lg text-ink-900">Total</dt>
                <dd className="font-display text-lg text-ink-900">
                  {formatPrice(totals.total)}
                </dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  )
}

function StepPanel({ title, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="space-y-4"
    >
      <h2 className="font-display text-2xl text-ink-900">{title}</h2>
      {children}
    </motion.div>
  )
}

function Field({ label, error, ...props }) {
  const id = label.toLowerCase().replace(/[^a-z]+/g, '-')
  return (
    <div>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={`field ${error ? 'border-blush-500 focus:border-blush-500 focus:ring-blush-500' : ''}`}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs font-medium text-blush-600">{error}</p>}
    </div>
  )
}
