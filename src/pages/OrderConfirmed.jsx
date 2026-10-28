import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Package, Mail, MapPin } from 'lucide-react'
import { formatPrice } from '../utils/format'
import { apiConfigured } from '../utils/api'
import { usePageTitle } from '../hooks/usePageTitle'

const PAYMENT_LABELS = {
  cod: 'Cash on delivery',
  card: 'Card payment',
  wallet: 'Mobile wallet',
}

/** Router state is lost on refresh, so fall back to the copy checkout stored. */
function readStoredOrder() {
  try {
    const stored = JSON.parse(window.localStorage.getItem('pc.lastOrder'))
    // Ignore anything that is not shaped like an order rather than crash on it.
    return stored?.customer && stored?.totals && Array.isArray(stored?.items) ? stored : null
  } catch {
    return null
  }
}

/* Only cash on delivery is settled in person; online methods are not charged by the site. */
const paymentSummary = (method) =>
  method === 'cod'
    ? PAYMENT_LABELS.cod
    : PAYMENT_LABELS[method]
      ? `${PAYMENT_LABELS[method]} · not charged yet`
      : 'Confirmed'

export default function OrderConfirmed() {
  usePageTitle('Order confirmed')
  const location = useLocation()
  const [order] = useState(() => location.state?.order ?? readStoredOrder())

  if (!order) {
    return (
      <div className="container-px flex flex-col items-center gap-5 py-28 text-center">
        <h1 className="font-display text-3xl text-ink-900">No recent order</h1>
        <p className="max-w-sm text-sm text-ink-400">
          We could not find an order to show. If you just placed one, a confirmation is
          on its way to your email.
        </p>
        <Link to="/shop" className="btn-primary mt-2">
          Back to shopping
        </Link>
      </div>
    )
  }

  /* Four days from when the order was placed, not from now — so reopening the
     page later still shows the date the customer was originally quoted. */
  const eta = new Date(
    new Date(order.placedAt).getTime() + 4 * 24 * 60 * 60 * 1000,
  ).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className="container-px py-12 lg:py-20">
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 14, stiffness: 220 }}
          className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-green-600 text-white"
        >
          <Check size={36} strokeWidth={3} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-8 text-center"
        >
          <h1 className="font-display text-3xl text-ink-900 sm:text-4xl">
            Thank you, {order.customer.name.split(' ')[0]}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-500">
            Your order is confirmed.{' '}
            {apiConfigured ? (
              <>
                We have sent the details to{' '}
                <span className="font-medium text-ink-900">{order.customer.email}</span>.
              </>
            ) : (
              'Keep your order number to hand if you contact us.'
            )}
          </p>
          <p className="mt-5 inline-block rounded-full bg-ink-50 px-5 py-2 text-sm">
            Order number{' '}
            <span className="font-semibold tracking-wider text-ink-900">{order.id}</span>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="mt-10 grid gap-4 sm:grid-cols-3"
        >
          {[
            { icon: Package, title: 'Arriving by', value: eta },
            { icon: MapPin, title: 'Delivering to', value: order.customer.city },
            {
              icon: Mail,
              title: 'Payment',
              value: paymentSummary(order.payment),
            },
          ].map(({ icon: Icon, title, value }) => (
            <div
              key={title}
              className="rounded-xl border border-ink-100 p-4 text-center sm:text-left"
            >
              <Icon size={17} className="mx-auto text-gold-600 sm:mx-0" />
              <p className="mt-2.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-400">
                {title}
              </p>
              <p className="mt-1 text-sm font-medium text-ink-900">{value}</p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          className="mt-8 rounded-2xl border border-ink-100 p-6"
        >
          <h2 className="font-display text-xl text-ink-900">Order summary</h2>

          <ul className="mt-5 divide-y divide-ink-50">
            {order.items.map((item, i) => (
              <li key={i} className="flex items-center gap-4 py-3.5">
                <img src={item.image} alt="" className="h-16 w-13 rounded-lg object-cover" style={{ width: '3.25rem' }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-900">{item.name}</p>
                  <p className="mt-0.5 text-xs text-ink-400">
                    {item.size} · {item.color} · Qty {item.quantity}
                  </p>
                </div>
                <span className="text-sm font-semibold text-ink-900">
                  {formatPrice(item.lineTotal ?? item.unitPrice * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-5 space-y-2.5 border-t border-ink-100 pt-5 text-sm">
            <div className="flex justify-between text-ink-600">
              <dt>Subtotal</dt>
              <dd>{formatPrice(order.totals.subtotal)}</dd>
            </div>
            <div className="flex justify-between text-ink-600">
              <dt>Delivery</dt>
              <dd>
                {order.totals.shipping === 0 ? 'Free' : formatPrice(order.totals.shipping)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-ink-100 pt-3">
              <dt className="font-display text-lg text-ink-900">
                {order.payment === 'cod' ? 'Total due on delivery' : 'Order total'}
              </dt>
              <dd className="font-display text-lg text-ink-900">
                {formatPrice(order.totals.total)}
              </dd>
            </div>
          </dl>

          <div className="mt-6 rounded-xl bg-ink-50/70 p-4 text-sm text-ink-600">
            <p className="font-medium text-ink-900">Delivery address</p>
            <p className="mt-1.5 leading-relaxed">
              {order.customer.name}
              <br />
              {order.customer.address}
              <br />
              {order.customer.city}
              {order.customer.postal ? ` ${order.customer.postal}` : ''}
              <br />
              {order.customer.phone}
            </p>
          </div>
        </motion.div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/shop" className="btn-primary">
            Continue shopping
          </Link>
          <Link to="/contact" className="btn-outline">
            Need help?
          </Link>
        </div>
      </div>
    </div>
  )
}
