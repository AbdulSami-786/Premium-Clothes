import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Scissors,
  ShieldCheck,
  Truck,
} from 'lucide-react'
import Hero from '../components/Hero'
import ProductCard from '../components/ProductCard'
import SectionHeading from '../components/SectionHeading'
import Reveal, { RevealGroup, RevealItem } from '../components/Reveal'
import {
  CATEGORIES,
  COLLECTIONS,
  PRODUCTS,
  STITCH_PRICE,
  getCategory,
  rangeLabel,
} from '../data/products'
import { FABRIC, MEN, WIDE, WOMEN } from '../data/images'
import { formatPrice, FREE_SHIPPING_THRESHOLD } from '../utils/format'
import { ONLINE_PAYMENTS, SOCIAL } from '../data/config'

export default function Home() {
  return (
    <>
      <Hero />
      <CategoryTiles />
      <CollectionTiles />
      <CollectionRows />
      <TrustStrip />
      <CraftBanner />
      <InstagramStrip />
    </>
  )
}

/** "8 shades · From PKR 4,250" — the one-line summary of a collection. */
function collectionMeta(col) {
  const shades = `${col.products.length} ${col.products.length === 1 ? 'shade' : 'shades'}`
  const from = col.lengths?.length > 1 ? 'From ' : ''
  return `${shades} · ${from}${formatPrice(col.price)}`
}

/* ——————————————————————————————————————— */

const TRUST = [
  {
    icon: Truck,
    title: 'Free delivery',
    copy: `On every order over ${formatPrice(FREE_SHIPPING_THRESHOLD)}`,
  },
  { icon: RefreshCw, title: '7-day exchange', copy: 'On all stitched pieces' },
  {
    icon: ShieldCheck,
    title: ONLINE_PAYMENTS ? 'Secure checkout' : 'Cash on delivery',
    copy: ONLINE_PAYMENTS ? 'Card, wallet or cash on delivery' : 'Pay when your order arrives',
  },
  {
    icon: Scissors,
    title: 'Tailoring add-on',
    copy: `Simple stitch for ${formatPrice(STITCH_PRICE)} on any unstitched suit`,
  },
]

function TrustStrip() {
  return (
    <section className="border-y border-ink-100 bg-white">
      <RevealGroup className="container-px grid grid-cols-2 gap-x-6 gap-y-8 py-10 lg:grid-cols-4">
        {TRUST.map(({ icon: Icon, title, copy }) => (
          <RevealItem key={title} className="flex items-start gap-3.5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold-50 text-gold-600">
              <Icon size={19} />
            </span>
            <span>
              <span className="block text-sm font-semibold text-ink-900">{title}</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-ink-400">
                {copy}
              </span>
            </span>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  )
}

/** The three shop sections — the same tabs as the navbar, as big tappable tiles. */
function CategoryTiles() {
  return (
    <section className="container-px pt-14 lg:pt-24">
      <SectionHeading
        eyebrow="Shop by category"
        title="Find your style"
        subtitle="Shalwar kameez, sherwani or fabric for your own tailor."
      />

      <div className="grid gap-3 sm:grid-cols-3 sm:gap-4 lg:gap-6">
        {CATEGORIES.map((cat, i) => {
          const count = PRODUCTS.filter((p) => p.category === cat.slug).length
          return (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                to={`/category/${cat.slug}`}
                className="group relative block aspect-[16/10] overflow-hidden rounded-2xl bg-ink-900 ring-1 ring-ink-900/5 transition-shadow duration-500 hover:shadow-lift sm:aspect-[3/4]"
              >
                <img
                  src={cat.image}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/25 to-ink-950/5" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 sm:p-6">
                  <div>
                    <p className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-gold-400">
                      {count > 0 ? `${count} pieces` : 'Coming soon'}
                    </p>
                    <h3 className="mt-1.5 font-display text-3xl text-white">{cat.short}</h3>
                    <p className="mt-1 text-xs text-ink-200">{cat.tagline}</p>
                  </div>
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/40 text-white transition-all duration-300 group-hover:bg-white group-hover:text-ink-900">
                    <ArrowRight size={17} />
                  </span>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}

/** One tile per cloth; each jumps to that collection's row further down. */
function CollectionTiles() {
  return (
    <section className="container-px py-16 lg:py-28">
      <SectionHeading
        eyebrow="Our collections"
        title="One cloth, every shade"
        subtitle="Each collection is a single cloth. Pick the cloth, then pick your shade."
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {COLLECTIONS.map((col, i) => (
          <motion.a
            key={col.slug}
            href={`#${col.slug}`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-70px' }}
            transition={{ duration: 0.6, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] }}
            className="group relative block aspect-[3/4] overflow-hidden rounded-2xl bg-ink-900 ring-1 ring-ink-900/5 transition-shadow duration-500 hover:shadow-lift"
          >
            <img
              src={col.image}
              alt={col.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/30 to-ink-950/10 transition-opacity duration-500" />

            <span className="absolute left-4 top-4 font-display text-sm tracking-[0.2em] text-white/70 sm:left-5 sm:top-5">
              {String(i + 1).padStart(2, '0')}
            </span>

            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
              <p className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-gold-400">
                {getCategory(col.category)?.type}
              </p>
              <h3 className="mt-1.5 font-display text-xl text-white sm:text-2xl">{col.short}</h3>
              <p className="mt-1 text-[0.7rem] text-ink-300 sm:text-xs">{collectionMeta(col)}</p>

              <span className="mt-3 inline-flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-white transition-all duration-500 sm:mt-4 lg:translate-y-2 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100">
                View shades
                <ArrowRight
                  size={13}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </span>
            </div>

            {/* Gold rule that draws across the bottom edge on hover. */}
            <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-gold-400 transition-transform duration-700 ease-out group-hover:scale-x-100" />
          </motion.a>
        ))}
      </div>
    </section>
  )
}

/** Every collection as its own row, under a sticky bar that tracks which one is in view. */
function CollectionRows() {
  const [active, setActive] = useState(COLLECTIONS[0]?.slug)

  useEffect(() => {
    const sections = COLLECTIONS.map((c) => document.getElementById(c.slug)).filter(Boolean)
    // A row counts as active once it crosses the upper third of the screen.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActive(e.target.id))
      },
      { rootMargin: '-30% 0px -65% 0px' },
    )
    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="bg-ink-50/60">
      <div className="sticky top-16 z-30 lg:top-[4.5rem] border-y border-ink-100 bg-white/90 backdrop-blur-xl">
        <nav
          aria-label="Collections"
          className="container-px no-scrollbar flex items-center gap-2 overflow-x-auto py-3"
        >
          {COLLECTIONS.map((col) => (
            <a
              key={col.slug}
              href={`#${col.slug}`}
              aria-current={active === col.slug ? 'true' : undefined}
              className={`relative shrink-0 rounded-full px-4 py-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.16em] transition-colors duration-300 ${
                active === col.slug ? 'text-white' : 'text-ink-500 hover:text-ink-900'
              }`}
            >
              {active === col.slug && (
                <motion.span
                  layoutId="collection-pill"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  className="absolute inset-0 rounded-full bg-ink-900"
                />
              )}
              <span className="relative">{col.short}</span>
            </a>
          ))}
          <Link
            to="/shop"
            className="ml-auto hidden shrink-0 items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-gold-700 sm:inline-flex"
          >
            Shop all
            <ArrowRight size={13} />
          </Link>
        </nav>
      </div>

      {COLLECTIONS.map((col, i) => (
        <CollectionRow key={col.slug} collection={col} index={i} />
      ))}
    </div>
  )
}

function CollectionRow({ collection: col, index }) {
  const scroller = useRef(null)
  const [edges, setEdges] = useState({ start: true, end: false })

  const updateEdges = () => {
    const el = scroller.current
    if (!el) return
    setEdges({
      start: el.scrollLeft <= 4,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
    })
  }

  useEffect(() => {
    updateEdges()
    window.addEventListener('resize', updateEdges)
    return () => window.removeEventListener('resize', updateEdges)
  }, [])

  const scroll = (dir) =>
    scroller.current?.scrollBy({ left: dir * scroller.current.clientWidth * 0.8, behavior: 'smooth' })

  const category = getCategory(col.category)

  return (
    <section
      id={col.slug}
      className="scroll-mt-28 border-b border-ink-100 py-12 last:border-b-0 lg:py-20"
    >
      <div className="container-px">
        <Reveal className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-4 sm:gap-6">
            <span className="font-display text-5xl leading-none text-gold-300 sm:text-6xl">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="max-w-xl">
              <p className="eyebrow">{category?.short}</p>
              <h2 className="mt-2 text-3xl leading-tight text-ink-900 sm:text-4xl">
                {col.name}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{col.blurb}</p>
              <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-ink-400">
                <span>{collectionMeta(col)}</span>
                {rangeLabel(col) && (
                  <>
                    <span className="text-ink-200">|</span>
                    <span>{rangeLabel(col)}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <Link
              to={`/collection/${col.slug}`}
              className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink-900"
            >
              <span className="link-underline">View collection</span>
              <ArrowRight
                size={15}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
            {!(edges.start && edges.end) && (
              <div className="hidden gap-2 sm:flex">
                <RowArrow label="Previous" disabled={edges.start} onClick={() => scroll(-1)}>
                  <ChevronLeft size={17} />
                </RowArrow>
                <RowArrow label="Next" disabled={edges.end} onClick={() => scroll(1)}>
                  <ChevronRight size={17} />
                </RowArrow>
              </div>
            )}
          </div>
        </Reveal>
      </div>

      {/* Vertical padding leaves room for the card lift and shadow, which an
          overflow container would otherwise clip. */}
      <div
        ref={scroller}
        onScroll={updateEdges}
        className="container-px no-scrollbar -my-4 flex snap-x snap-mandatory gap-4 overflow-x-auto py-4 lg:gap-6"
      >
        {col.products.map((p, i) => (
          <ProductCard
            key={p.id}
            product={p}
            index={i}
            className="w-[62%] shrink-0 snap-start sm:w-[30%] lg:w-[calc(25%-1.125rem)]"
          />
        ))}
      </div>
    </section>
  )
}

function RowArrow({ children, label, disabled, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="grid h-10 w-10 place-items-center rounded-full border border-ink-200 bg-white text-ink-800 transition-all duration-300 hover:border-ink-900 hover:bg-ink-900 hover:text-white disabled:pointer-events-none disabled:opacity-35"
    >
      {children}
    </button>
  )
}

function CraftBanner() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])

  return (
    <section ref={ref} className="relative overflow-hidden py-24 lg:py-32">
      <motion.div style={{ y }} className="absolute inset-0 -top-[8%] h-[116%]">
        <img
          src={WIDE.fabricShop}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </motion.div>
      <div className="absolute inset-0 bg-ink-950/75" />

      <div className="container-px relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow text-gold-400">Made properly</p>
          <h2 className="mt-4 text-3xl leading-tight text-white sm:text-4xl lg:text-5xl">
            Every suit passes through eleven pairs of hands
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-ink-200 sm:text-base">
            From fabric selection at the mill to the final press before it is folded,
            each piece is checked at every stage. It is slower than the alternative.
            It is also the reason our customers order again.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/about" className="btn-gold">
              Our story
            </Link>
            <Link to="/shop" className="btn-ghost">
              Browse the collection
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

const FEED = [
  WOMEN.redEmbroidered,
  MEN.whiteArch,
  WOMEN.yellowFormal,
  FABRIC.shopShelves,
  WOMEN.blackEmbroidered,
  MEN.charcoalPark,
]

function InstagramStrip() {
  // Without a real profile to link to, the section has nothing honest to say.
  if (!SOCIAL.instagram) return null

  return (
    <section className="pb-4">
      <div className="container-px">
        <SectionHeading
          eyebrow="@premiumclothes"
          title="Seen on you"
          subtitle="Tag us and your photo may end up here."
        />
      </div>

      <div className="grid grid-cols-3 gap-1.5 px-1.5 lg:grid-cols-6">
        {FEED.map((src, i) => (
          <motion.a
            key={src + i}
            href={SOCIAL.instagram}
            target="_blank"
            rel="noreferrer noopener"
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: (i % 6) * 0.06 }}
            className="group relative aspect-square overflow-hidden bg-ink-100"
          >
            <img
              src={src}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 grid place-items-center bg-ink-950/0 transition-colors duration-400 group-hover:bg-ink-950/45">
              <span className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                View
              </span>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  )
}
