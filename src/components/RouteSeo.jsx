import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { absoluteUrl, routeMeta } from '../data/seo'
import { STORE } from '../data/config'

function setMeta(selector, attrs) {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement(selector.startsWith('link') ? 'link' : 'meta')
    document.head.appendChild(el)
  }
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v))
}

/**
 * Keeps the tab title, description, canonical link, social-preview tags and
 * structured data in step with the current URL while visitors navigate.
 * (The same data is written into static HTML at build time for crawlers that
 * do not run JavaScript — see scripts/prerender.mjs.)
 */
export default function RouteSeo() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    const meta = routeMeta(pathname, search)
    const url = absoluteUrl(meta.path)
    const image = absoluteUrl(meta.image)

    document.title = meta.fullTitle
    setMeta('meta[name="description"]', { name: 'description', content: meta.description })
    setMeta('meta[name="robots"]', { name: 'robots', content: meta.noindex ? 'noindex, follow' : 'index, follow' })
    setMeta('link[rel="canonical"]', { rel: 'canonical', href: url })
    setMeta('meta[property="og:type"]', { property: 'og:type', content: meta.type })
    setMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: STORE.name })
    setMeta('meta[property="og:title"]', { property: 'og:title', content: meta.fullTitle })
    setMeta('meta[property="og:description"]', { property: 'og:description', content: meta.description })
    setMeta('meta[property="og:url"]', { property: 'og:url', content: url })
    setMeta('meta[property="og:image"]', { property: 'og:image', content: image })
    setMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' })
    setMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: meta.fullTitle })
    setMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: meta.description })
    setMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: image })

    // Replace the structured data (the static copy, if any, is the first one).
    document.head.querySelectorAll('script[type="application/ld+json"]').forEach((n) => n.remove())
    if (meta.jsonLd.length) {
      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': meta.jsonLd })
      document.head.appendChild(script)
    }
  }, [pathname, search])

  return null
}
