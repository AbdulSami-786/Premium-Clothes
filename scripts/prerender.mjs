/**
 * Runs after `vite build`. For every indexable URL it writes a copy of
 * dist/index.html whose <head> carries that page's own title, description,
 * canonical link, social-preview tags and structured data, then writes
 * sitemap.xml and robots.txt.
 *
 * The app still renders in the browser as before; this only means crawlers and
 * link previews (WhatsApp, Facebook, Google's first pass) see correct metadata
 * without running JavaScript. Hosts serve /product/x/index.html directly and
 * fall back to the SPA rewrite for everything else.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = process.env.PRERENDER_DIST ?? path.join(root, 'dist')

const vite = await createServer({
  root,
  appType: 'custom',
  logLevel: 'error',
  server: { middlewareMode: true },
})

try {
  const { routeMeta, indexablePaths, headHtml, absoluteUrl } = await vite.ssrLoadModule('/src/data/seo.js')
  const { SITE_URL } = await vite.ssrLoadModule('/src/data/config.js')

  const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')
  // Drop the generic tags from the template; each page gets its own set.
  const stripped = template
    .replace(/<title>[\s\S]*?<\/title>\s*/i, '')
    .replace(/<meta\s+name="description"[\s\S]*?\/>\s*/i, '')
    .replace(/<meta\s+(?:property|name)="(?:og|twitter):[^"]*"[\s\S]*?\/>\s*/gi, '')

  const paths = indexablePaths()
  for (const p of paths) {
    const meta = routeMeta(p)
    const html = stripped.replace('</head>', `  ${headHtml(meta)}\n  </head>`)
    const file = p === '/' ? path.join(dist, 'index.html') : path.join(dist, p.slice(1), 'index.html')
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, html)
  }

  const today = new Date().toISOString().slice(0, 10)
  const urls = paths
    .map((p) => `  <url><loc>${absoluteUrl(p)}</loc><lastmod>${today}</lastmod></url>`)
    .join('\n')
  fs.writeFileSync(
    path.join(dist, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
  )

  const robots = fs.readFileSync(path.join(root, 'public', 'robots.txt'), 'utf8').replace(/\n*Sitemap:.*\n*/g, '\n')
  fs.writeFileSync(path.join(dist, 'robots.txt'), `${robots.trim()}\n\nSitemap: ${SITE_URL}/sitemap.xml\n`)

  console.log(`prerender: ${paths.length} pages, sitemap.xml and robots.txt written for ${SITE_URL}`)
} finally {
  await vite.close()
}
