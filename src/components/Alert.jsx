import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Info } from 'lucide-react'

const TONES = {
  error: {
    icon: AlertCircle,
    className: 'bg-blush-50 text-blush-800 border-blush-200',
  },
  success: {
    icon: CheckCircle2,
    className: 'bg-green-50 text-green-800 border-green-200',
  },
  info: {
    icon: Info,
    className: 'bg-ink-50 text-ink-700 border-ink-200',
  },
}

export default function Alert({ tone = 'info', children, className = '' }) {
  if (!children) return null
  const { icon: Icon, className: toneClass } = TONES[tone] ?? TONES.info

  return (
    <motion.div
      role={tone === 'error' ? 'alert' : 'status'}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm leading-relaxed ${toneClass} ${className}`}
    >
      <Icon size={16} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </motion.div>
  )
}
