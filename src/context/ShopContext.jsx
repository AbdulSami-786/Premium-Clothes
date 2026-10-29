import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { getProduct, imageFor, priceFor } from '../data/products'
import { lineKey, shippingFor } from '../utils/format'
import { useAuth } from './AuthContext'
import { api, apiConfigured } from '../utils/api'

const ShopContext = createContext(null)

/* Shape checks for what comes back from storage — see useLocalStorage. */
const isCartLines = (v) =>
  Array.isArray(v) &&
  v.every((l) => l && typeof l.key === 'string' && typeof l.productId === 'string' && l.quantity > 0)
const isIdList = (v) => Array.isArray(v) && v.every((id) => typeof id === 'string')

export function ShopProvider({ children }) {
  /* Cart lines store only ids and variant choices; product detail is looked up
     at render time so a price change in the data file is picked up everywhere. */
  const [lines, setLines] = useLocalStorage('pc.cart', [], isCartLines)
  const [wishlist, setWishlist] = useLocalStorage('pc.wishlist', [], isIdList)
  const [cartOpen, setCartOpen] = useState(false)
  const [lastAdded, setLastAdded] = useState(null)

  const { token, isAuthed } = useAuth()
  /* Guards the one-off merge so it runs once per sign-in, not on every render
     that happens to change the wishlist. */
  const syncedFor = useRef(null)

  const addToCart = useCallback(
    (product, { size, color, quantity = 1, stitch = null }) => {
      const key = lineKey(product.id, size, color, stitch)
      setLines((prev) => {
        const existing = prev.find((l) => l.key === key)
        if (existing) {
          return prev.map((l) =>
            l.key === key ? { ...l, quantity: Math.min(l.quantity + quantity, 99) } : l,
          )
        }
        return [...prev, { key, productId: product.id, size, color, stitch, quantity }]
      })
      setLastAdded({ id: product.id, at: Date.now() })
      setCartOpen(true)
    },
    [setLines],
  )

  const updateQuantity = useCallback(
    (key, quantity) => {
      setLines((prev) =>
        quantity <= 0
          ? prev.filter((l) => l.key !== key)
          : prev.map((l) => (l.key === key ? { ...l, quantity: Math.min(quantity, 99) } : l)),
      )
    },
    [setLines],
  )

  const removeLine = useCallback(
    (key) => setLines((prev) => prev.filter((l) => l.key !== key)),
    [setLines],
  )

  const clearCart = useCallback(() => setLines([]), [setLines])

  /* On sign-in, merge whatever was saved as a guest with the account's list.
     On sign-out the local list stays, so the visitor keeps browsing with it. */
  useEffect(() => {
    if (!apiConfigured || !isAuthed || !token) {
      if (!isAuthed) syncedFor.current = null
      return
    }
    if (syncedFor.current === token) return
    syncedFor.current = token

    let cancelled = false
    api
      .syncWishlist(token, wishlist)
      .then((res) => {
        if (!cancelled) setWishlist(res.productIds)
      })
      .catch(() => {
        /* Offline or backend down — the local list is still usable. */
      })

    return () => {
      cancelled = true
    }
    // `wishlist` is read once at merge time on purpose; adding it here would
    // re-run the merge on every toggle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthed, token, setWishlist])

  const toggleWishlist = useCallback(
    (productId) => {
      /* Update locally first so the heart responds instantly, then tell the
         server. A failed write leaves the local list as the source of truth
         until the next sign-in merge. */
      setWishlist((prev) =>
        prev.includes(productId)
          ? prev.filter((id) => id !== productId)
          : [...prev, productId],
      )

      if (apiConfigured && token) {
        api.toggleWishlist(token, productId).catch(() => {})
      }
    },
    [setWishlist, token],
  )

  const isWishlisted = useCallback((id) => wishlist.includes(id), [wishlist])

  /* Join cart lines to products once, and drop any line whose product no longer
     exists in the catalogue (e.g. after the data file is edited). */
  const items = useMemo(
    () =>
      lines
        .map((line) => {
          const product = getProduct(line.productId)
          if (!product) return null
          const unitPrice = priceFor(product, line.size, line.stitch)
          return {
            ...line,
            product,
            unitPrice,
            image: imageFor(product, line.color),
            lineTotal: unitPrice * line.quantity,
          }
        })
        .filter(Boolean),
    [lines],
  )

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0)
    const savings = items.reduce(
      (sum, i) =>
        sum + (i.product.compareAt ? (i.product.compareAt - i.unitPrice) * i.quantity : 0),
      0,
    )
    const shipping = shippingFor(subtotal)
    return { subtotal, savings, shipping, total: subtotal + shipping }
  }, [items])

  const count = useMemo(() => items.reduce((n, i) => n + i.quantity, 0), [items])

  const value = useMemo(
    () => ({
      items,
      totals,
      count,
      cartOpen,
      lastAdded,
      wishlist,
      openCart: () => setCartOpen(true),
      closeCart: () => setCartOpen(false),
      addToCart,
      updateQuantity,
      removeLine,
      clearCart,
      toggleWishlist,
      isWishlisted,
    }),
    [
      items,
      totals,
      count,
      cartOpen,
      lastAdded,
      wishlist,
      addToCart,
      updateQuantity,
      removeLine,
      clearCart,
      toggleWishlist,
      isWishlisted,
    ],
  )

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}

export function useShop() {
  const ctx = useContext(ShopContext)
  if (!ctx) throw new Error('useShop must be used inside <ShopProvider>')
  return ctx
}
