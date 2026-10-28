import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, Truck } from 'lucide-react'
import Breadcrumbs from '../components/Breadcrumbs'
import { useShop } from '../context/ShopContext'
import { formatPrice, FREE_SHIPPING_THRESHOLD } from '../utils/format'
import { usePageTitle } from '../hooks/usePageTitle'

export default function Cart() {
  usePageTitle('Shopping bag')
  const { items, totals, updateQuantity, removeLine, clearCart, count } = useShop()
  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - totals.subtotal, 0)

  return (
    <div className="container-px py-8 lg:py-12">
      <Breadcrumbs trail={[{ label: 'Shopping Bag' }]} />

      <h1 className="mt-6 font-display text-3xl text-ink-900 sm:text-4xl">
        Shopping Bag
        {count > 0 && <span className="ml-3 text-lg font-sans text-ink-400">({count})</span>}
      </h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-5 py-24 text-center">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-ink-50 text-ink-300">
            <ShoppingBag size={32} />
          </div>
          <h2 className="font-display text-2xl text-ink-900">Your bag is empty</h2>
          <p className="max-w-sm text-sm text-ink-400">
            Once you add something it will show up here, and stay put even if you close
            the tab.
          </p>
          <Link to="/shop" className="btn-primary mt-2">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-3 lg:gap-14">
          <div className="lg:col-span-2">
            {remaining > 0 && (
              <div className="mb-6 flex items-center gap-3 rounded-xl bg-gold-50 px-4 py-3 text-sm text-ink-700">
                <Truck size={17} className="shrink-0 text-gold-600" />
                <span>
                  Spend <strong>{formatPrice(remaining)}</strong> more to get free delivery.
                </span>
              </div>
            )}

            <ul className="divide-y divide-ink-100 border-y border-ink-100">
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <motion.li
                    key={item.key}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex gap-4 py-6 sm:gap-6"
                  >
                    <Link to={`/product/${item.product.id}`} className="shrink-0">
                      <img
                        src={item.image}
                        alt={item.product.name}
                        className="h-36 w-28 rounded-xl object-cover sm:h-44 sm:w-36"
                      />
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <Link
                            to={`/product/${item.product.id}`}
                            className="font-display text-lg leading-snug text-ink-900 transition-colors hover:text-gold-700"
                          >
                            {item.product.name}
                          </Link>
                          <p className="mt-1.5 text-xs text-ink-400">
                            {item.product.fabric}
                          </p>
                          <p className="mt-1 text-xs text-ink-500">
                            Size {item.size} · {item.color}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeLine(item.key)}
                          aria-label={`Remove ${item.product.name}`}
                          className="shrink-0 text-ink-300 transition-colors hover:text-blush-600"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>

                      <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-4">
                        <div className="flex items-center rounded-full border border-ink-200">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.key, item.quantity - 1)}
                            aria-label="Decrease quantity"
                            className="grid h-9 w-9 place-items-center rounded-full text-ink-600 transition-colors hover:bg-ink-50"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold text-ink-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.key, item.quantity + 1)}
                            aria-label="Increase quantity"
                            className="grid h-9 w-9 place-items-center rounded-full text-ink-600 transition-colors hover:bg-ink-50"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="font-semibold text-ink-900">
                            {formatPrice(item.lineTotal)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-xs text-ink-400">
                              {formatPrice(item.unitPrice)} each
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <Link
                to="/shop"
                className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-600 transition-colors hover:text-ink-900"
              >
                ← Continue shopping
              </Link>
              <button
                type="button"
                onClick={clearCart}
                className="text-xs font-medium text-ink-400 transition-colors hover:text-blush-600"
              >
                Clear bag
              </button>
            </div>
          </div>

          <aside className="lg:sticky lg:top-28 lg:h-fit">
            <div className="rounded-2xl border border-ink-100 bg-ink-50/50 p-6">
              <h2 className="font-display text-xl text-ink-900">Order summary</h2>

              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between text-ink-600">
                  <dt>Subtotal</dt>
                  <dd className="font-medium text-ink-900">
                    {formatPrice(totals.subtotal)}
                  </dd>
                </div>
                {totals.savings > 0 && (
                  <div className="flex justify-between text-blush-600">
                    <dt>Discount</dt>
                    <dd>−{formatPrice(totals.savings)}</dd>
                  </div>
                )}
                <div className="flex justify-between text-ink-600">
                  <dt>Delivery</dt>
                  <dd className="font-medium text-ink-900">
                    {totals.shipping === 0 ? 'Free' : formatPrice(totals.shipping)}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-ink-200 pt-4">
                  <dt className="font-display text-lg text-ink-900">Total</dt>
                  <dd className="font-display text-lg text-ink-900">
                    {formatPrice(totals.total)}
                  </dd>
                </div>
              </dl>

              <Link to="/checkout" className="btn-primary group mt-6 w-full">
                Proceed to checkout
                <ArrowRight
                  size={15}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>

              <p className="mt-4 text-center text-[0.7rem] leading-relaxed text-ink-400">
                Taxes included. Cash on delivery available nationwide.
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
