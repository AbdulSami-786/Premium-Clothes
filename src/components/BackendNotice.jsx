import { apiConfigured } from '../utils/api'
import Alert from './Alert'

/**
 * Shown on pages that need the Apps Script backend when no API_URL is set, so
 * the forms explain themselves instead of failing on submit.
 */
export default function BackendNotice({ className = '' }) {
  if (apiConfigured) return null

  return (
    <Alert tone="info" className={className}>
      Accounts are not connected yet. Deploy the script in{' '}
      <code className="rounded bg-ink-100 px-1 py-0.5 text-[0.75em]">apps-script/</code>{' '}
      and paste its URL into{' '}
      <code className="rounded bg-ink-100 px-1 py-0.5 text-[0.75em]">
        src/data/config.js
      </code>
      . Browsing, the cart and the local wishlist all work without it.
    </Alert>
  )
}
