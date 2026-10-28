import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CATEGORIES } from '../data/products'

export default function NotFound() {
  return (
    <div className="container-px flex flex-col items-center py-24 text-center lg:py-32">
      <motion.p
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="font-display text-[6rem] leading-none text-ink-100 sm:text-[9rem]"
      >
        404
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.6 }}
        className="-mt-4"
      >
        <h1 className="font-display text-3xl text-ink-900 sm:text-4xl">
          This page has been taken in
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ink-500">
          The link may be old, or the piece may have sold out. Try one of the
          collections below.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn-primary">
            Back to home
          </Link>
          <Link to="/shop" className="btn-outline">
            Shop all
          </Link>
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to={`/category/${c.slug}`}
              className="rounded-full border border-ink-200 px-4 py-2 text-xs font-medium text-ink-600 transition-colors hover:border-ink-900 hover:text-ink-900"
            >
              {c.short}
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
