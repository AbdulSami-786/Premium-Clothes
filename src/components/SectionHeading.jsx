import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Reveal from './Reveal'

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  action,
}) {
  const centered = align === 'center'
  return (
    <Reveal
      className={`mb-10 flex flex-col gap-4 sm:mb-14 ${
        centered ? 'items-center text-center' : 'items-start'
      } ${action ? 'sm:flex-row sm:items-end sm:justify-between sm:text-left' : ''}`}
    >
      <div className={centered && !action ? 'max-w-2xl' : 'max-w-xl'}>
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h2 className="text-3xl leading-tight text-ink-900 sm:text-4xl lg:text-5xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-4 text-sm leading-relaxed text-ink-500 sm:text-base">
            {subtitle}
          </p>
        )}
      </div>

      {action && (
        <Link
          to={action.to}
          className="group inline-flex shrink-0 items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink-900"
        >
          <span className="link-underline">{action.label}</span>
          <ArrowRight
            size={15}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </Link>
      )}
    </Reveal>
  )
}
