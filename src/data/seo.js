/**
 * Search and social metadata for every URL on the site.
 *
 * One function, `routeMeta`, answers "what should the title, description,
 * preview image and structured data be for this address?". The browser uses it
 * while you navigate (components/RouteSeo.jsx) and the build uses it to write a
 * static HTML page per URL (scripts/prerender.mjs), so what Google, WhatsApp
 * and Facebook read is the same thing visitors see.
 */

import { SITE_URL, SOCIAL, STORE } from './config'
import { WIDE } from './images'
import { POLICIES } from './policies'
import { CATEGORIES, COLLECTIONS, PRODUCTS, getCategory, getCollection, getProduct } from './products'
import { formatPrice } from '../utils/format'

export const DEFAULT_TITLE = `${STORE.name} — Shalwar Kameez, Sherwani & Unstitched`
export const DEFAULT_DESCRIPTION =
  'Shop shalwar kameez, embroidered sherwani and premium unstitched suiting, with cash on delivery across Pakistan.'

const DEFAULT_IMAGE = WIDE.sherwani

/* Pages that are useful to a shopper but worthless in search results. */
const PRIVATE_PATHS = [
  '/cart',
  '/checkout',
  '/order-confirmed',
  '/wishlist',
  '/account',
  '/login',
  '/signup',
  '/forgot-password',
]

export const absoluteUrl = (path) => (/^https?:/.test(path) ? path : `${SITE_URL}${path}`)

/** Trims to a search-snippet length on a word boundary. */
const snippet = (text, max = 158) => {
  const clean = String(text).replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max - 1)
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`
}

const crumbs = (items) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    item: absoluteUrl(item.path),
  })),
})

const page = (meta) => ({
  type: 'website',
  noindex: false,
  image: DEFAULT_IMAGE,
  jsonLd: [],
  ...meta,
  fullTitle: meta.title ? `${meta.title} — ${STORE.name}` : DEFAULT_TITLE,
})

const productSchema = (product, canonical) => {
  const prices = product.lengths ? product.lengths.map((l) => l.price) : [product.price]
  const low = Math.min(...prices)
  const high = Math.max(...prices)
  const common = {
    priceCurrency: 'PKR',
    availability: 'https://schema.org/InStock',
    itemCondition: 'https://schema.org/NewCondition',
    url: canonical,
  }
  return {
    '@type': 'Product',
    name: product.name,
    description: product.description,
    sku: product.id,
    color: product.shade,
    category: getCategory(product.category)?.name,
    image: product.images.map(absoluteUrl),
    brand: { '@type': 'Brand', name: STORE.name },
    offers:
      low === high
        ? { '@type': 'Offer', price: low, ...common }
        : { '@type': 'AggregateOffer', lowPrice: low, highPrice: high, offerCount: prices.length, ...common },
  }
}

/** Metadata for a URL. `search` is the query string, e.g. "?q=white". */
export function routeMeta(pathname, search = '') {
  const path = pathname.replace(/\/+$/, '') || '/'

  if (path === '/') {
    const sameAs = Object.values(SOCIAL).filter(Boolean)
    return page({
      title: '',
      description: DEFAULT_DESCRIPTION,
      path: '/',
      // Phone and address are deliberately left out of the structured data until
      // the real details are set in config.js — wrong contact data in search
      // results is worse than none.
      jsonLd: [
        {
          '@type': 'Organization',
          '@id': `${SITE_URL}/#organization`,
          name: STORE.name,
          url: SITE_URL,
          ...(sameAs.length ? { sameAs } : {}),
        },
        {
          '@type': 'WebSite',
          '@id': `${SITE_URL}/#website`,
          url: SITE_URL,
          name: STORE.name,
          publisher: { '@id': `${SITE_URL}/#organization` },
          potentialAction: {
            '@type': 'SearchAction',
            target: `${SITE_URL}/shop?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        },
      ],
    })
  }

  if (path === '/shop') {
    const q = new URLSearchParams(search).get('q')?.trim()
    if (q) {
      return page({ title: `“${q}”`, description: `Products matching “${q}”.`, path: '/shop', noindex: true })
    }
    return page({
      title: 'All Products',
      description:
        'The complete catalogue: ready-to-wear shalwar kameez, embroidered sherwani and premium unstitched suiting in many shades.',
      path: '/shop',
      jsonLd: [crumbs([{ name: 'Home', path: '/' }, { name: 'All products', path: '/shop' }])],
    })
  }

  let m = path.match(/^\/category\/([^/]+)$/)
  if (m) {
    const category = getCategory(m[1])
    if (!category) return notFound()
    const canonical = `/category/${category.slug}`
    return page({
      title: category.name,
      description: snippet(category.description),
      // A "coming soon" category is thin content; it indexes itself once stocked.
      noindex: !PRODUCTS.some((p) => p.category === category.slug),
      path: canonical,
      image: category.image,
      jsonLd: [crumbs([{ name: 'Home', path: '/' }, { name: category.name, path: canonical }])],
    })
  }

  m = path.match(/^\/collection\/([^/]+)$/)
  if (m) {
    const collection = getCollection(m[1])
    if (!collection) return notFound()
    const category = getCategory(collection.category)
    const canonical = `/collection/${collection.slug}`
    return page({
      title: collection.name,
      description: snippet(`${collection.blurb} ${collection.products.length} shades from ${formatPrice(collection.price)}.`),
      path: canonical,
      image: collection.image,
      jsonLd: [
        crumbs([
          { name: 'Home', path: '/' },
          { name: category.name, path: `/category/${category.slug}` },
          { name: collection.name, path: canonical },
        ]),
      ],
    })
  }

  m = path.match(/^\/product\/([^/]+)$/)
  if (m) {
    const product = getProduct(m[1])
    if (!product) return notFound()
    const category = getCategory(product.category)
    const collection = getCollection(product.collection)
    const canonical = `/product/${product.id}`
    return page({
      title: product.name,
      // Price first, so a long description is what gets trimmed, not the price.
      description: snippet(`From ${formatPrice(product.price)}. ${product.description}`),
      path: canonical,
      image: product.images[0],
      type: 'product',
      jsonLd: [
        productSchema(product, absoluteUrl(canonical)),
        crumbs([
          { name: 'Home', path: '/' },
          { name: category.name, path: `/category/${category.slug}` },
          { name: collection.name, path: `/collection/${collection.slug}` },
          { name: product.name, path: canonical },
        ]),
      ],
    })
  }

  const statics = {
    '/about': { title: 'Our story', description: 'How Premium Clothes began as a fabric counter in Karachi, and why we still cut, stitch and finish with the same care.' },
    '/contact': { title: 'Contact', description: 'Questions about sizing, an order or a fabric? Call, WhatsApp, email or visit us — a real person will answer.' },
    '/size-guide': { title: 'Size guide', description: 'Body measurements for every stitched size, plus the lengths our unstitched suiting is sold in.' },
  }
  if (statics[path]) return page({ ...statics[path], path })

  const policy = POLICIES[path.slice(1)]
  if (policy) return page({ title: policy.title, description: snippet(policy.intro), path })

  if (PRIVATE_PATHS.includes(path)) {
    const titles = {
      '/cart': 'Shopping bag',
      '/checkout': 'Checkout',
      '/order-confirmed': 'Order confirmed',
      '/wishlist': 'Wishlist',
      '/account': 'Account',
      '/login': 'Sign in',
      '/signup': 'Create account',
      '/forgot-password': 'Reset password',
    }
    return page({ title: titles[path], description: DEFAULT_DESCRIPTION, path, noindex: true })
  }

  return notFound()
}

function notFound() {
  return page({ title: 'Page not found', description: DEFAULT_DESCRIPTION, path: '/', noindex: true })
}

/** Every address worth indexing — feeds the sitemap and the static page generator. */
export function indexablePaths() {
  return [
    '/',
    '/shop',
    ...CATEGORIES.filter((c) => PRODUCTS.some((p) => p.category === c.slug)).map((c) => `/category/${c.slug}`),
    ...COLLECTIONS.map((c) => `/collection/${c.slug}`),
    ...PRODUCTS.map((p) => `/product/${p.id}`),
    '/about',
    '/contact',
    '/size-guide',
    ...Object.keys(POLICIES).map((k) => `/${k}`),
  ]
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')

/** The <head> tags for a page, as HTML — used by the static page generator. */
export function headHtml(meta) {
  const url = absoluteUrl(meta.path)
  const image = absoluteUrl(meta.image)
  const tags = [
    `<title>${esc(meta.fullTitle)}</title>`,
    `<meta name="description" content="${esc(meta.description)}" />`,
    `<meta name="robots" content="${meta.noindex ? 'noindex, follow' : 'index, follow'}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="${meta.type}" />`,
    `<meta property="og:site_name" content="${esc(STORE.name)}" />`,
    `<meta property="og:locale" content="en_PK" />`,
    `<meta property="og:title" content="${esc(meta.fullTitle)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(meta.fullTitle)}" />`,
    `<meta name="twitter:description" content="${esc(meta.description)}" />`,
    `<meta name="twitter:image" content="${image}" />`,
  ]
  if (meta.jsonLd.length) {
    const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': meta.jsonLd }).replace(/</g, '\\u003c')
    tags.push(`<script type="application/ld+json">${json}</script>`)
  }
  return tags.join('\n    ')
}
