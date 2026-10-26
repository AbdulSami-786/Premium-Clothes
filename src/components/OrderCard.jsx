import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { formatPrice } from '../utils/format'

const STATUS_STYLES = {
  Confirmed: 'bg-ink-100 text-ink-700',
  Packed: 'bg-gold-100 text-gold-800',
  Shipped: 'bg-blue-50 text-blue-800',
  Delivered: 'bg-green-50 text-green-800',
  Cancelled: 'bg-blush-50 text-blush-700',
}

const PAYMENT_LABELS = {
  cod: 'Cash on delivery',
  card: 'Card payment',
  wallet: 'Mobile wallet',
}

export default function OrderCard({ order, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)

  const placed = order.placedAt
    ? new Date(order.placedAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : ''

  const itemCount = order.items.reduce((n, i) => n + i.quantity, 0)

  return (
    <article className="overflow-hidden rounded-2xl border border-ink-100">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full flex-wrap items-center gap-4 p-5 text-left transition-colors hover:bg-ink-50/60"
      >
        <div className="flex -space-x-3">
          {order.items.slice(0, 3).map((item, i) => (
            <img
              key={i}
              src={item.image}
              alt=""
              className="h-14 w-11 rounded-lg border-2 border-white object-cover"
            />
          ))}
          {order.items.length > 3 && (
            <span className="grid h-14 w-11 place-items-center rounded-lg border-2 border-white bg-ink-100 text-xs font-semibold text-ink-600">
              +{order.items.length - 3}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-display text-lg text-ink-900">{order.id}</p>
          <p className="mt-0.5 text-xs text-ink-400">
            {placed} · {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <span
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              STATUS_STYLES[order.status] ?? STATUS_STYLES.Confirmed
            }`}
          >
            {order.status}
          </span>
          <span className="font-semibold text-ink-900">
            {formatPrice(order.totals.total)}
          </span>
          <ChevronDown
            size={17}
            className={`shrink-0 text-ink-400 transition-transform duration-300 ${
              open ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-ink-100 p-5">
              <ul className="divide-y divide-ink-50">
                {order.items.map((item, i) => (
                  <li key={i} className="flex items-center gap-4 py-3">
                    {item.productId ? (
                      <Link to={`/product/${item.productId}`} className="shrink-0">
                        <img
                          src={item.image}
                          alt=""
                          className="h-16 w-12 rounded-lg object-cover"
                        />
                      </Link>
                    ) : (
                      <img
                        src={item.image}
                        alt=""
                        className="h-16 w-12 shrink-0 rounded-lg object-cover"
                      />
                    )}

                    <div className="min-w-0 flex-1">
                      {item.productId ? (
                        <Link
                          to={`/product/${item.productId}`}
                          className="text-sm font-medium text-ink-900 transition-colors hover:text-gold-700"
                        >
                          {item.name}
                        </Link>
                      ) : (
                        <p className="text-sm font-medium text-ink-900">{item.name}</p>
                      )}
                      <p className="mt-0.5 text-xs text-ink-400">
                        {item.size} · {item.color} · Qty {item.quantity}
                      </p>
                    </div>

                    <span className="text-sm font-semibold text-ink-900">
                      {formatPrice(item.lineTotal)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 grid gap-5 border-t border-ink-100 pt-5 sm:grid-cols-2">
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-400">
                    Delivery address
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-600">
                    {order.customer.name}
                    <br />
                    {order.customer.address}
                    <br />
                    {order.customer.city}
                    {order.customer.postal ? ` ${order.customer.postal}` : ''}
                    {order.customer.phone && (
                      <>
                        <br />
                        {order.customer.phone}
                      </>
                    )}
                  </p>
                </div>

                <dl className="space-y-2 text-sm sm:text-right">
                  <div className="flex justify-between sm:block">
                    <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-400">
                      Payment
                    </dt>
                    <dd className="text-ink-700 sm:mt-1">
                      {PAYMENT_LABELS[order.payment] ?? order.payment}
                    </dd>
                  </div>
                  <div className="flex justify-between border-t border-ink-100 pt-2 text-ink-600 sm:justify-end sm:gap-6">
                    <dt>Subtotal</dt>
                    <dd>{formatPrice(order.totals.subtotal)}</dd>
                  </div>
                  <div className="flex justify-between text-ink-600 sm:justify-end sm:gap-6">
                    <dt>Delivery</dt>
                    <dd>
                      {order.totals.shipping === 0
                        ? 'Free'
                        : formatPrice(order.totals.shipping)}
                    </dd>
                  </div>
                  <div className="flex justify-between font-semibold text-ink-900 sm:justify-end sm:gap-6">
                    <dt>Total</dt>
                    <dd>{formatPrice(order.totals.total)}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  )
}
