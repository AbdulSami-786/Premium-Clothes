import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  ChevronDown,
  Heart,
  Home,
  Menu,
  Search,
  ShoppingBag,
  Store,
  User,
  X,
} from 'lucide-react'
import { CATEGORIES, PRODUCTS, getCollectionsByCategory } from '../data/products'
import { useShop } from '../context/ShopContext'
import { useAuth } from '../context/AuthContext'
import { formatPrice, FREE_SHIPPING_THRESHOLD } from '../utils/format'
import { STORE, STORE_LINKS } from '../data/config'

/* One tab per category. A category with more than one cloth gets a dropdown of
   those cloths; the rest are plain links. */
const CATEGORY_TABS = CATEGORIES.map((c) => {
  const cloths = getCollectionsByCategory(c.slug)
  return {
    label: c.short,
    to: `/category/${c.slug}`,
    menu: cloths.length > 1 ? cloths : null,
  }
})

const NAV = [
  { label: 'Home', to: '/' },
  ...CATEGORY_TABS,
  { label: 'Shop All', to: '/shop' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState(null)
  const { count, openCart, wishlist } = useShop()
  const { isAuthed, user } = useAuth()
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* Any navigation closes every overlay this header owns. Done while rendering
     (React's pattern for resetting state on a prop change) so the stale overlay
     never paints on the new page. */
  const [shownPath, setShownPath] = useState(location.pathname)
  if (shownPath !== location.pathname) {
    setShownPath(location.pathname)
    setMobileOpen(false)
    setSearchOpen(false)
    setOpenMenu(null)
  }

  useEffect(() => {
    document.body.style.overflow = mobileOpen || searchOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen, searchOpen])

  return (
    <>
      <PromoBar />

      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'border-b border-ink-100 bg-white/90 shadow-soft backdrop-blur-xl'
            : 'border-b border-transparent bg-white'
        }`}
        onMouseLeave={() => setOpenMenu(null)}
      >
        <div className="container-px flex h-16 items-center justify-between gap-4 lg:h-[4.5rem]">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="-ml-2 grid h-11 w-11 place-items-center rounded-full text-ink-800 transition-colors hover:bg-ink-50 lg:hidden"
          >
            <Menu size={21} />
          </button>

          <Link to="/" className="group flex shrink-0 flex-col items-center leading-none lg:items-start">
            <span className="font-display text-xl font-semibold tracking-[0.2em] text-ink-900 sm:text-2xl">
              PREMIUM
            </span>
            <span className="mt-0.5 text-[0.55rem] font-medium uppercase tracking-[0.42em] text-gold-600 transition-all duration-500 group-hover:tracking-[0.5em]">
              Clothes
            </span>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex xl:gap-8" aria-label="Main">
            {NAV.map((item) => (
              <div
                key={item.label}
                className={`relative ${item.to === '/' ? 'hidden xl:block' : ''}`}
                onMouseEnter={() => setOpenMenu(item.menu ? item.label : null)}
              >
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  onFocus={() => setOpenMenu(item.menu ? item.label : null)}
                  className={({ isActive }) =>
                    `link-underline flex items-center gap-1 whitespace-nowrap py-6 text-[0.7rem] font-semibold uppercase tracking-[0.14em] transition-colors xl:text-xs xl:tracking-[0.16em] ${
                      isActive ? 'text-gold-700' : 'text-ink-700 hover:text-ink-900'
                    }`
                  }
                >
                  {item.label}
                  {item.menu && (
                    <ChevronDown
                      size={13}
                      className={`transition-transform duration-300 ${
                        openMenu === item.label ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                </NavLink>
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-0.5 sm:gap-1">
            {/* On phones these live in the bottom tab bar instead. */}
            <IconButton label="Search" onClick={() => setSearchOpen(true)} className="max-lg:hidden">
              <Search size={19} />
            </IconButton>

            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="relative hidden h-10 w-10 place-items-center rounded-full text-ink-800 transition-colors hover:bg-ink-50 lg:grid"
            >
              <Heart size={19} />
              {wishlist.length > 0 && <Dot>{wishlist.length}</Dot>}
            </Link>

            <Link
              to={isAuthed ? '/account' : '/login'}
              aria-label={isAuthed ? `Account, signed in as ${user.name}` : 'Sign in'}
              className="relative hidden h-10 w-10 place-items-center rounded-full text-ink-800 transition-colors hover:bg-ink-50 lg:grid"
            >
              <User size={19} />
              {/* A small dot is enough to show the session is live. */}
              {isAuthed && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-green-600 ring-2 ring-white" />
              )}
            </Link>

            <IconButton label={`Cart, ${count} items`} onClick={openCart} className="max-lg:h-11 max-lg:w-11">
              <ShoppingBag size={20} />
              {count > 0 && <Dot>{count}</Dot>}
            </IconButton>
          </div>
        </div>

        <AnimatePresence>
          {openMenu && (
            <MegaMenu
              key={openMenu}
              label={openMenu}
              items={NAV.find((n) => n.label === openMenu).menu}
              all={NAV.find((n) => n.label === openMenu).to}
            />
          )}
        </AnimatePresence>
      </header>

      <MobileTabBar
        onMenu={() => setMobileOpen(true)}
        onSearch={() => setSearchOpen(true)}
      />

      <AnimatePresence>
        {mobileOpen && <MobileMenu onClose={() => setMobileOpen(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
      </AnimatePresence>
    </>
  )
}

function IconButton({ children, label, onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`relative grid h-10 w-10 place-items-center rounded-full text-ink-800 transition-colors hover:bg-ink-50 ${className}`}
    >
      {children}
    </button>
  )
}

function Dot({ children }) {
  return (
    <motion.span
      key={String(children)}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="absolute -right-1 -top-1 grid h-[1.15rem] min-w-[1.15rem] place-items-center rounded-full bg-gold-500 px-1 text-[0.6rem] font-bold text-ink-900"
    >
      {children}
    </motion.span>
  )
}

function PromoBar() {
  const messages = [
    `Free delivery on orders over ${formatPrice(FREE_SHIPPING_THRESHOLD)}`,
    'New: Embroidered sherwani in five shades',
    'Stitched & unstitched — shipped nationwide',
    'Easy 7-day exchange on stitched pieces',
  ]
  return (
    <div className="overflow-hidden bg-ink-900 py-2.5 text-white">
      <div className="flex w-max animate-marquee gap-12 whitespace-nowrap">
        {/* Duplicated once so the -50% translate loops seamlessly. */}
        {[...messages, ...messages].map((msg, i) => (
          <span
            key={i}
            className="text-[0.65rem] font-medium uppercase tracking-[0.22em] text-ink-100"
          >
            {msg}
          </span>
        ))}
      </div>
    </div>
  )
}

function MegaMenu({ label, items, all }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="absolute inset-x-0 top-full hidden border-t border-ink-100 bg-white shadow-lift lg:block"
    >
      <div className="container-px grid grid-cols-12 gap-10 py-8">
        <div className="col-span-2">
          <p className="eyebrow mb-4">{label}</p>
          <p className="text-sm leading-relaxed text-ink-500">
            Pick a cloth, then pick your shade.
          </p>
          <Link
            to={all}
            className="link-underline mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-gold-700"
          >
            View all
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="col-span-10 grid grid-cols-6 gap-4">
          {items.map((col) => (
            <Link
              key={col.slug}
              to={`/collection/${col.slug}`}
              className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-ink-900"
            >
              <img
                src={col.image}
                alt={col.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-ink-900/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3">
                <p className="font-display text-lg leading-tight text-white">{col.short}</p>
                <p className="text-[0.62rem] uppercase tracking-[0.14em] text-ink-200">
                  {col.products.length} shades
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

/** Fixed bottom bar for phones and tablets — the thumb-reachable shortcuts. */
function MobileTabBar({ onMenu, onSearch }) {
  const { wishlist } = useShop()
  const { isAuthed } = useAuth()

  const base =
    'relative flex min-h-[3.5rem] flex-1 flex-col items-center justify-center gap-1 text-[0.62rem] font-medium tracking-wide transition-colors'
  const link = ({ isActive }) =>
    `${base} ${isActive ? 'text-ink-900' : 'text-ink-400 active:text-ink-900'}`
  const button = `${base} text-ink-400 active:text-ink-900`

  return (
    <nav
      aria-label="Quick navigation"
      className="mobile-tabbar fixed inset-x-0 bottom-0 z-40 flex border-t border-ink-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
    >
      <NavLink to="/" end className={link}>
        <Home size={21} />
        Home
      </NavLink>
      <button type="button" onClick={onMenu} className={button}>
        <Menu size={21} />
        Menu
      </button>
      <NavLink to="/shop" className={link}>
        <Store size={21} />
        Shop
      </NavLink>
      <button type="button" onClick={onSearch} className={button}>
        <Search size={21} />
        Search
      </button>
      <NavLink to="/wishlist" className={link}>
        <span className="relative">
          <Heart size={21} />
          {wishlist.length > 0 && <Dot>{wishlist.length}</Dot>}
        </span>
        Saved
      </NavLink>
      <NavLink to={isAuthed ? '/account' : '/login'} className={link}>
        <User size={21} />
        Account
      </NavLink>
    </nav>
  )
}

/* The mobile drawer groups the tabs first, then the secondary pages. */
const MOBILE_PRIMARY = NAV.filter((n) => n.label === 'Home' || CATEGORY_TABS.includes(n))

function MobileMenu({ onClose }) {
  const { isAuthed } = useAuth()
  const [expanded, setExpanded] = useState(null)

  const row =
    'flex min-h-[3.25rem] w-full items-center justify-between border-t border-ink-100 py-3 font-display text-2xl text-ink-900 first:border-t-0 active:text-gold-700'

  const secondary = [
    { label: 'Shop All', to: '/shop' },
    { label: 'About', to: '/about' },
    { label: 'Contact', to: '/contact' },
    { label: 'Wishlist', to: '/wishlist' },
    isAuthed ? { label: 'My Account', to: '/account' } : { label: 'Sign In', to: '/login' },
  ]

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-ink-900/50 backdrop-blur-sm lg:hidden"
      />
      <motion.aside
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed inset-y-0 left-0 z-50 flex h-[100dvh] w-[88%] max-w-sm flex-col bg-white lg:hidden"
      >
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-3">
          <span className="font-display text-lg tracking-[0.2em] text-ink-900">MENU</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="grid h-11 w-11 place-items-center rounded-full text-ink-700 hover:bg-ink-50"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto overscroll-contain px-5 py-2">
          {MOBILE_PRIMARY.map((item) =>
            item.menu ? (
              <div key={item.label} className="border-t border-ink-100">
                <button
                  type="button"
                  onClick={() => setExpanded(expanded === item.label ? null : item.label)}
                  aria-expanded={expanded === item.label}
                  className={`${row} border-t-0`}
                >
                  {item.label}
                  <ChevronDown
                    size={18}
                    className={`text-ink-400 transition-transform duration-300 ${
                      expanded === item.label ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {expanded === item.label && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: 'easeInOut' }}
                      className="overflow-hidden pb-2"
                    >
                      <li>
                        <Link
                          to={item.to}
                          className="flex min-h-11 items-center pl-4 text-sm font-semibold text-gold-700"
                        >
                          View all {item.label.toLowerCase()}
                        </Link>
                      </li>
                      {item.menu.map((col) => (
                        <li key={col.slug}>
                          <Link
                            to={`/collection/${col.slug}`}
                            className="flex min-h-12 items-center gap-3 pl-4 text-sm text-ink-600"
                          >
                            <img
                              src={col.image}
                              alt=""
                              className="h-9 w-9 rounded-full object-cover"
                            />
                            {col.short}
                          </Link>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link key={item.label} to={item.to} className={row}>
                {item.label}
              </Link>
            ),
          )}

          <div className="mt-2 border-t border-ink-100 pt-2">
            {secondary.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="flex min-h-12 items-center text-base text-ink-600 active:text-gold-700"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="border-t border-ink-100 px-5 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <p className="text-[0.65rem] uppercase tracking-[0.18em] text-ink-400">Need help?</p>
          <a href={STORE_LINKS.tel} className="mt-1 block font-display text-lg text-ink-900">
            {STORE.phone}
          </a>
        </div>
      </motion.aside>
    </>
  )
}

function SearchOverlay({ onClose }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    inputRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const term = query.trim().toLowerCase()
  const results = term
    ? PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.fabric.toLowerCase().includes(term) ||
          p.category.includes(term),
      ).slice(0, 6)
    : []

  const submit = (e) => {
    e.preventDefault()
    if (term) navigate(`/shop?q=${encodeURIComponent(term)}`)
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-ink-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -30, opacity: 0 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[100dvh] overflow-y-auto overscroll-contain bg-white px-5 pb-8 pt-5 sm:px-8 sm:pt-6"
      >
        <div className="mx-auto w-full max-w-3xl">
          <form onSubmit={submit} className="flex items-center gap-3 border-b border-ink-200 pb-4">
            <Search size={20} className="shrink-0 text-ink-400" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sherwani, Arch, Lazio…"
              aria-label="Search products"
              enterKeyHint="search"
              className="w-full bg-transparent font-display text-xl text-ink-900 outline-none placeholder:text-ink-300 sm:text-2xl"
            />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close search"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-ink-500 hover:bg-ink-50"
            >
              <X size={18} />
            </button>
          </form>

          {term && (
            <div className="mt-5">
              {results.length === 0 ? (
                <p className="py-6 text-sm text-ink-400">
                  Nothing matched “{query}”. Try “sherwani”, “Arch” or “white”.
                </p>
              ) : (
                <ul className="space-y-1">
                  {results.map((p) => (
                    <li key={p.id}>
                      <Link
                        to={`/product/${p.id}`}
                        onClick={onClose}
                        className="flex items-center gap-4 rounded-xl p-2 transition-colors hover:bg-ink-50 active:bg-ink-50"
                      >
                        <img
                          src={p.images[0]}
                          alt=""
                          className="h-16 w-14 rounded-lg object-cover"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-ink-900">
                            {p.name}
                          </span>
                          <span className="block text-xs text-ink-400">{p.fabric}</span>
                        </span>
                        <span className="text-sm font-semibold text-ink-900">
                          {formatPrice(p.price)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {!term && (
            <div className="mt-5">
              <p className="eyebrow mb-3">Popular searches</p>
              <div className="flex flex-wrap gap-2">
                {['Sherwani', 'Wonder Weave', 'Arch', 'Bareeze', 'Lazio', 'White'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setQuery(t)}
                    className="min-h-10 rounded-full border border-ink-200 px-4 py-1.5 text-xs text-ink-600 transition-colors hover:border-ink-900 hover:text-ink-900"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
