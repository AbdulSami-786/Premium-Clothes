import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Clock, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react'
import Breadcrumbs from '../components/Breadcrumbs'
import Reveal from '../components/Reveal'
import Alert from '../components/Alert'
import { api, apiConfigured } from '../utils/api'
import { STORE, STORE_LINKS } from '../data/config'

const CHANNELS = [
  {
    icon: Phone,
    title: 'Call us',
    lines: [STORE.phone, 'Mon–Sat, 10am–8pm'],
    href: STORE_LINKS.tel,
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    lines: [STORE.whatsapp, 'Fastest for order updates'],
    href: STORE_LINKS.whatsapp,
  },
  {
    icon: Mail,
    title: 'Email',
    lines: [STORE.email, 'We reply within one working day'],
    href: STORE_LINKS.mailto,
  },
  {
    icon: MapPin,
    title: 'Visit',
    lines: STORE.address.split(/,\s*(.+)/).filter(Boolean),
  },
]

const SUBJECTS = [
  'Order enquiry',
  'Product question',
  'Exchange or return',
  'Bulk / wholesale',
  'Something else',
]

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: SUBJECTS[0],
    message: '',
  })
  const [sent, setSent] = useState(false)
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
    const next = {}
    if (!form.name.trim()) next.name = 'Please tell us your name'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address'
    if (form.message.trim().length < 10) next.message = 'A little more detail, please'

    setErrors(next)
    if (Object.keys(next).length > 0) return

    setBusy(true)
    setFailure('')
    try {
      /* Without a backend the form still validates and confirms locally, so
         the page is never a dead end during development. */
      if (apiConfigured) await api.contact(form)
      setSent(true)
      setForm({ name: '', email: '', subject: SUBJECTS[0], message: '' })
      setTimeout(() => setSent(false), 6000)
    } catch (err) {
      setFailure(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="container-px py-8 lg:py-12">
      <Breadcrumbs trail={[{ label: 'Contact' }]} />

      <Reveal className="mt-6 max-w-2xl">
        <p className="eyebrow">Contact</p>
        <h1 className="mt-3 font-display text-3xl text-ink-900 sm:text-5xl">
          We are easy to reach
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-ink-500 sm:text-base">
          Questions about sizing, an order on its way, or a fabric you cannot find —
          send a message and a real person will answer.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CHANNELS.map(({ icon: Icon, title, lines, href }, i) => {
          const Tag = href ? 'a' : 'div'
          return (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.08 }}
            >
              <Tag
                {...(href
                  ? {
                      href,
                      target: href.startsWith('http') ? '_blank' : undefined,
                      rel: href.startsWith('http') ? 'noreferrer noopener' : undefined,
                    }
                  : {})}
                className="block h-full rounded-2xl border border-ink-100 p-6 transition-all duration-400 hover:-translate-y-1 hover:border-gold-200 hover:shadow-soft"
              >
                <span className="grid h-11 w-11 place-items-center rounded-full bg-gold-50 text-gold-600">
                  <Icon size={19} />
                </span>
                <h2 className="mt-4 text-sm font-semibold text-ink-900">{title}</h2>
                {lines.map((line, j) => (
                  <p
                    key={line}
                    className={j === 0 ? 'mt-1.5 text-sm text-ink-700' : 'mt-0.5 text-xs text-ink-400'}
                  >
                    {line}
                  </p>
                ))}
              </Tag>
            </motion.div>
          )
        })}
      </div>

      <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <h2 className="font-display text-2xl text-ink-900 sm:text-3xl">
            Send us a message
          </h2>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="name">
                  Your name
                </label>
                <input
                  id="name"
                  value={form.name}
                  onChange={set('name')}
                  className={`field ${errors.name ? 'border-blush-500' : ''}`}
                  placeholder="Full name"
                />
                {errors.name && (
                  <p className="mt-1.5 text-xs font-medium text-blush-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="label" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  className={`field ${errors.email ? 'border-blush-500' : ''}`}
                  placeholder="you@email.com"
                />
                {errors.email && (
                  <p className="mt-1.5 text-xs font-medium text-blush-600">{errors.email}</p>
                )}
              </div>
            </div>

            <div>
              <label className="label" htmlFor="subject">
                Subject
              </label>
              <select
                id="subject"
                value={form.subject}
                onChange={set('subject')}
                className="field cursor-pointer"
              >
                {SUBJECTS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label" htmlFor="message">
                Message
              </label>
              <textarea
                id="message"
                rows={5}
                value={form.message}
                onChange={set('message')}
                className={`field resize-none ${errors.message ? 'border-blush-500' : ''}`}
                placeholder="How can we help?"
              />
              {errors.message && (
                <p className="mt-1.5 text-xs font-medium text-blush-600">{errors.message}</p>
              )}
            </div>

            {failure && <Alert tone="error">{failure}</Alert>}

            <button type="submit" disabled={busy} className="btn-primary w-full sm:w-auto">
              <Send size={15} />
              {busy ? 'Sending…' : 'Send message'}
            </button>

            {sent && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800"
              >
                <Check size={16} />
                Thank you — we have your message and will reply shortly.
              </motion.p>
            )}
          </form>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="overflow-hidden rounded-2xl border border-ink-100">
            <iframe
              title="Our location on the map"
              src="https://www.openstreetmap.org/export/embed.html?bbox=67.05%2C24.85%2C67.09%2C24.89&layer=mapnik"
              className="h-72 w-full border-0 sm:h-80"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="mt-6 rounded-2xl bg-ink-50/70 p-6">
            <h3 className="flex items-center gap-2 font-display text-lg text-ink-900">
              <Clock size={17} className="text-gold-600" />
              Shop hours
            </h3>
            <dl className="mt-4 space-y-2.5 text-sm">
              {[
                ['Monday – Thursday', '10:00 am – 8:00 pm'],
                ['Friday', '10:00 am – 12:30 pm, 2:30 – 8:00 pm'],
                ['Saturday', '10:00 am – 9:00 pm'],
                ['Sunday', '12:00 pm – 7:00 pm'],
              ].map(([day, hours]) => (
                <div key={day} className="flex justify-between gap-4">
                  <dt className="text-ink-500">{day}</dt>
                  <dd className="text-right font-medium text-ink-900">{hours}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      </div>
    </div>
  )
}
