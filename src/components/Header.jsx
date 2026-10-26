import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Heart, Menu, Search, ShoppingBag, User, X, ChevronDown } from 'lucide-react'
import { CATEGORIES, COLLECTIONS, PRODUCTS } from '../data/products'
import { useShop } from '../context/ShopContext'
import { useAuth } from '../context/AuthContext'
import { formatPrice } from '../utils/format'

const WOMEN = CATEGORIES.filter((c) => c.audience === 'women')
const MEN = CATEGORIES.filter((c) => c.audience === 'men')

const NAV = [
  { label: 'Home', to: '/' },
  { label: 'Women', menu: WOMEN },
  { label: 'Men', menu: MEN },
  { label: 'Shop All', to: '/shop' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
].filter((item) => !item.menu || item.menu.length > 0)

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

  /* Any navigation closes every overlay this header owns. */
  useEffect(() => {
    setMobileOpen(false)
    setSearchOpen(false)
    setOpenMenu(null)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

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
        <div className="container-px flex h-[4.5rem] items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="-ml-2 grid h-10 w-10 place-items-center rounded-full text-ink-800 transition-colors hover:bg-ink-50 lg:hidden"
          >
            <Menu size={20} />
          </button>

          <Link to="/" className="group flex shrink-0 flex-col leading-none">
            <span className="font-display text-xl font-semibold tracking-[0.2em] text-ink-900 sm:text-2xl">
              PREMIUM
            </span>
            <span className="mt-0.5 text-[0.55rem] font-medium uppercase tracking-[0.42em] text-gold-600 transition-all duration-500 group-hover:tracking-[0.5em]">
              Clothes
            </span>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {NAV.map((item) =>
              item.menu ? (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setOpenMenu(item.label)}
                >
                  <button
                    type="button"
                    onClick={() => setOpenMenu(openMenu === item.label ? null : item.label)}
                    aria-expanded={openMenu === item.label}
                    className="flex items-center gap-1 py-6 text-xs font-semibold uppercase tracking-[0.16em] text-ink-700 transition-colors hover:text-ink-900"
                  >
                    {item.label}
                    <ChevronDown
                      size={13}
                      className={`transition-transform duration-300 ${
                        openMenu === item.label ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </div>
              ) : (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={({ isActive }) =>
                    `link-underline py-6 text-xs font-semibold uppercase tracking-[0.16em] transition-colors ${
                      isActive ? 'text-gold-700' : 'text-ink-700 hover:text-ink-900'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ),
            )}
          </nav>

          <div className="flex items-center gap-0.5 sm:gap-1">
            <IconButton label="Search" onClick={() => setSearchOpen(true)}>
              <Search size={19} />
            </IconButton>

            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="relative hidden h-10 w-10 place-items-center rounded-full text-ink-800 transition-colors hover:bg-ink-50 sm:grid"
            >
              <Heart size={19} />
              {wishlist.length > 0 && <Dot>{wishlist.length}</Dot>}
            </Link>

            <Link
              to={isAuthed ? '/account' : '/login'}
              aria-label={isAuthed ? `Account, signed in as ${user.name}` : 'Sign in'}
              className="relative hidden h-10 w-10 place-items-center rounded-full text-ink-800 transition-colors hover:bg-ink-50 sm:grid"
            >
              <User size={19} />
              {/* A small dot is enough to show the session is live. */}
              {isAuthed && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-green-600 ring-2 ring-white" />
              )}
            </Link>

            <IconButton label={`Cart, ${count} items`} onClick={openCart}>
              <ShoppingBag size={19} />
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
            />
          )}
        </AnimatePresence>
      </header>

      <AnimatePresence>
        {mobileOpen && <MobileMenu onClose={() => setMobileOpen(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
      </AnimatePresence>
    </>
  )
}

function IconButton({ children, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="relative grid h-10 w-10 place-items-center rounded-full text-ink-800 transition-colors hover:bg-ink-50"
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
      className="absolute -right-0.5 -top-0.5 grid h-[1.15rem] min-w-[1.15rem] place-items-center rounded-full bg-gold-500 px-1 text-[0.6rem] font-bold text-ink-900"
    >
      {children}
    </motion.span>
  )
}

function PromoBar() {
  const messages = [
    'Free delivery on orders over PKR 10,000',
    'New: The Eid Edit is live',
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

function MegaMenu({ label, items }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="absolute inset-x-0 top-full hidden border-t border-ink-100 bg-white shadow-lift lg:block"
    >
      <div className="container-px grid grid-cols-12 gap-10 py-10">
        <div className="col-span-3">
          <p className="eyebrow mb-4">{label}</p>
          <ul className="space-y-3">
            {items.map((cat) => (
              <li key={cat.slug}>
                <Link
                  to={`/category/${cat.slug}`}
                  className="group flex flex-col gap-0.5"
                >
                  <span className="font-display text-xl text-ink-900 transition-colors group-hover:text-gold-700">
                    {cat.short}
                  </span>
                  <span className="text-xs text-ink-400">{cat.tagline}</span>
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Link
                to="/shop"
                className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-700 link-underline"
              >
                View everything
              </Link>
            </li>
          </ul>
        </div>

        <div className="col-span-9 grid grid-cols-3 gap-5">
          {items.map((cat) => (
            <Link
              key={cat.slug}
              to={`/category/${cat.slug}`}
              className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-ink-50"
            >
              <img
                src={cat.image}
                alt={cat.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/75 via-ink-900/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="font-display text-lg text-white">{cat.short}</p>
              </div>
            </Link>
          ))}
          {COLLECTIONS[0] && (
            <Link
              to={`/collection/${COLLECTIONS[0].slug}`}
              className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-ink-900"
            >
              <img
                src={COLLECTIONS[0].image}
                alt={COLLECTIONS[0].name}
                loading="lazy"
                className="h-full w-full object-cover opacity-70 transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex flex-col justify-end gap-1 bg-gradient-to-t from-ink-900/85 to-transparent p-4">
                <span className="text-[0.6rem] uppercase tracking-[0.2em] text-gold-300">
                  Collection
                </span>
                <p className="font-display text-lg text-white">{COLLECTIONS[0].name}</p>
              </div>
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function MobileMenu({ onClose }) {
  const { isAuthed } = useAuth()
  const groups = [
    { label: 'Women', items: WOMEN },
    { label: 'Men', items: MEN },
  ].filter((g) => g.items.length > 0)
  const [expanded, setExpanded] = useState(groups[0]?.label ?? null)

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
        className="fixed inset-y-0 left-0 z-50 flex w-[86%] max-w-sm flex-col bg-white lg:hidden"
      >
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <span className="font-display text-lg tracking-[0.2em] text-ink-900">MENU</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="grid h-10 w-10 place-items-center rounded-full text-ink-700 hover:bg-ink-50"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-5 py-6">
          <Link to="/" className="block py-3 font-display text-2xl text-ink-900">
            Home
          </Link>

          {groups.map((group) => (
            <div key={group.label} className="border-t border-ink-100">
              <button
                type="button"
                onClick={() => setExpanded(expanded === group.label ? null : group.label)}
                aria-expanded={expanded === group.label}
                className="flex w-full items-center justify-between py-3 font-display text-2xl text-ink-900"
              >
                {group.label}
                <ChevronDown
                  size={18}
                  className={`text-ink-400 transition-transform duration-300 ${
                    expanded === group.label ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence initial={false}>
                {expanded === group.label && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    {group.items.map((cat) => (
                      <li key={cat.slug}>
                        <Link
                          to={`/category/${cat.slug}`}
                          className="block py-2.5 pl-4 text-sm text-ink-600"
                        >
                          {cat.short}
                        </Link>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          ))}

          {[
            { label: 'Shop All', to: '/shop' },
            { label: 'About', to: '/about' },
            { label: 'Contact', to: '/contact' },
            { label: 'Wishlist', to: '/wishlist' },
            isAuthed
              ? { label: 'My Account', to: '/account' }
              : { label: 'Sign In', to: '/login' },
          ].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="block border-t border-ink-100 py-3 font-display text-2xl text-ink-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-ink-100 px-5 py-5">
          <p className="text-[0.65rem] uppercase tracking-[0.18em] text-ink-400">
            Need help?
          </p>
          <a
            href="tel:+92211234567"
            className="mt-1 block font-display text-lg text-ink-900"
          >
            +92 21 1234 567
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
        className="bg-white px-5 pb-8 pt-6 sm:px-8"
      >
        <div className="mx-auto w-full max-w-3xl">
          <form onSubmit={submit} className="flex items-center gap-3 border-b border-ink-200 pb-4">
            <Search size={20} className="shrink-0 text-ink-400" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search lawn, khaddar, stitched suits…"
              aria-label="Search products"
              className="w-full bg-transparent font-display text-xl text-ink-900 outline-none placeholder:text-ink-300 sm:text-2xl"
            />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close search"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-500 hover:bg-ink-50"
            >
              <X size={18} />
            </button>
          </form>

          {term && (
            <div className="mt-5">
              {results.length === 0 ? (
                <p className="py-6 text-sm text-ink-400">
                  Nothing matched “{query}”. Try “lawn”, “karandi” or “stitched”.
                </p>
              ) : (
                <ul className="space-y-1">
                  {results.map((p) => (
                    <li key={p.id}>
                      <Link
                        to={`/product/${p.id}`}
                        onClick={onClose}
                        className="flex items-center gap-4 rounded-xl p-2 transition-colors hover:bg-ink-50"
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
                {['Lawn', 'Khaddar', 'Embroidered', 'Wash & Wear', 'Silk'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setQuery(t)}
                    className="rounded-full border border-ink-200 px-4 py-1.5 text-xs text-ink-600 transition-colors hover:border-ink-900 hover:text-ink-900"
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
