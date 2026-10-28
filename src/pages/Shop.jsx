import { useMemo, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { SlidersHorizontal, X, Check, PackageOpen, MessageCircle, Scissors } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import Breadcrumbs from '../components/Breadcrumbs'
import Reveal from '../components/Reveal'
import {
  CATEGORIES,
  COLLECTIONS,
  PRICE_BOUNDS,
  PRODUCTS,
  getCategory,
  getCollection,
  getCollectionsByCategory,
} from '../data/products'
import { formatPrice } from '../utils/format'
import { STORE_LINKS } from '../data/config'
import NotFound from './NotFound'

const HAS_RATINGS = PRODUCTS.some((p) => p.rating > 0)

/* "Top rated" only means something once products carry ratings. */
const SORTS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  ...(HAS_RATINGS ? [{ value: 'rating', label: 'Top rated' }] : []),
  { value: 'name', label: 'Alphabetical' },
]

export default function Shop({ mode = 'all' }) {
  const params = useParams()
  const [searchParams] = useSearchParams()
  const query = (searchParams.get('q') ?? '').trim().toLowerCase()

  const category = mode === 'category' ? getCategory(params.slug) : null
  const collection =
    mode === 'collection' ? getCollection(params.slug) : null

  const [sort, setSort] = useState('featured')
  const [lines, setLines] = useState([])
  const [types, setTypes] = useState([])
  const [maxPrice, setMaxPrice] = useState(PRICE_BOUNDS.max)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const base = useMemo(() => {
    if (category) return PRODUCTS.filter((p) => p.category === category.slug)
    if (collection) return PRODUCTS.filter((p) => p.collection === collection.slug)
    return PRODUCTS
  }, [category, collection])

  const results = useMemo(() => {
    let list = base.filter((p) => {
      const cat = getCategory(p.category)
      if (query) {
        const haystack = `${p.name} ${p.fabric} ${p.shade} ${p.category} ${p.description}`.toLowerCase()
        if (!haystack.includes(query)) return false
      }
      if (lines.length && !lines.includes(p.collection)) return false
      if (types.length && !types.includes(cat.type)) return false
      if (p.price > maxPrice) return false
      return true
    })

    const sorters = {
      'price-asc': (a, b) => a.price - b.price,
      'price-desc': (a, b) => b.price - a.price,
      rating: (a, b) => b.rating - a.rating,
      name: (a, b) => a.name.localeCompare(b.name),
      featured: (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)),
    }
    return [...list].sort(sorters[sort])
  }, [base, query, lines, types, maxPrice, sort])

  /* A category with no products yet gets a dedicated page instead of an empty grid. */
  const comingSoon = Boolean(category) && base.length === 0

  const activeCount =
    lines.length + types.length + (maxPrice < PRICE_BOUNDS.max ? 1 : 0)

  const clearAll = () => {
    setLines([])
    setTypes([])
    setMaxPrice(PRICE_BOUNDS.max)
  }

  const toggle = (setter) => (value) =>
    setter((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]))

  const missing = (mode === 'category' && !category) || (mode === 'collection' && !collection)
  const heading = category?.name ?? collection?.name ?? (query ? `“${query}”` : 'All Products')

  // An unknown category or collection has nothing to show, so its link 404s.
  if (missing) return <NotFound />

  const intro =
    category?.description ??
    collection?.blurb ??
    (query
      ? `Showing everything matching your search.`
      : 'The complete catalogue — shalwar kameez, sherwani and unstitched suiting.')

  const filterProps = {
    lines,
    types,
    maxPrice,
    setMaxPrice,
    toggleLine: toggle(setLines),
    toggleType: toggle(setTypes),
    clearAll,
    activeCount,
    showTypeFilters: !category,
    showLineFilter: !collection,
  }

  return (
    <div className="container-px py-8 lg:py-12">
      <Breadcrumbs
        trail={[
          ...(collection ? [{ label: 'All products', to: '/shop' }] : []),
          { label: heading },
        ]}
      />

      {/* Category pages get a banner image; search and shop-all keep it text-only. */}
      {(category || collection) && (
        <Reveal className="relative mt-5 overflow-hidden rounded-2xl bg-ink-900">
          <img
            src={category?.image ?? collection.image}
            alt=""
            className="h-52 w-full object-cover opacity-60 sm:h-72"
          />
          <div className="absolute inset-0 flex items-end bg-gradient-to-t from-ink-950/90 via-ink-950/35 to-transparent">
            <div className="p-6 sm:p-10">
              {category && (
                <p className="eyebrow text-gold-400">{category.tagline}</p>
              )}
              <h1 className="mt-2 font-display text-3xl text-white sm:text-5xl">
                {heading}
              </h1>
              <p className="mt-3 max-w-xl text-xs leading-relaxed text-ink-200 sm:text-sm">
                {intro}
              </p>
            </div>
          </div>
        </Reveal>
      )}

      {!category && !collection && (
        <Reveal className="mt-6">
          <h1 className="font-display text-3xl text-ink-900 sm:text-4xl">{heading}</h1>
          <p className="mt-2 max-w-xl text-sm text-ink-500">{intro}</p>
        </Reveal>
      )}

      {/* Quick jump between categories and cloths — keeps navigation within reach on phones. */}
      <div className="no-scrollbar -mx-5 mt-8 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0">
        <Chip to="/shop" current={!category && !collection}>
          All
        </Chip>
        {CATEGORIES.map((c) => (
          <Chip
            key={c.slug}
            to={`/category/${c.slug}`}
            current={category?.slug === c.slug || collection?.category === c.slug}
          >
            {c.short}
          </Chip>
        ))}
        <span aria-hidden="true" className="mx-1 w-px shrink-0 self-stretch bg-ink-100" />
        {COLLECTIONS.map((c) => (
          <Chip
            key={c.slug}
            to={`/collection/${c.slug}`}
            current={collection?.slug === c.slug}
            image={c.image}
          >
            {c.short}
          </Chip>
        ))}
      </div>

      {comingSoon ? (
        <ComingSoon category={category} />
      ) : (
      <div className="mt-8 flex gap-10">
        <aside className="hidden w-60 shrink-0 lg:block">
          <FilterPanel {...filterProps} />
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-6 flex items-center justify-between gap-4 border-b border-ink-100 pb-4">
            <p className="text-xs text-ink-500">
              <span className="font-semibold text-ink-900">{results.length}</span>{' '}
              {results.length === 1 ? 'product' : 'products'}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className="flex items-center gap-2 rounded-full border border-ink-200 px-4 py-2 text-xs font-medium text-ink-700 transition-colors hover:border-ink-900 lg:hidden"
              >
                <SlidersHorizontal size={14} />
                Filters
                {activeCount > 0 && (
                  <span className="grid h-4 w-4 place-items-center rounded-full bg-ink-900 text-[0.6rem] text-white">
                    {activeCount}
                  </span>
                )}
              </button>

              <label className="sr-only" htmlFor="sort">
                Sort products
              </label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="cursor-pointer rounded-full border border-ink-200 bg-white px-4 py-2 text-xs font-medium text-ink-700 outline-none transition-colors hover:border-ink-900 focus:border-ink-900"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {results.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-24 text-center">
              <PackageOpen size={40} className="text-ink-200" />
              <p className="font-display text-2xl text-ink-900">No matches</p>
              <p className="max-w-sm text-sm text-ink-400">
                Nothing fits those filters right now. Try widening the price range or
                clearing a collection.
              </p>
              <button type="button" onClick={clearAll} className="btn-outline mt-2">
                Clear filters
              </button>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-6"
            >
              {results.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </motion.div>
          )}
        </div>
      </div>
      )}

      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFiltersOpen(false)}
              className="fixed inset-0 z-50 bg-ink-900/50 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 320 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-6 lg:hidden"
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-display text-xl text-ink-900">Filters</h2>
                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  aria-label="Close filters"
                  className="grid h-9 w-9 place-items-center rounded-full text-ink-500 hover:bg-ink-50"
                >
                  <X size={18} />
                </button>
              </div>

              <FilterPanel {...filterProps} />

              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="btn-primary mt-6 w-full"
              >
                Show {results.length} results
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function Chip({ to, current, image, children }) {
  return (
    <Link
      to={to}
      aria-current={current ? 'page' : undefined}
      className={`flex h-10 shrink-0 items-center gap-2 rounded-full border text-xs font-medium transition-all duration-300 sm:h-9 ${
        image ? 'pl-1.5 pr-4' : 'px-4'
      } ${
        current
          ? 'border-ink-900 bg-ink-900 text-white'
          : 'border-ink-200 text-ink-600 hover:border-ink-900 hover:text-ink-900'
      }`}
    >
      {image && <img src={image} alt="" className="h-6 w-6 rounded-full object-cover" />}
      {children}
    </Link>
  )
}

/** Shown for a category that has no products yet. */
function ComingSoon({ category }) {
  const whatsapp = `${STORE_LINKS.whatsapp}?text=${encodeURIComponent(
    `Hi, I'm interested in ${category.name}.`,
  )}`
  const cloths = getCollectionsByCategory('unstitched')

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 py-16 text-center sm:py-24">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-gold-50 text-gold-600">
        <Scissors size={26} />
      </span>
      <p className="eyebrow">Coming soon</p>
      <h2 className="font-display text-3xl text-ink-900 sm:text-4xl">
        {category.name} is on the loom
      </h2>
      <p className="text-sm leading-relaxed text-ink-500">
        Our ready-to-wear {category.name.toLowerCase()} range is being finished and will
        appear here shortly. Until then you can choose any unstitched cloth and have it
        tailored to your measurements — or message us and we will help you directly.
      </p>
      <div className="mt-2 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        {cloths.length > 0 && (
          <Link to="/category/unstitched" className="btn-primary">
            Browse unstitched
          </Link>
        )}
        <a href={whatsapp} target="_blank" rel="noreferrer noopener" className="btn-outline">
          <MessageCircle size={15} />
          Ask on WhatsApp
        </a>
      </div>
    </div>
  )
}

function FilterPanel({
  lines,
  types,
  maxPrice,
  setMaxPrice,
  toggleLine,
  toggleType,
  clearAll,
  activeCount,
  showTypeFilters,
  showLineFilter,
}) {
  return (
    <div className="space-y-7">
      {activeCount > 0 && (
        <button
          type="button"
          onClick={clearAll}
          className="flex w-full items-center justify-between rounded-lg bg-ink-50 px-3 py-2 text-xs font-medium text-ink-700 transition-colors hover:bg-ink-100"
        >
          Clear all filters
          <X size={13} />
        </button>
      )}

      {showTypeFilters && (
        <>
          <FilterGroup title="Type">
            {[...new Set(CATEGORIES.map((c) => c.type))].map((t) => (
              <CheckRow
                key={t}
                label={t.charAt(0).toUpperCase() + t.slice(1)}
                checked={types.includes(t)}
                onChange={() => toggleType(t)}
              />
            ))}
          </FilterGroup>
        </>
      )}

      {showLineFilter && (
        <FilterGroup title="Collection">
          {COLLECTIONS.map((c) => (
            <CheckRow
              key={c.slug}
              label={c.short}
              checked={lines.includes(c.slug)}
              onChange={() => toggleLine(c.slug)}
            />
          ))}
        </FilterGroup>
      )}

      <FilterGroup title="Max price">
        <input
          type="range"
          min={1000}
          max={PRICE_BOUNDS.max}
          step={500}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          aria-label="Maximum price"
          className="w-full accent-ink-900"
        />
        <div className="flex justify-between text-xs text-ink-500">
          <span>{formatPrice(1000)}</span>
          <span className="font-semibold text-ink-900">{formatPrice(maxPrice)}</span>
        </div>
      </FilterGroup>
    </div>
  )
}

function FilterGroup({ title, children }) {
  return (
    <div>
      <h3 className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-ink-900">
        {title}
      </h3>
      <div className="space-y-2.5">{children}</div>
    </div>
  )
}

function CheckRow({ label, checked, onChange }) {
  return (
    <label className="group flex cursor-pointer items-center gap-2.5 text-sm text-ink-600 transition-colors hover:text-ink-900">
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      <span
        className={`grid h-[1.1rem] w-[1.1rem] shrink-0 place-items-center rounded border transition-all duration-200 ${
          checked
            ? 'border-ink-900 bg-ink-900 text-white'
            : 'border-ink-300 group-hover:border-ink-500'
        }`}
      >
        {checked && <Check size={11} strokeWidth={3} />}
      </span>
      {label}
    </label>
  )
}
