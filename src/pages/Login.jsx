import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Breadcrumbs from '../components/Breadcrumbs'
import FormField from '../components/FormField'
import Alert from '../components/Alert'
import BackendNotice from '../components/BackendNotice'
import { useAuth } from '../context/AuthContext'
import { WOMEN } from '../data/images'

export default function Login() {
  const { signIn, apiConfigured } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [failure, setFailure] = useState('')
  const [busy, setBusy] = useState(false)

  /* Where to land after signing in — set by whatever sent the visitor here. */
  const next = location.state?.from ?? '/account'
  const notice = location.state?.notice

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
    setFailure('')
  }

  const submit = async (e) => {
    e.preventDefault()

    const next_ = {}
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next_.email = 'Enter a valid email address'
    if (!form.password) next_.password = 'Enter your password'
    setErrors(next_)
    if (Object.keys(next_).length) return

    setBusy(true)
    setFailure('')
    try {
      await signIn(form.email, form.password)
      navigate(next, { replace: true })
    } catch (err) {
      setFailure(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="container-px py-8 lg:py-12">
      <Breadcrumbs trail={[{ label: 'Sign in' }]} />

      <div className="mt-8 grid items-start gap-12 lg:grid-cols-2 lg:gap-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto w-full max-w-md lg:mx-0"
        >
          <p className="eyebrow">Welcome back</p>
          <h1 className="mt-3 font-display text-3xl text-ink-900 sm:text-4xl">Sign in</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-500">
            Track your orders, keep your wishlist across devices and check out faster.
          </p>

          <BackendNotice className="mt-6" />

          {notice && (
            <Alert tone="success" className="mt-6">
              {notice}
            </Alert>
          )}

          <form onSubmit={submit} className="mt-6 space-y-4">
            {failure && <Alert tone="error">{failure}</Alert>}

            <FormField
              id="login-email"
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@email.com"
              value={form.email}
              onChange={set('email')}
              error={errors.email}
            />

            <FormField
              id="login-password"
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={form.password}
              onChange={set('password')}
              error={errors.password}
            />

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-ink-500 transition-colors hover:text-ink-900"
              >
                Forgot your password?
              </Link>
            </div>

            <button type="submit" disabled={busy || !apiConfigured} className="btn-primary w-full">
              {busy ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500">
            New to Premium Clothes?{' '}
            <Link
              to="/signup"
              state={{ from: next }}
              className="link-underline font-semibold text-ink-900"
            >
              Create an account
            </Link>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="hidden overflow-hidden rounded-2xl lg:block"
        >
          <img
            src={WOMEN.lilacFormal}
            alt=""
            className="aspect-[4/5] w-full object-cover"
          />
        </motion.div>
      </div>
    </div>
  )
}
