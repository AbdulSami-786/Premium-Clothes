import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Minus, Plus, ShoppingBag, Trash2, Truck, X } from 'lucide-react'
import { useShop } from '../context/ShopContext'
import { formatPrice, FREE_SHIPPING_THRESHOLD } from '../utils/format'

export default function CartDrawer() {
  const { cartOpen, closeCart, items, totals, updateQuantity, removeLine, count } = useShop()

  useEffect(() => {
    document.body.style.overflow = cartOpen ? 'hidden' : ''
    const onKey = (e) => e.key === 'Escape' && closeCart()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [cartOpen, closeCart])

  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - totals.subtotal, 0)
  const progress = Math.min((totals.subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-[70] bg-ink-900/50 backdrop-blur-sm"
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Shopping bag"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col bg-white"
          >
            <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
              <h2 className="font-display text-xl text-ink-900">
                Your Bag{' '}
                <span className="text-sm font-sans text-ink-400">({count})</span>
              </h2>
              <button
                type="button"
                onClick={closeCart}
                aria-label="Close bag"
                className="grid h-10 w-10 place-items-center rounded-full text-ink-600 transition-colors hover:bg-ink-50"
              >
                <X size={20} />
              </button>
            </div>

            {items.length > 0 && (
              <div className="border-b border-ink-100 px-5 py-4">
                <div className="mb-2 flex items-center gap-2 text-xs text-ink-600">
                  <Truck size={14} className="text-gold-600" />
                  {remaining > 0 ? (
                    <span>
                      Add <strong className="text-ink-900">{formatPrice(remaining)}</strong>{' '}
                      for free delivery
                    </span>
                  ) : (
                    <span className="font-medium text-ink-900">
                      Free delivery unlocked
                    </span>
                  )}
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-ink-100">
                  <motion.div
                    className="h-full rounded-full bg-gold-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </div>
            )}

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-ink-50 text-ink-300">
                  <ShoppingBag size={26} />
                </div>
                <p className="font-display text-xl text-ink-900">Your bag is empty</p>
                <p className="text-sm text-ink-400">
                  Browse the stitched and unstitched collections to get started.
                </p>
                <button type="button" onClick={closeCart} className="btn-primary mt-2">
                  Continue shopping
                </button>
              </div>
            ) : (
              <>
                <ul className="flex-1 overflow-y-auto px-5 py-4">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.li
                        key={item.key}
                        layout
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.25 }}
                        className="mb-4 flex gap-4 border-b border-ink-50 pb-4 last:border-0"
                      >
                        <Link
                          to={`/product/${item.product.id}`}
                          onClick={closeCart}
                          className="shrink-0"
                        >
                          <img
                            src={item.image}
                            alt={item.product.name}
                            className="h-28 w-22 rounded-lg object-cover"
                            style={{ width: '5.5rem' }}
                          />
                        </Link>

                        <div className="flex min-w-0 flex-1 flex-col">
                          <Link
                            to={`/product/${item.product.id}`}
                            onClick={closeCart}
                            className="text-sm font-medium leading-snug text-ink-900 hover:text-gold-700"
                          >
                            {item.product.name}
                          </Link>
                          <p className="mt-1 text-xs text-ink-400">
                            {item.size} · {item.color}
                          </p>

                          <div className="mt-auto flex items-center justify-between pt-3">
                            <div className="flex items-center rounded-full border border-ink-200">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.key, item.quantity - 1)}
                                aria-label="Decrease quantity"
                                className="grid h-8 w-8 place-items-center rounded-full text-ink-600 transition-colors hover:bg-ink-50"
                              >
                                <Minus size={13} />
                              </button>
                              <span className="w-7 text-center text-sm font-medium text-ink-900">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.key, item.quantity + 1)}
                                aria-label="Increase quantity"
                                className="grid h-8 w-8 place-items-center rounded-full text-ink-600 transition-colors hover:bg-ink-50"
                              >
                                <Plus size={13} />
                              </button>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-sm font-semibold text-ink-900">
                                {formatPrice(item.lineTotal)}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeLine(item.key)}
                                aria-label={`Remove ${item.product.name}`}
                                className="text-ink-300 transition-colors hover:text-blush-600"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>

                <div className="border-t border-ink-100 px-5 py-5">
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between text-ink-600">
                      <dt>Subtotal</dt>
                      <dd className="font-medium text-ink-900">
                        {formatPrice(totals.subtotal)}
                      </dd>
                    </div>
                    {totals.savings > 0 && (
                      <div className="flex justify-between text-blush-600">
                        <dt>You save</dt>
                        <dd>−{formatPrice(totals.savings)}</dd>
                      </div>
                    )}
                    <div className="flex justify-between text-ink-600">
                      <dt>Delivery</dt>
                      <dd className="font-medium text-ink-900">
                        {totals.shipping === 0 ? 'Free' : formatPrice(totals.shipping)}
                      </dd>
                    </div>
                    <div className="flex justify-between border-t border-ink-100 pt-3 text-base">
                      <dt className="font-display text-lg text-ink-900">Total</dt>
                      <dd className="font-semibold text-ink-900">
                        {formatPrice(totals.total)}
                      </dd>
                    </div>
                  </dl>

                  <Link to="/checkout" onClick={closeCart} className="btn-primary mt-5 w-full">
                    Checkout
                  </Link>
                  <Link
                    to="/cart"
                    onClick={closeCart}
                    className="mt-3 block text-center text-xs font-semibold uppercase tracking-[0.16em] text-ink-500 transition-colors hover:text-ink-900"
                  >
                    View full bag
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
