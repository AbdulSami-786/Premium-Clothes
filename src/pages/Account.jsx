import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Heart,
  LogOut,
  Package,
  PackageOpen,
  Search,
  User as UserIcon,
} from 'lucide-react'
import Breadcrumbs from '../components/Breadcrumbs'
import FormField from '../components/FormField'
import Alert from '../components/Alert'
import BackendNotice from '../components/BackendNotice'
import OrderCard from '../components/OrderCard'
import { useAuth } from '../context/AuthContext'
import { useShop } from '../context/ShopContext'
import { api, apiConfigured } from '../utils/api'

const TABS = [
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'profile', label: 'Profile', icon: UserIcon },
  { id: 'track', label: 'Track order', icon: Search },
]

export default function Account() {
  const { user, ready, isAuthed, signOut } = useAuth()
  const navigate = useNavigate()
  const [requestedTab, setTab] = useState('orders')

  /* Signed-out visitors only have the lookup tool, so fall back to it rather
     than rendering an empty dashboard — derived, so signing out switches
     immediately without a second render. */
  const tab = isAuthed ? requestedTab : 'track'

  if (!ready) {
    return (
      <div className="container-px flex min-h-[50vh] items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-ink-200 border-t-ink-900" />
      </div>
    )
  }

  return (
    <div className="container-px py-8 lg:py-12">
      <Breadcrumbs trail={[{ label: 'Account' }]} />

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Account</p>
          <h1 className="mt-3 font-display text-3xl text-ink-900 sm:text-4xl">
            {isAuthed ? `Hello, ${user.name.split(' ')[0]}` : 'Your account'}
          </h1>
          {isAuthed && <p className="mt-2 text-sm text-ink-500">{user.email}</p>}
        </div>

        {isAuthed ? (
          <button
            type="button"
            onClick={async () => {
              await signOut()
              navigate('/')
            }}
            className="btn-outline"
          >
            <LogOut size={15} />
            Sign out
          </button>
        ) : (
          <div className="flex gap-3">
            <Link to="/login" className="btn-primary">
              Sign in
            </Link>
            <Link to="/signup" className="btn-outline">
              Create account
            </Link>
          </div>
        )}
      </div>

      <BackendNotice className="mt-6" />

      <div className="no-scrollbar mt-8 flex gap-1 overflow-x-auto border-b border-ink-100">
        {TABS.filter((t) => isAuthed || t.id === 'track').map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`relative flex shrink-0 items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] transition-colors ${
              tab === id ? 'text-ink-900' : 'text-ink-400 hover:text-ink-700'
            }`}
          >
            <Icon size={15} />
            {label}
            {tab === id && (
              <motion.span
                layoutId="account-tab"
                className="absolute inset-x-0 -bottom-px h-0.5 bg-ink-900"
              />
            )}
          </button>
        ))}
      </div>

      <div className="mt-10">
        <AnimatePresence mode="wait">
          {tab === 'orders' && <OrdersTab key="orders" />}
          {tab === 'profile' && <ProfileTab key="profile" />}
          {tab === 'track' && <TrackTab key="track" />}
        </AnimatePresence>
      </div>
    </div>
  )
}

function Fade({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}

function OrdersTab() {
  const { token } = useAuth()
  const { wishlist } = useShop()
  const [orders, setOrders] = useState([])
  const [state, setState] = useState(apiConfigured && token ? 'loading' : 'ready')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!apiConfigured || !token) return
    let cancelled = false
    api
      .myOrders(token)
      .then((res) => {
        if (!cancelled) {
          setOrders(res.orders)
          setState('ready')
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message)
          setState('ready')
        }
      })
    return () => {
      cancelled = true
    }
  }, [token])

  if (state === 'loading') {
    return (
      <Fade>
        <div className="space-y-4">
          {[0, 1].map((i) => (
            <div key={i} className="skeleton h-36 rounded-2xl" />
          ))}
        </div>
      </Fade>
    )
  }

  return (
    <Fade>
      {error && <Alert tone="error">{error}</Alert>}

      {!error && orders.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-ink-100 py-20 text-center">
          <PackageOpen size={36} className="text-ink-200" />
          <h2 className="font-display text-2xl text-ink-900">No orders yet</h2>
          <p className="max-w-sm text-sm text-ink-400">
            Once you place an order it will appear here with its status and items.
          </p>
          <Link to="/shop" className="btn-primary mt-2">
            Start shopping
          </Link>
        </div>
      )}

      {orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}

      <div className="mt-8 flex items-center justify-between rounded-2xl bg-ink-50/70 p-6">
        <div className="flex items-center gap-3">
          <Heart size={18} className="text-blush-500" />
          <div>
            <p className="text-sm font-semibold text-ink-900">Your wishlist</p>
            <p className="text-xs text-ink-500">
              {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>
        </div>
        <Link to="/wishlist" className="btn-outline">
          View
        </Link>
      </div>
    </Fade>
  )
}

function ProfileTab() {
  const { user, token, updateProfile } = useAuth()
  const [form, setForm] = useState({ name: user?.name ?? '', phone: user?.phone ?? '' })
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [profileMsg, setProfileMsg] = useState(null)
  const [pwMsg, setPwMsg] = useState(null)
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)

  const saveProfile = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setErrors({ name: 'Name cannot be empty' })
      return
    }
    setErrors({})
    setBusy(true)
    setProfileMsg(null)
    try {
      await updateProfile({ name: form.name.trim(), phone: form.phone.trim() })
      setProfileMsg({ tone: 'success', text: 'Your details have been saved.' })
    } catch (err) {
      setProfileMsg({ tone: 'error', text: err.message })
    } finally {
      setBusy(false)
    }
  }

  const savePassword = async (e) => {
    e.preventDefault()
    const found = {}
    if (!pw.current) found.current = 'Enter your current password'
    if (pw.next.length < 8) found.next = 'Use at least 8 characters'
    if (pw.confirm !== pw.next) found.confirm = 'Passwords do not match'
    setErrors(found)
    if (Object.keys(found).length) return

    setBusy(true)
    setPwMsg(null)
    try {
      await api.changePassword(token, pw.current, pw.next)
      setPw({ current: '', next: '', confirm: '' })
      setPwMsg({ tone: 'success', text: 'Password updated. Other devices were signed out.' })
    } catch (err) {
      setPwMsg({ tone: 'error', text: err.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Fade>
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <form onSubmit={saveProfile} className="max-w-md space-y-4">
          <h2 className="font-display text-2xl text-ink-900">Your details</h2>
          {profileMsg && <Alert tone={profileMsg.tone}>{profileMsg.text}</Alert>}

          <FormField
            id="profile-name"
            label="Full name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            error={errors.name}
          />
          <FormField
            id="profile-phone"
            label="Phone"
            type="tel"
            placeholder="03XX XXXXXXX"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
          <FormField id="profile-email" label="Email" value={user?.email ?? ''} disabled />

          <button type="submit" disabled={busy} className="btn-primary">
            Save changes
          </button>
        </form>

        <form onSubmit={savePassword} className="max-w-md space-y-4">
          <h2 className="font-display text-2xl text-ink-900">Change password</h2>
          {pwMsg && <Alert tone={pwMsg.tone}>{pwMsg.text}</Alert>}

          <FormField
            id="pw-current"
            label="Current password"
            type="password"
            autoComplete="current-password"
            value={pw.current}
            onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))}
            error={errors.current}
          />
          <FormField
            id="pw-next"
            label="New password"
            type="password"
            autoComplete="new-password"
            value={pw.next}
            onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))}
            error={errors.next}
          />
          <FormField
            id="pw-confirm"
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            value={pw.confirm}
            onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
            error={errors.confirm}
          />

          <button type="submit" disabled={busy} className="btn-primary">
            Update password
          </button>
        </form>
      </div>
    </Fade>
  )
}

function TrackTab() {
  const { token, isAuthed } = useAuth()
  const [orderId, setOrderId] = useState('')
  const [email, setEmail] = useState('')
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const lookup = async (e) => {
    e.preventDefault()
    if (!orderId.trim()) {
      setError('Enter your order number.')
      return
    }
    setError('')
    setBusy(true)
    setOrder(null)
    try {
      const res = await api.getOrder(orderId.trim(), { email: email.trim(), token })
      setOrder(res.order)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Fade>
      <div className="max-w-md">
        <h2 className="font-display text-2xl text-ink-900">Track an order</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-500">
          Enter your order number
          {isAuthed ? '.' : ', along with the email it was placed with.'}
        </p>

        <form onSubmit={lookup} className="mt-6 space-y-4">
          {error && <Alert tone="error">{error}</Alert>}

          <FormField
            id="track-id"
            label="Order number"
            placeholder="PC12345678"
            value={orderId}
            onChange={(e) => {
              setOrderId(e.target.value)
              setError('')
            }}
          />

          {!isAuthed && (
            <FormField
              id="track-email"
              label="Email on the order"
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError('')
              }}
            />
          )}

          <button type="submit" disabled={busy || !apiConfigured} className="btn-primary w-full">
            {busy ? 'Looking…' : 'Find my order'}
          </button>
        </form>
      </div>

      {order && (
        <div className="mt-8 max-w-2xl">
          <OrderCard order={order} defaultOpen />
        </div>
      )}
    </Fade>
  )
}
