import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, MapPin, Phone, Check } from 'lucide-react'
import {
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
  YoutubeIcon,
} from './SocialIcons'
import { CATEGORIES } from '../data/products'
import { api, apiConfigured } from '../utils/api'

const HELP_LINKS = [
  { label: 'Shipping & Delivery', to: '/shipping' },
  { label: 'Returns & Exchange', to: '/returns' },
  { label: 'Size Guide', to: '/size-guide' },
  { label: 'FAQs', to: '/faq' },
  { label: 'Track Order', to: '/account' },
]

const COMPANY_LINKS = [
  { label: 'Our Story', to: '/about' },
  { label: 'Contact Us', to: '/contact' },
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Service', to: '/terms' },
]

const SOCIALS = [
  { icon: InstagramIcon, label: 'Instagram', href: 'https://instagram.com' },
  { icon: FacebookIcon, label: 'Facebook', href: 'https://facebook.com' },
  { icon: TwitterIcon, label: 'Twitter', href: 'https://twitter.com' },
  { icon: YoutubeIcon, label: 'YouTube', href: 'https://youtube.com' },
]

export default function Footer() {
  return (
    <footer className="mt-16 bg-ink-950 pb-[calc(3.5rem+env(safe-area-inset-bottom))] text-ink-200 lg:mt-24 lg:pb-0">
      <Newsletter />

      <div className="container-px grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-5 lg:gap-8">
        <div className="lg:col-span-2">
          <Link to="/" className="flex flex-col leading-none">
            <span className="font-display text-2xl font-semibold tracking-[0.2em] text-white">
              PREMIUM
            </span>
            <span className="mt-1 text-[0.58rem] font-medium uppercase tracking-[0.42em] text-gold-400">
              Clothes
            </span>
          </Link>

          <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink-400">
            Shalwar kameez, sherwani and unstitched suiting, cut from fabrics we source
            ourselves and finished by tailors who have been with us for years.
          </p>

          <ul className="mt-6 space-y-3 text-sm text-ink-400">
            <li className="flex items-start gap-3">
              <MapPin size={16} className="mt-0.5 shrink-0 text-gold-500" />
              <span>Shop 14, Tariq Road, Karachi, Pakistan</span>
            </li>
            <li>
              <a
                href="tel:+92211234567"
                className="flex items-center gap-3 transition-colors hover:text-white"
              >
                <Phone size={16} className="shrink-0 text-gold-500" />
                +92 21 1234 567
              </a>
            </li>
            <li>
              <a
                href="mailto:hello@premiumclothes.pk"
                className="flex items-center gap-3 transition-colors hover:text-white"
              >
                <Mail size={16} className="shrink-0 text-gold-500" />
                hello@premiumclothes.pk
              </a>
            </li>
          </ul>

          <div className="mt-6 flex gap-2">
            {SOCIALS.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={label}
                className="grid h-10 w-10 place-items-center rounded-full border border-ink-700 text-ink-300 transition-all duration-300 hover:-translate-y-1 hover:border-gold-500 hover:text-gold-400"
              >
                <Icon size={17} />
              </a>
            ))}
          </div>
        </div>

        <FooterColumn title="Shop">
          {CATEGORIES.map((c) => (
            <FooterLink key={c.slug} to={`/category/${c.slug}`}>
              {c.short}
            </FooterLink>
          ))}
          <FooterLink to="/shop">All Products</FooterLink>
        </FooterColumn>

        <FooterColumn title="Help">
          {HELP_LINKS.map((l) => (
            <FooterLink key={l.to} to={l.to}>
              {l.label}
            </FooterLink>
          ))}
        </FooterColumn>

        <FooterColumn title="Company">
          {COMPANY_LINKS.map((l) => (
            <FooterLink key={l.to} to={l.to}>
              {l.label}
            </FooterLink>
          ))}
        </FooterColumn>
      </div>

      <div className="border-t border-ink-800">
        <div className="container-px flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
          <p className="text-xs text-ink-500">
            © {new Date().getFullYear()} Premium Clothes. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {['Visa', 'Mastercard', 'EasyPaisa', 'JazzCash', 'COD'].map((method) => (
              <span
                key={method}
                className="rounded border border-ink-800 px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-wider text-ink-500"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, children }) {
  return (
    <div>
      <h3 className="mb-5 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white">
        {title}
      </h3>
      <ul className="space-y-3">{children}</ul>
    </div>
  )
}

function FooterLink({ to, children }) {
  return (
    <li>
      <Link
        to={to}
        className="text-sm text-ink-400 transition-colors duration-300 hover:text-gold-400"
      >
        {children}
      </Link>
    </li>
  )
}

function Newsletter() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return

    setBusy(true)
    setError('')
    try {
      // Without a backend this still confirms, so the form is never a dead end.
      if (apiConfigured) await api.subscribe(email.trim())
      setDone(true)
      setEmail('')
      setTimeout(() => setDone(false), 4000)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="border-b border-ink-800">
      <div className="container-px flex flex-col items-center gap-8 py-14 text-center lg:flex-row lg:justify-between lg:text-left">
        <div className="max-w-md">
          <p className="eyebrow">Stay in the loop</p>
          <h2 className="mt-3 text-3xl text-white sm:text-4xl">
            New drops, before anyone else
          </h2>
          <p className="mt-3 text-sm text-ink-400">
            Collection launches and restock alerts. No more than twice a month.
          </p>
        </div>

        <form onSubmit={submit} className="w-full max-w-md">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              aria-label="Email address"
              className="w-full rounded-full border border-ink-700 bg-ink-900 px-5 py-3 text-sm text-white placeholder:text-ink-500 focus:border-gold-500 focus:outline-none"
            />
            <button type="submit" disabled={busy} className="btn-gold shrink-0">
              {busy ? 'Joining…' : 'Subscribe'}
            </button>
          </div>

          {error && (
            <p className="mt-3 text-xs text-blush-400">{error}</p>
          )}

          {done && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center justify-center gap-2 text-xs text-gold-400 lg:justify-start"
            >
              <Check size={14} /> You are on the list. Watch your inbox.
            </motion.p>
          )}
        </form>
      </div>
    </div>
  )
}
