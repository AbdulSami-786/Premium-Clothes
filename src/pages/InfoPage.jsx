import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Breadcrumbs from '../components/Breadcrumbs'
import Reveal from '../components/Reveal'
import { POLICIES } from '../data/policies'
import NotFound from './NotFound'
import { usePageTitle } from '../hooks/usePageTitle'

export default function InfoPage({ slug }) {
  usePageTitle(POLICIES[slug]?.title ?? 'Page not found')
  const page = POLICIES[slug]
  if (!page) return <NotFound />

  return (
    <div className="container-px py-8 lg:py-12">
      <Breadcrumbs trail={[{ label: page.title }]} />

      <Reveal className="mt-6 max-w-2xl">
        <p className="eyebrow">{page.eyebrow}</p>
        <h1 className="mt-3 font-display text-3xl leading-tight text-ink-900 sm:text-5xl">
          {page.title}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-ink-500 sm:text-base">
          {page.intro}
        </p>
      </Reveal>

      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-16">
        <div className="max-w-2xl space-y-10">
          {page.sections.map((section, i) => (
            <motion.section
              key={section.heading}
              id={`s-${i}`}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: (i % 4) * 0.06 }}
              className="scroll-mt-28"
            >
              <h2 className="font-display text-xl text-ink-900 sm:text-2xl">
                {section.heading}
              </h2>
              <ul className="mt-4 space-y-3">
                {section.body.map((line) => (
                  <li key={line} className="flex gap-3 text-sm leading-relaxed text-ink-600">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold-500" />
                    {line}
                  </li>
                ))}
              </ul>
            </motion.section>
          ))}
        </div>

        <aside className="lg:sticky lg:top-28 lg:h-fit">
          <div className="rounded-2xl border border-ink-100 p-6">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-ink-900">
              On this page
            </p>
            <ul className="mt-4 space-y-2.5">
              {page.sections.map((section, i) => (
                <li key={section.heading}>
                  <a
                    href={`#s-${i}`}
                    className="text-sm leading-snug text-ink-500 transition-colors hover:text-ink-900"
                  >
                    {section.heading}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-5 rounded-2xl bg-ink-50/70 p-6">
            <p className="text-sm font-semibold text-ink-900">Still need help?</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">
              Our team answers within one working day.
            </p>
            <Link to="/contact" className="btn-primary mt-4 w-full">
              Contact us
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
