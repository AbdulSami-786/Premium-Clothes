import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export default function Breadcrumbs({ trail }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs">
      <Link to="/" className="text-ink-400 transition-colors hover:text-ink-900">
        Home
      </Link>
      {trail.map((crumb, i) => (
        <span key={crumb.label} className="flex items-center gap-1.5">
          <ChevronRight size={12} className="text-ink-300" />
          {crumb.to && i < trail.length - 1 ? (
            <Link to={crumb.to} className="text-ink-400 transition-colors hover:text-ink-900">
              {crumb.label}
            </Link>
          ) : (
            <span className="font-medium text-ink-800">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
