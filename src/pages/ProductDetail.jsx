import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Check,
  ChevronDown,
  Heart,
  Minus,
  Plus,
  RefreshCw,
  Ruler,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
} from 'lucide-react'
import Breadcrumbs from '../components/Breadcrumbs'
import ProductCard from '../components/ProductCard'
import ProductReviews from '../components/ProductReviews'
import SectionHeading from '../components/SectionHeading'
import NotFound from './NotFound'
import { useShop } from '../context/ShopContext'
import {
  getCategory,
  getCollection,
  getProduct,
  getRelated,
  getShades,
  getSizesFor,
  priceFor,
} from '../data/products'
import { formatPrice, discountPercent } from '../utils/format'

export default function ProductDetail() {
  const { id } = useParams()
  const product = getProduct(id)

  if (!product) return <NotFound />

  /* Keying by id remounts on navigation between products, so every selection
     starts fresh without an effect resetting six pieces of state. */
  return <ProductView key={product.id} product={product} />
}

function ProductView({ product }) {
  const { addToCart, toggleWishlist, isWishlisted } = useShop()

  const [activeImage, setActiveImage] = useState(0)
  /* With only one option there is nothing to choose, so pre-select it. */
  const [size, setSize] = useState(() => {
    const options = getSizesFor(product)
    return options.length === 1 ? options[0] : null
  })
  const [quantity, setQuantity] = useState(1)
  const [error, setError] = useState('')
  const [added, setAdded] = useState(false)
  const sizeRef = useRef(null)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  /* On phones the sticky buy bar replaces the bottom tab bar on this page. */
  useEffect(() => {
    document.body.classList.add('has-buy-bar')
    return () => document.body.classList.remove('has-buy-bar')
  }, [])

  const category = getCategory(product.category)
  const collection = getCollection(product.collection)
  const shades = getShades(product)
  const sizes = getSizesFor(product)
  const price = priceFor(product, size)
  const off = discountPercent(price, product.compareAt)
  const related = getRelated(product)
  const wished = isWishlisted(product.id)
  const color = product.colors[0]

  const handleAdd = () => {
    if (!size) {
      setError(category.type === 'stitched' ? 'Please choose a size first' : 'Please choose a length first')
      sizeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setError('')
    addToCart(product, { size, color, quantity })
    setAdded(true)
    setTimeout(() => setAdded(false), 2200)
  }

  return (
    <div className="container-px py-6 max-lg:pb-24 lg:py-12">
      <Breadcrumbs
        trail={[
          { label: category.short, to: `/category/${category.slug}` },
          { label: collection.short, to: `/collection/${collection.slug}` },
          { label: product.shade },
        ]}
      />

      <div className="mt-5 grid gap-8 lg:mt-8 lg:grid-cols-2 lg:gap-16">
        <Gallery
          images={product.images}
          name={product.name}
          active={activeImage}
          setActive={setActiveImage}
        />

        <div className="lg:py-4">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to={`/collection/${collection.slug}`}
                className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gold-600 transition-colors hover:text-gold-800"
              >
                {collection.name} collection
              </Link>
              {product.badge && (
                <span className="rounded-full bg-ink-900 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-white">
                  {product.badge}
                </span>
              )}
            </div>

            <h1 className="mt-3 font-display text-3xl leading-tight text-ink-900 sm:text-4xl">
              {product.fabric}
              <span className="block text-ink-500">{product.shade}</span>
            </h1>

            {product.reviews > 0 && (
              <div className="mt-3 flex items-center gap-2 text-sm">
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={
                        i < Math.round(product.rating)
                          ? 'fill-gold-400 text-gold-400'
                          : 'text-ink-200'
                      }
                    />
                  ))}
                </span>
                <span className="font-medium text-ink-700">{product.rating}</span>
                <span className="text-ink-400">·</span>
                <a href="#reviews" className="text-ink-400 underline-offset-2 hover:underline">
                  {product.reviews} reviews
                </a>
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-baseline gap-3">
              <span className="font-display text-3xl text-ink-900">
                {product.lengths?.length > 1 && !size && (
                  <span className="mr-2 text-base text-ink-400">From</span>
                )}
                {formatPrice(price)}
              </span>
              {product.compareAt && (
                <>
                  <span className="text-base text-ink-300 line-through">
                    {formatPrice(product.compareAt)}
                  </span>
                  <span className="rounded-full bg-blush-50 px-2.5 py-1 text-xs font-semibold text-blush-700">
                    Save {off}%
                  </span>
                </>
              )}
            </div>
            <p className="mt-1.5 text-xs text-ink-400">Inclusive of all taxes</p>

            <p className="mt-6 text-sm leading-relaxed text-ink-600">
              {product.description}
            </p>

            <div className="mt-7">
              <p className="label">
                Shade: <span className="text-ink-900">{product.shade}</span>
                {shades.length > 1 && (
                  <span className="ml-2 font-normal normal-case tracking-normal text-ink-400">
                    · {shades.length} in this collection
                  </span>
                )}
              </p>
              <div className="flex flex-wrap gap-2.5">
                {shades.map((s) => {
                  const current = s.id === product.id
                  return (
                    <Link
                      key={s.id}
                      to={`/product/${s.id}`}
                      title={s.shade}
                      aria-label={`${s.shade}${current ? ' (selected)' : ''}`}
                      aria-current={current ? 'true' : undefined}
                      className={`group/swatch relative h-12 w-12 overflow-hidden rounded-full ring-offset-2 transition-all duration-300 ${
                        current
                          ? 'ring-2 ring-ink-900'
                          : 'ring-1 ring-ink-200 hover:scale-110 hover:ring-ink-500'
                      }`}
                    >
                      <img src={s.images[0]} alt="" className="h-full w-full object-cover" />
                      {current && (
                        <span className="absolute inset-0 grid place-items-center bg-ink-950/25 text-white">
                          <Check size={16} strokeWidth={3} />
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>

            <div ref={sizeRef} className="mt-6 scroll-mt-28">
              <div className="mb-1.5 flex items-center justify-between">
                <p className="label mb-0">
                  {category.type === 'stitched' ? 'Size' : 'Fabric length'}
                </p>
                <Link
                  to="/size-guide"
                  className="flex items-center gap-1.5 text-[0.7rem] font-medium text-ink-500 transition-colors hover:text-ink-900"
                >
                  <Ruler size={13} />
                  Size guide
                </Link>
              </div>

              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setSize(s)
                      setError('')
                    }}
                    className={`min-h-11 min-w-[3.25rem] rounded-full border px-4 py-2 text-xs font-medium transition-all duration-200 ${
                      size === s
                        ? 'border-ink-900 bg-ink-900 text-white'
                        : 'border-ink-200 text-ink-600 hover:border-ink-900'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-2 text-xs font-medium text-blush-600"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-full border border-ink-200">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="grid h-11 w-11 place-items-center rounded-full text-ink-600 transition-colors hover:bg-ink-50"
                >
                  <Minus size={15} />
                </button>
                <span className="w-9 text-center text-sm font-semibold text-ink-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                  aria-label="Increase quantity"
                  className="grid h-11 w-11 place-items-center rounded-full text-ink-600 transition-colors hover:bg-ink-50"
                >
                  <Plus size={15} />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAdd}
                className={`btn flex-1 min-w-[12rem] ${
                  added ? 'bg-green-700 text-white' : 'bg-ink-900 text-white hover:bg-ink-700'
                } hover:shadow-lift active:scale-[0.98]`}
              >
                {added ? (
                  <>
                    <Check size={16} /> Added to bag
                  </>
                ) : (
                  <>
                    <ShoppingBag size={16} /> Add to bag
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                aria-label={wished ? 'Remove from wishlist' : 'Save to wishlist'}
                aria-pressed={wished}
                className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-ink-200 text-ink-700 transition-all duration-300 hover:border-blush-500 hover:text-blush-600"
              >
                <Heart size={18} className={wished ? 'fill-blush-600 text-blush-600' : ''} />
              </button>
            </div>

            <div className="mt-7 grid gap-3 rounded-2xl bg-ink-50/70 p-5 sm:grid-cols-3">
              {[
                { icon: Truck, text: 'Delivered in 3–5 days' },
                { icon: RefreshCw, text: '7-day easy exchange' },
                { icon: ShieldCheck, text: 'Secure payment' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5">
                  <Icon size={16} className="shrink-0 text-gold-600" />
                  <span className="text-xs text-ink-600">{text}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 divide-y divide-ink-100 border-y border-ink-100">
              <Accordion title="Product details" defaultOpen>
                <ul className="space-y-2">
                  {product.details.map((d) => (
                    <li key={d} className="flex gap-2.5 text-sm text-ink-600">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold-500" />
                      {d}
                    </li>
                  ))}
                  <li className="flex gap-2.5 text-sm text-ink-600">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold-500" />
                    Fabric: {product.fabric} · {product.pieces}{' '}
                    {product.pieces === 1 ? 'piece' : 'pieces'}
                  </li>
                </ul>
              </Accordion>

              <Accordion title="Delivery & returns">
                <div className="space-y-2.5 text-sm leading-relaxed text-ink-600">
                  <p>
                    Orders are dispatched within 24 hours and arrive in 3–5 working days
                    across Pakistan. Free delivery applies over PKR 10,000.
                  </p>
                  <p>
                    Stitched pieces can be exchanged within 7 days if unworn with tags
                    attached. Unstitched fabric cannot be returned once cut.
                  </p>
                </div>
              </Accordion>

              <Accordion title="Care instructions">
                <div className="space-y-2.5 text-sm leading-relaxed text-ink-600">
                  <p>
                    Wash dark and bright colours separately for the first two washes.
                    Turn the garment inside out and dry in shade to protect print and
                    embroidery.
                  </p>
                  <p>Press on medium heat. Avoid direct iron contact on embroidered panels.</p>
                </div>
              </Accordion>
            </div>
          </motion.div>
        </div>
      </div>

      <BuyBar
        price={price}
        size={size}
        added={added}
        onAdd={handleAdd}
        from={product.lengths?.length > 1 && !size}
      />

      <ProductReviews product={product} />

      {related.length > 0 && (
        <section className="mt-20 lg:mt-28">
          <SectionHeading
            eyebrow="You may also like"
            title="From our other collections"
            align="left"
            action={{ label: 'View category', to: `/category/${category.slug}` }}
          />
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

/** Sticky add-to-bag bar for phones; the in-page controls cover larger screens. */
function BuyBar({ price, size, added, onAdd, from }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-4 border-t border-ink-100 bg-white/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl lg:hidden">
      <div className="min-w-0">
        <p className="font-display text-xl leading-none text-ink-900">
          {from && <span className="mr-1 font-sans text-xs text-ink-400">From</span>}
          {formatPrice(price)}
        </p>
        <p className="mt-1 truncate text-[0.68rem] text-ink-400">
          {size ? size : 'Choose an option'}
        </p>
      </div>
      <button
        type="button"
        onClick={onAdd}
        className={`btn flex-1 ${
          added ? 'bg-green-700 text-white' : 'bg-ink-900 text-white hover:bg-ink-700'
        } active:scale-[0.98]`}
      >
        {added ? (
          <>
            <Check size={16} /> Added
          </>
        ) : (
          <>
            <ShoppingBag size={16} /> Add to bag
          </>
        )}
      </button>
    </div>
  )
}

function Gallery({ images, name, active, setActive }) {
  /* Swipe the main photo on touch screens; thumbnails remain for taps. */
  const swipe = (_, info) => {
    if (images.length < 2) return
    if (info.offset.x < -60) setActive((active + 1) % images.length)
    else if (info.offset.x > 60) setActive((active - 1 + images.length) % images.length)
  }

  return (
    <div className="flex flex-col-reverse gap-4 sm:flex-row">
      <div
        className={`no-scrollbar flex gap-3 overflow-x-auto sm:flex-col sm:overflow-visible ${
          images.length < 2 ? 'hidden' : ''
        }`}
      >
        {images.map((src, i) => (
          <button
            key={src + i}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`View image ${i + 1}`}
            aria-current={i === active}
            className={`relative h-24 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-300 ${
              i === active ? 'border-ink-900' : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <img src={src} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>

      <div className="relative flex-1 overflow-hidden rounded-2xl bg-ink-50">
        <AnimatePresence mode="wait">
          <motion.img
            key={images[active]}
            src={images[active]}
            alt={name}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            drag={images.length > 1 ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.25}
            onDragEnd={swipe}
            className="aspect-[3/4] w-full touch-pan-y object-cover"
          />
        </AnimatePresence>
      </div>
    </div>
  )
}

function Accordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="text-sm font-semibold text-ink-900">{title}</span>
        <ChevronDown
          size={17}
          className={`shrink-0 text-ink-400 transition-transform duration-300 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
