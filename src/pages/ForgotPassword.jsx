import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Check, KeyRound, Mail, ShieldCheck } from 'lucide-react'
import Breadcrumbs from '../components/Breadcrumbs'
import FormField from '../components/FormField'
import Alert from '../components/Alert'
import BackendNotice from '../components/BackendNotice'
import { api, apiConfigured } from '../utils/api'

const STEPS = [
  { key: 'email', label: 'Your email', icon: Mail },
  { key: 'code', label: 'Enter code', icon: KeyRound },
  { key: 'password', label: 'New password', icon: ShieldCheck },
]

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState({})
  const [failure, setFailure] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  const clearMessages = () => {
    setFailure('')
    setErrors({})
  }

  const sendCode = async (e) => {
    e?.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setErrors({ email: 'Enter a valid email address' })
      return
    }
    clearMessages()
    setBusy(true)
    try {
      const res = await api.requestReset(email.trim())
      setNotice(res.message)
      setStep(1)
    } catch (err) {
      setFailure(err.message)
    } finally {
      setBusy(false)
    }
  }

  const verifyCode = async (e) => {
    e.preventDefault()
    if (!/^\d{6}$/.test(code.trim())) {
      setErrors({ code: 'Enter the 6-digit code' })
      return
    }
    clearMessages()
    setBusy(true)
    try {
      await api.verifyReset(email.trim(), code.trim())
      setNotice('')
      setStep(2)
    } catch (err) {
      setFailure(err.message)
    } finally {
      setBusy(false)
    }
  }

  const savePassword = async (e) => {
    e.preventDefault()
    const found = {}
    if (password.length < 8) found.password = 'Use at least 8 characters'
    if (confirm !== password) found.confirm = 'Passwords do not match'
    setErrors(found)
    if (Object.keys(found).length) return

    setFailure('')
    setBusy(true)
    try {
      await api.resetPassword(email.trim(), code.trim(), password)
      navigate('/login', {
        replace: true,
        state: { notice: 'Your password has been reset. Sign in with it now.' },
      })
    } catch (err) {
      setFailure(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="container-px py-8 lg:py-12">
      <Breadcrumbs trail={[{ label: 'Sign in', to: '/login' }, { label: 'Reset password' }]} />

      <div className="mx-auto mt-8 w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
          <p className="eyebrow">Account recovery</p>
          <h1 className="mt-3 font-display text-3xl text-ink-900 sm:text-4xl">
            Reset your password
          </h1>
        </motion.div>

        <BackendNotice className="mt-6" />

        <ol className="mt-8 flex items-center">
          {STEPS.map((s, i) => (
            <li key={s.key} className="flex flex-1 items-center last:flex-none">
              <div className="flex items-center gap-2.5">
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors duration-300 ${
                    i < step
                      ? 'bg-gold-500 text-ink-900'
                      : i === step
                        ? 'bg-ink-900 text-white'
                        : 'bg-ink-100 text-ink-400'
                  }`}
                >
                  {i < step ? <Check size={14} strokeWidth={3} /> : <s.icon size={14} />}
                </span>
                <span
                  className={`hidden text-xs font-semibold uppercase tracking-[0.12em] sm:block ${
                    i <= step ? 'text-ink-900' : 'text-ink-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <span className="mx-3 h-px flex-1 bg-ink-200">
                  <motion.span
                    className="block h-full bg-gold-500"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: i < step ? 1 : 0 }}
                    style={{ transformOrigin: 'left' }}
                    transition={{ duration: 0.4 }}
                  />
                </span>
              )}
            </li>
          ))}
        </ol>

        <div className="mt-8 space-y-4">
          {failure && <Alert tone="error">{failure}</Alert>}
          {notice && step === 1 && <Alert tone="success">{notice}</Alert>}

          <AnimatePresence mode="wait">
            {step === 0 && (
              <Panel key="email">
                <form onSubmit={sendCode} className="space-y-4">
                  <p className="text-sm leading-relaxed text-ink-500">
                    Enter the email on your account and we will send you a six-digit
                    code.
                  </p>
                  <FormField
                    id="reset-email"
                    label="Email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      clearMessages()
                    }}
                    error={errors.email}
                  />
                  <button
                    type="submit"
                    disabled={busy || !apiConfigured}
                    className="btn-primary w-full"
                  >
                    {busy ? 'Sending…' : 'Send reset code'}
                  </button>
                </form>
              </Panel>
            )}

            {step === 1 && (
              <Panel key="code">
                <form onSubmit={verifyCode} className="space-y-4">
                  <p className="text-sm leading-relaxed text-ink-500">
                    We sent a code to{' '}
                    <span className="font-medium text-ink-900">{email}</span>. It expires
                    in 30 minutes.
                  </p>
                  <FormField
                    id="reset-code"
                    label="Six-digit code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="123456"
                    maxLength={6}
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.replace(/\D/g, ''))
                      clearMessages()
                    }}
                    error={errors.code}
                  />
                  <button
                    type="submit"
                    disabled={busy}
                    className="btn-primary w-full"
                  >
                    {busy ? 'Checking…' : 'Continue'}
                  </button>
                  <button
                    type="button"
                    onClick={sendCode}
                    disabled={busy}
                    className="w-full text-center text-xs font-medium text-ink-500 transition-colors hover:text-ink-900"
                  >
                    Did not get it? Send another code
                  </button>
                </form>
              </Panel>
            )}

            {step === 2 && (
              <Panel key="password">
                <form onSubmit={savePassword} className="space-y-4">
                  <p className="text-sm leading-relaxed text-ink-500">
                    Choose a new password. Signing in elsewhere will be required again.
                  </p>
                  <FormField
                    id="reset-password"
                    label="New password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      clearMessages()
                    }}
                    error={errors.password}
                  />
                  <FormField
                    id="reset-confirm"
                    label="Confirm new password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Repeat your password"
                    value={confirm}
                    onChange={(e) => {
                      setConfirm(e.target.value)
                      clearMessages()
                    }}
                    error={errors.confirm}
                  />
                  <button type="submit" disabled={busy} className="btn-primary w-full">
                    {busy ? 'Saving…' : 'Reset password'}
                  </button>
                </form>
              </Panel>
            )}
          </AnimatePresence>

          <Link
            to="/login"
            className="flex items-center justify-center gap-2 pt-2 text-xs font-medium text-ink-500 transition-colors hover:text-ink-900"
          >
            <ArrowLeft size={14} />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}

function Panel({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
