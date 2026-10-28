/**
 * Single source of truth for the catalogue.
 *
 * Every cloth is its own collection, and every colour inside it is sold as a
 * separate product. To add a cloth, add one entry to `LINES` below — its
 * colours become products automatically.
 *
 * Prices are also held by the order backend (`CATALOG` in
 * apps-script/Code.gs), which charges from its own copy. If you use the
 * backend, change a price in both places.
 *
 * Photography lives in `./images.js` — swap the URLs there to use your own
 * pictures. Everything else on the site derives from this file.
 */

import {
  ARCH,
  BAREEZE,
  LAZIO,
  LAZIO_BOX,
  NOOR_CTN,
  NOOR_CARD,
  SHERWANI,
  SUPREME,
  WIDE,
  WONDER_WEAVE,
} from './images'

/* The three shop sections, in the order they appear in the navbar. A category
   with no products yet (Shalwar Kameez) still shows up and renders a
   "coming soon" page; add products to it and they appear automatically. */
export const CATEGORIES = [
  {
    slug: 'shalwar-kameez',
    name: 'Shalwar Kameez',
    short: 'Shalwar Kameez',
    type: 'stitched',
    tagline: 'Ready to wear, tailored to drape',
    description:
      'Fully stitched shalwar kameez finished by our master tailors — hemmed, lined and pressed so it is ready the moment it arrives.',
    image: WIDE.menWhite,
  },
  {
    slug: 'sherwani',
    name: 'Sherwani',
    short: 'Sherwani',
    type: 'stitched',
    tagline: 'Embroidered sherwanis, ready to wear',
    description:
      'Fully stitched, embroidered sherwanis with a structured band collar and matching trouser — made for weddings, Eid and formal evenings.',
    image: SHERWANI['Bottle Green'],
  },
  {
    slug: 'unstitched',
    name: 'Unstitched',
    short: 'Unstitched',
    type: 'unstitched',
    tagline: 'Premium suiting by the length',
    description:
      'Premium suiting sold as full suit lengths from 4.25m to 5.5m, in a range of shades. Consistent dye lots so a repeat order matches the first.',
    image: WIDE.fabricWarm,
  },
]

/* Old links from when the shop was split by audience keep working. */
const LEGACY_SLUGS = {
  'stitched-men': 'sherwani',
  'unstitched-men': 'unstitched',
}

export const SIZES_STITCHED = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
export const SIZES_UNSTITCHED = ['Standard (3 pc)', 'Large (3.5 pc)']

/* One entry per cloth. The order here is the order collections appear on the
   home page and in the menus. `shades` maps each colour to its photo; every
   colour becomes its own product. */
const LINES = [
  {
    slug: 'sherwani',
    name: 'Embroidered Sherwani',
    short: 'Sherwani',
    category: 'sherwani',
    blurb: 'All-over embroidery, a structured band collar and engraved buttons — for weddings, Eid and formal evenings.',
    price: 30000,
    sizes: ['Small', 'Medium', 'Large'],
    pieces: 2,
    badge: 'New',
    shades: SHERWANI,
    cover: SHERWANI['Bottle Green'],
    description:
      'A tailored sherwani with all-over embroidery, a structured band collar and engraved metal buttons. Comes with a matching trouser — made for weddings, Eid and formal evenings.',
    details: [
      'Sherwani with matching trouser',
      'All-over embroidery with band collar',
      'Engraved metal buttons and side vents',
      'Sizes Small to Large',
      'Dry clean only',
    ],
  },
  {
    slug: 'wonder-weave',
    name: 'Wonder Weave',
    short: 'Wonder Weave',
    category: 'unstitched',
    blurb: 'A smooth, fine-woven suiting with a soft drape, in four suit lengths.',
    // Starting price; the length chosen on the product page sets the real one.
    price: 4250,
    lengths: [
      { label: '4.25m', price: 4250 },
      { label: '4.5m', price: 4500 },
      { label: '5m', price: 5000 },
      { label: '5.5m', price: 5500 },
    ],
    pieces: 1,
    badge: 'New',
    shades: WONDER_WEAVE,
    cover: WONDER_WEAVE['Navy Blue'],
    description:
      'A smooth, fine-woven suiting fabric with a soft drape and a clean finish. Available in four suit lengths, so you can order exactly the cut your tailor needs.',
    details: [
      'Available in 4.25m, 4.5m, 5m and 5.5m lengths',
      'Sold unstitched — tailoring not included',
    ],
  },
  {
    slug: 'arch',
    name: 'Arch',
    short: 'Arch',
    category: 'unstitched',
    blurb: 'Premium suiting with a smooth hand and a rich, even colour, in four suit lengths.',
    // Priced at 5400 for 4.25m (≈1271/m), other lengths rounded to the nearest 50.
    price: 5400,
    lengths: [
      { label: '4.25m', price: 5400 },
      { label: '4.5m', price: 5700 },
      { label: '5m', price: 6350 },
      { label: '5.5m', price: 7000 },
    ],
    pieces: 1,
    badge: 'New',
    shades: ARCH,
    cover: ARCH.Khaki,
    description:
      'A premium suiting fabric with a smooth hand and a rich, even colour. Available in four suit lengths, so you can order exactly the cut your tailor needs.',
    details: [
      'Available in 4.25m, 4.5m, 5m and 5.5m lengths',
      'Sold unstitched — tailoring not included',
    ],
  },
  {
    slug: 'bareeze-suiting',
    name: 'Bareeze Suiting',
    short: 'Bareeze',
    category: 'unstitched',
    blurb: 'Fine, smooth-draping suiting in twelve colours, in three suit lengths.',
    price: 5000,
    lengths: [
      { label: '4.5m', price: 5000 },
      { label: '5m', price: 5000 },
      { label: '5.5m', price: 5000 },
    ],
    pieces: 1,
    badge: 'New',
    shades: BAREEZE,
    cover: BAREEZE['Navy Blue'],
    description:
      'A fine suiting fabric with a smooth hand, a soft drape and a rich, even colour. Available in twelve colours and three suit lengths, so you can order exactly the cut your tailor needs.',
    details: [
      'Available in 4.5m, 5m and 5.5m lengths',
      'Twelve colours from a single dye lot',
      'Sold unstitched — tailoring not included',
    ],
  },
  {
    slug: 'supreme',
    name: 'Supreme',
    short: 'Supreme',
    category: 'unstitched',
    blurb: 'A fine, smooth suiting in four classic whites, in three suit lengths.',
    price: 5000,
    lengths: [
      { label: '4.5m', price: 5000 },
      { label: '5m', price: 5000 },
      { label: '5.5m', price: 5000 },
    ],
    pieces: 1,
    badge: 'New',
    shades: SUPREME,
    cover: SUPREME['Off White'],
    description:
      'A fine suiting fabric with a smooth hand and a clean, even finish, with a woven Supreme selvedge. Available in four classic whites and three suit lengths, so you can order exactly the cut your tailor needs.',
    details: [
      'Available in 4.5m, 5m and 5.5m lengths',
      'Woven Supreme selvedge',
      'Sold unstitched — tailoring not included',
    ],
  },
  {
    slug: 'noor-ctn',
    name: 'Noor CTN',
    short: 'Noor CTN',
    category: 'unstitched',
    blurb: 'Everyday suiting in twelve colours, in a single 4.5m suit length.',
    price: 3700,
    lengths: [{ label: '4.5m', price: 3700 }],
    pieces: 1,
    badge: 'New',
    shades: NOOR_CTN,
    cover: NOOR_CARD,
    description:
      'A smooth everyday suiting in twelve colours. Sold as a single 4.5m suit length, so you can take it straight to your tailor.',
    details: [
      'Twelve colours from a single dye lot',
      'Single 4.5m suit length',
      'Sold unstitched — tailoring not included',
    ],
  },
  {
    slug: 'lazio',
    name: 'Lazio',
    short: 'Lazio',
    category: 'unstitched',
    blurb: 'Super fine 120s Egyptian Giza cotton with a liquid ammonia finish, presented in a gift box.',
    price: 14700,
    lengths: [{ label: '4.5m', price: 14700 }],
    pieces: 1,
    badge: 'Premium',
    shades: LAZIO,
    cover: LAZIO_BOX,
    // Shown after the shade photo on every Lazio product.
    extraImages: [LAZIO_BOX],
    description:
      'Woven from super fine 120s Egyptian Giza cotton with a liquid ammonia finish for a smooth, soft hand and lasting shape. Presented in a gift box.',
    details: [
      'Super fine 120s Egyptian Giza cotton',
      'Liquid ammonia finish',
      'Single 4.5m suit length, presented in a gift box',
      'Sold unstitched — tailoring not included',
    ],
  },
]

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

/* A shade maps to one photo, or to a list of photos (first = cover). */
const photosOf = (value) => (Array.isArray(value) ? value : [value])

export const PRODUCTS = LINES.flatMap((line) =>
  Object.entries(line.shades).map(([shade, photos]) => ({
    id: `${line.slug}-${slugify(shade)}`,
    name: `${line.name} — ${shade}`,
    shade,
    collection: line.slug,
    category: line.category,
    price: line.price,
    lengths: line.lengths,
    sizes: line.sizes,
    fabric: line.name,
    colors: [shade],
    colorImages: { [shade]: photosOf(photos)[0] },
    images: [...photosOf(photos), ...(line.extraImages ?? [])],
    pieces: line.pieces,
    rating: 0,
    reviews: 0,
    badge: line.badge,
    featured: true,
    description: line.description,
    details: line.details,
  })),
)

export const COLLECTIONS = LINES.map((line) => ({
  slug: line.slug,
  name: line.name,
  short: line.short,
  category: line.category,
  blurb: line.blurb,
  image: line.cover,
  price: line.price,
  lengths: line.lengths,
  sizes: line.sizes,
  products: PRODUCTS.filter((p) => p.collection === line.slug),
}))

/* ——— Derived lookups ——— */

export const getCategory = (slug) =>
  CATEGORIES.find((c) => c.slug === (LEGACY_SLUGS[slug] ?? slug))

/** Cloths that belong to a category, in display order. */
export const getCollectionsByCategory = (slug) => COLLECTIONS.filter((c) => c.category === slug)

export const getCollection = (slug) => COLLECTIONS.find((c) => c.slug === slug)

export const getProduct = (id) => PRODUCTS.find((p) => p.id === id)

export const getProductsByCategory = (slug) => PRODUCTS.filter((p) => p.category === slug)

/** The other colours of the same cloth. */
export const getShades = (product) => PRODUCTS.filter((p) => p.collection === product.collection)

/** Pieces from the other collections — same category first, one per collection
    before any collection repeats. */
export const getRelated = (product, limit = 4) => {
  const others = PRODUCTS.filter((p) => p.collection !== product.collection).sort(
    (a, b) =>
      Number(b.category === product.category) - Number(a.category === product.category),
  )
  const firsts = others.filter(
    (p, i) => others.findIndex((q) => q.collection === p.collection) === i,
  )
  return [...new Set([...firsts, ...others])].slice(0, limit)
}

export const getSizesFor = (product) => {
  if (product.lengths) return product.lengths.map((l) => l.label)
  if (product.sizes) return product.sizes
  return getCategory(product.category)?.type === 'stitched' ? SIZES_STITCHED : SIZES_UNSTITCHED
}

/** Unit price for a chosen size — products sold by length price each one separately. */
export const priceFor = (product, size) =>
  product.lengths?.find((l) => l.label === size)?.price ?? product.price

/** Picture for a chosen colour, falling back to the product's main shot. */
export const imageFor = (product, color) => product.colorImages?.[color] ?? product.images[0]

/** "4.25m – 5.5m", "4.5m" or "Small – Large" — the range a collection is sold in. */
export const rangeLabel = (item) => {
  const labels = item.lengths?.map((l) => l.label) ?? item.sizes ?? []
  if (labels.length <= 1) return labels[0] ?? ''
  return `${labels[0]} – ${labels[labels.length - 1]}`
}

export const PRICE_BOUNDS = {
  min: 0,
  max: Math.ceil(Math.max(...PRODUCTS.map((p) => p.price)) / 1000) * 1000,
}
