import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { PenLine, Star } from 'lucide-react'
import Alert from './Alert'
import { useAuth } from '../context/AuthContext'
import { api, apiConfigured } from '../utils/api'

/**
 * Reviews for one product. Falls back to the rating baked into products.js
 * when no backend is configured, so the section is never empty in dev.
 */
export default function ProductReviews({ product }) {
  const { token, isAuthed } = useAuth()
  const location = useLocation()

  const [reviews, setReviews] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(apiConfigured)
  const [loadError, setLoadError] = useState('')
  const [writing, setWriting] = useState(false)

  useEffect(() => {
    if (!apiConfigured) return

    let cancelled = false
    setLoading(true)
    api
      .productReviews(product.id)
      .then((res) => {
        if (cancelled) return
        setReviews(res.reviews)
        setSummary(res.summary)
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [product.id])

  const onPublished = (review) => {
    setReviews((prev) => [review, ...prev])
    setSummary((prev) => {
      const count = (prev?.count ?? 0) + 1
      const total = (prev?.average ?? 0) * (prev?.count ?? 0) + review.rating
      return { count, average: Math.round((total / count) * 10) / 10 }
    })
    setWriting(false)
  }

  // With no backend, show the static figures from the catalogue instead.
  const shownAverage = summary?.count ? summary.average : product.rating
  const shownCount = summary?.count ?? product.reviews

  return (
    <section id="reviews" className="mt-20 scroll-mt-24 border-t border-ink-100 pt-14">
      <div className="grid gap-10 lg:grid-cols-3">
        <div>
          <h2 className="font-display text-2xl text-ink-900 sm:text-3xl">
            Customer reviews
          </h2>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-display text-5xl text-ink-900">{shownAverage}</span>
            <div>
              <Stars value={shownAverage} />
              <span className="mt-1 block text-xs text-ink-400">
                {shownCount} {shownCount === 1 ? 'review' : 'reviews'}
              </span>
            </div>
          </div>

          <Distribution reviews={reviews} fallbackCount={shownCount} />

          {isAuthed ? (
            <button
              type="button"
              onClick={() => setWriting((w) => !w)}
              className="btn-outline mt-7 w-full"
            >
              <PenLine size={15} />
              {writing ? 'Cancel' : 'Write a review'}
            </button>
          ) : (
            <div className="mt-7 rounded-xl bg-ink-50/70 p-5 text-sm leading-relaxed text-ink-600">
              <Link
                to="/login"
                state={{ from: location.pathname }}
                className="link-underline font-semibold text-ink-900"
              >
                Sign in
              </Link>{' '}
              to write a review.
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <AnimatePresence>
            {writing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <ReviewForm
                  productId={product.id}
                  token={token}
                  onPublished={onPublished}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {loadError && <Alert tone="error">{loadError}</Alert>}

          {loading && (
            <div className="space-y-4">
              {[0, 1].map((i) => (
                <div key={i} className="skeleton h-32 rounded-2xl" />
              ))}
            </div>
          )}

          {!loading && reviews.length === 0 && !loadError && (
            <div className="rounded-2xl border border-dashed border-ink-200 py-16 text-center">
              <p className="font-display text-xl text-ink-900">No reviews yet</p>
              <p className="mt-2 text-sm text-ink-400">
                {apiConfigured
                  ? 'Be the first to review this piece.'
                  : 'Reviews appear here once the backend is connected.'}
              </p>
            </div>
          )}

          {reviews.length > 0 && (
            <ul className="space-y-5">
              {reviews.map((r, i) => (
                <motion.li
                  key={r.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(i, 4) * 0.06 }}
                  className="rounded-2xl border border-ink-100 p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink-900 font-display text-xs text-white">
                        {(r.name || '?').charAt(0).toUpperCase()}
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-ink-900">
                          {r.name}
                        </span>
                        <span className="block text-xs text-ink-400">
                          {formatDate(r.createdAt)}
                        </span>
                      </span>
                    </div>
                    <Stars value={r.rating} size={12} />
                  </div>

                  {r.title && (
                    <p className="mt-4 text-sm font-semibold text-ink-900">{r.title}</p>
                  )}
                  <p className="mt-2 text-sm leading-relaxed text-ink-600">{r.body}</p>
                </motion.li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}

function ReviewForm({ productId, token, onPublished }) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (rating < 1) return setError('Please choose a rating.')
    if (body.trim().length < 10) return setError('Please write a little more.')

    setError('')
    setBusy(true)
    try {
      const res = await api.addReview(token, {
        productId,
        rating,
        title: title.trim(),
        body: body.trim(),
      })
      onPublished(res.review)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="mb-6 rounded-2xl border border-ink-200 p-6">
      <h3 className="font-display text-xl text-ink-900">Write a review</h3>

      {error && (
        <Alert tone="error" className="mt-4">
          {error}
        </Alert>
      )}

      <div className="mt-5">
        <span className="label">Your rating</span>
        <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => {
                setRating(n)
                setError('')
              }}
              onMouseEnter={() => setHover(n)}
              aria-label={`${n} star${n > 1 ? 's' : ''}`}
              className="p-0.5 transition-transform hover:scale-110"
            >
              <Star
                size={26}
                className={
                  n <= (hover || rating)
                    ? 'fill-gold-400 text-gold-400'
                    : 'text-ink-200'
                }
              />
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <label className="label" htmlFor="review-title">
          Title (optional)
        </label>
        <input
          id="review-title"
          className="field"
          maxLength={80}
          placeholder="Sums up your experience"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="mt-4">
        <label className="label" htmlFor="review-body">
          Your review
        </label>
        <textarea
          id="review-body"
          rows={4}
          className="field resize-none"
          placeholder="How is the fit, the fabric, the colour?"
          value={body}
          onChange={(e) => {
            setBody(e.target.value)
            setError('')
          }}
        />
      </div>

      <button type="submit" disabled={busy} className="btn-primary mt-5">
        {busy ? 'Publishing…' : 'Publish review'}
      </button>
    </form>
  )
}

function Stars({ value, size = 14 }) {
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={i < Math.round(value) ? 'fill-gold-400 text-gold-400' : 'text-ink-200'}
        />
      ))}
    </span>
  )
}

/** Bar chart of how many reviews gave each star rating. */
function Distribution({ reviews, fallbackCount }) {
  const counts = [5, 4, 3, 2, 1].map(
    (stars) => reviews.filter((r) => Math.round(r.rating) === stars).length,
  )
  const total = counts.reduce((a, b) => a + b, 0)

  // Before any real reviews exist, show a plausible shape rather than an
  // empty chart — replaced by real proportions as soon as reviews arrive.
  const shares = total
    ? counts.map((c) => Math.round((c / total) * 100))
    : fallbackCount
      ? [74, 19, 5, 1, 1]
      : [0, 0, 0, 0, 0]

  return (
    <div className="mt-6 space-y-2">
      {[5, 4, 3, 2, 1].map((stars, i) => (
        <div key={stars} className="flex items-center gap-3 text-xs text-ink-500">
          <span className="w-3">{stars}</span>
          <Star size={11} className="fill-gold-400 text-gold-400" />
          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-100">
            <motion.span
              initial={{ width: 0 }}
              whileInView={{ width: `${shares[i]}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="block h-full rounded-full bg-gold-400"
            />
          </span>
          <span className="w-8 text-right">{shares[i]}%</span>
        </div>
      ))}
    </div>
  )
}

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}
