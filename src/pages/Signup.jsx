import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import Breadcrumbs from '../components/Breadcrumbs'
import FormField from '../components/FormField'
import Alert from '../components/Alert'
import BackendNotice from '../components/BackendNotice'
import { useAuth } from '../context/AuthContext'
import { WOMEN } from '../data/images'

const PERKS = [
  'Track every order from one place',
  'Wishlist saved across your devices',
  'Checkout without retyping your address',
  'Write reviews on what you have bought',
]

export default function Signup() {
  const { signUp, apiConfigured, isAuthed } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const next = location.state?.from ?? '/account'

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
  })
  const [errors, setErrors] = useState({})
  const [failure, setFailure] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
    setFailure('')
  }

  const submit = async (e) => {
    e.preventDefault()

    const found = {}
    if (!form.name.trim()) found.name = 'Please enter your name'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) found.email = 'Enter a valid email address'
    if (form.password.length < 8) found.password = 'Use at least 8 characters'
    if (form.confirm !== form.password) found.confirm = 'Passwords do not match'
    setErrors(found)
    if (Object.keys(found).length) return

    setBusy(true)
    setFailure('')
    try {
      await signUp({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      })
      navigate(next, { replace: true })
    } catch (err) {
      setFailure(err.message)
    } finally {
      setBusy(false)
    }
  }

  /* Someone who is already signed in has no use for this page. */
  if (isAuthed) return <Navigate to={next} replace />

  return (
    <div className="container-px py-8 lg:py-12">
      <Breadcrumbs trail={[{ label: 'Create account' }]} />

      <div className="mt-8 grid items-start gap-12 lg:grid-cols-2 lg:gap-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto w-full max-w-md lg:mx-0"
        >
          <p className="eyebrow">Join us</p>
          <h1 className="mt-3 font-display text-3xl text-ink-900 sm:text-4xl">
            Create your account
          </h1>

          <BackendNotice className="mt-6" />

          <form onSubmit={submit} className="mt-6 space-y-4">
            {failure && <Alert tone="error">{failure}</Alert>}

            <FormField
              id="signup-name"
              label="Full name"
              autoComplete="name"
              placeholder="Ayesha Khan"
              value={form.name}
              onChange={set('name')}
              error={errors.name}
            />

            <FormField
              id="signup-email"
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@email.com"
              value={form.email}
              onChange={set('email')}
              error={errors.email}
            />

            <FormField
              id="signup-phone"
              label="Phone (optional)"
              type="tel"
              autoComplete="tel"
              placeholder="03XX XXXXXXX"
              value={form.phone}
              onChange={set('phone')}
              error={errors.phone}
            />

            <FormField
              id="signup-password"
              label="Password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={form.password}
              onChange={set('password')}
              error={errors.password}
              hint={!errors.password ? 'Use at least 8 characters.' : undefined}
            />

            <FormField
              id="signup-confirm"
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat your password"
              value={form.confirm}
              onChange={set('confirm')}
              error={errors.confirm}
            />

            <button type="submit" disabled={busy || !apiConfigured} className="btn-primary w-full">
              {busy ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating account…
                </>
              ) : (
                'Create account'
              )}
            </button>

            <p className="text-center text-[0.7rem] leading-relaxed text-ink-400">
              By creating an account you agree to our{' '}
              <Link to="/terms" className="link-underline text-ink-600">
                terms
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="link-underline text-ink-600">
                privacy policy
              </Link>
              .
            </p>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500">
            Already have an account?{' '}
            <Link
              to="/login"
              state={{ from: next }}
              className="link-underline font-semibold text-ink-900"
            >
              Sign in
            </Link>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="lg:sticky lg:top-28"
        >
          <div className="relative overflow-hidden rounded-2xl bg-ink-900">
            <img
              src={WOMEN.creamSuit}
              alt=""
              className="aspect-[4/3] w-full object-cover opacity-60 lg:aspect-[4/5]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-7">
              <h2 className="font-display text-2xl text-white">
                Everything in one account
              </h2>
              <ul className="mt-5 space-y-3">
                {PERKS.map((perk) => (
                  <li key={perk} className="flex items-start gap-2.5 text-sm text-ink-200">
                    <Check size={15} className="mt-0.5 shrink-0 text-gold-400" />
                    {perk}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
