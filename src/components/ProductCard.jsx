import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight, Heart, Star, ShoppingBag } from 'lucide-react'
import { useShop } from '../context/ShopContext'
import { getSizesFor } from '../data/products'
import { formatPrice, discountPercent } from '../utils/format'

const BADGE_STYLES = {
  Bestseller: 'bg-ink-900 text-white',
  Limited: 'bg-gold-500 text-ink-900',
  Sale: 'bg-blush-600 text-white',
  New: 'bg-white/95 text-ink-900',
  Premium: 'bg-ink-900 text-gold-300',
}

export default function ProductCard({ product, index = 0, className = '' }) {
  const { addToCart, toggleWishlist, isWishlisted } = useShop()
  const [loaded, setLoaded] = useState(false)
  const imgRef = useRef(null)

  /* A cached image can finish before React attaches onLoad, in which case the
     event never fires and the skeleton would sit there forever. */
  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true)
  }, [])

  const wished = isWishlisted(product.id)
  const off = discountPercent(product.price, product.compareAt)
  const hoverImage = product.images[1]

  /* The first row is above the fold on most screens, so deferring it would
     delay the images that matter most. Everything after it loads lazily. */
  const eager = index < 4

  /* Quick-add picks the first size so the shopper stays in the grid. The
     product page is still where the full choice lives. */
  const quickAdd = (e) => {
    e.preventDefault()
    addToCart(product, {
      size: getSizesFor(product)[0],
      color: product.colors[0],
      quantity: 1,
    })
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: (index % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative ${className}`}
    >
      <Link
        to={`/product/${product.id}`}
        className="block transition-transform duration-500 ease-out group-hover:-translate-y-1.5"
      >
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-ink-50 shadow-[0_1px_2px_rgba(18,18,21,0.06)] ring-1 ring-ink-900/5 transition-shadow duration-500 group-hover:shadow-lift">
          {!loaded && <div className="skeleton absolute inset-0" />}

          <img
            ref={imgRef}
            src={product.images[0]}
            alt={product.name}
            loading={eager ? 'eager' : 'lazy'}
            fetchPriority={eager ? 'high' : 'auto'}
            onLoad={() => setLoaded(true)}
            onError={() => setLoaded(true)}
            className={`absolute inset-0 h-full w-full object-cover transition-all duration-[900ms] ease-out group-hover:scale-[1.08] ${
              loaded ? 'opacity-100' : 'opacity-0'
            } ${hoverImage ? 'group-hover:opacity-0' : ''}`}
          />
          {/* A second shot, when there is one, fades in on hover. */}
          {hoverImage && (
            <img
              src={hoverImage}
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="absolute inset-0 h-full w-full scale-105 object-cover opacity-0 transition-all duration-700 group-hover:scale-100 group-hover:opacity-100"
            />
          )}

          {/* Light sweep across the fabric on hover. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent transition-[left] duration-[1100ms] ease-out group-hover:left-[150%]"
          />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink-950/55 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 max-lg:opacity-100" />

          <div className="absolute left-3 top-3 flex flex-col gap-2">
            {product.badge && (
              <span
                className={`rounded-full px-3 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.16em] shadow-sm backdrop-blur ${
                  BADGE_STYLES[product.badge] ?? 'bg-ink-900 text-white'
                }`}
              >
                {product.badge}
              </span>
            )}
            {off > 0 && (
              <span className="rounded-full bg-white/95 px-3 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-blush-700">
                {off}% off
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              toggleWishlist(product.id)
            }}
            aria-label={wished ? `Remove ${product.name} from wishlist` : `Save ${product.name}`}
            aria-pressed={wished}
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-ink-700 shadow-soft transition-all duration-300 hover:scale-110 hover:text-blush-600 active:scale-90"
          >
            <Heart
              size={16}
              className={`transition-transform duration-300 ${
                wished ? 'scale-110 fill-blush-600 text-blush-600' : ''
              }`}
            />
          </button>

          {/* Slides up on hover; always visible on touch screens where hover
              never fires, so the control is never unreachable. */}
          <div className="absolute inset-x-3 bottom-3 translate-y-4 opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100 max-lg:translate-y-0 max-lg:opacity-100">
            <button
              type="button"
              onClick={quickAdd}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-white/95 py-2.5 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-ink-900 backdrop-blur transition-colors duration-300 hover:bg-ink-900 hover:text-white active:scale-[0.97]"
            >
              <ShoppingBag size={14} />
              Quick add
            </button>
          </div>
        </div>

        <div className="flex items-start gap-3 px-0.5 pt-4">
          <span
            aria-hidden="true"
            className="mt-0.5 h-7 w-7 shrink-0 rounded-full bg-cover bg-center ring-1 ring-ink-900/10 ring-offset-2 transition-transform duration-500 group-hover:scale-110"
            style={{ backgroundImage: `url(${product.images[0]})` }}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-ink-400">
              {product.fabric}
            </p>
            <h3 className="mt-1 flex items-center gap-1 font-display text-lg leading-snug text-ink-900 transition-colors duration-300 group-hover:text-gold-700">
              <span className="truncate">{product.shade ?? product.name}</span>
              <ArrowUpRight
                size={15}
                className="shrink-0 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
              />
            </h3>

            {product.reviews > 0 && (
              <div className="mt-1.5 flex items-center gap-1.5 text-[0.7rem] text-ink-400">
                <Star size={12} className="fill-gold-400 text-gold-400" />
                <span className="font-medium text-ink-600">{product.rating}</span>
                <span>({product.reviews})</span>
              </div>
            )}

            <div className="mt-1.5 flex flex-wrap items-baseline gap-2">
              <span className="text-sm font-semibold text-ink-900">
                {product.lengths?.length > 1 && (
                  <span className="font-normal text-ink-400">From </span>
                )}
                {formatPrice(product.price)}
              </span>
              {product.compareAt && (
                <span className="text-xs text-ink-300 line-through">
                  {formatPrice(product.compareAt)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
