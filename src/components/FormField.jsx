import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

/** Text input with a label and inline error, used across the auth pages. */
export default function FormField({
  label,
  id,
  error,
  hint,
  type = 'text',
  ...props
}) {
  const [revealed, setRevealed] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && revealed ? 'text' : type

  return (
    <div>
      <label className="label" htmlFor={id}>
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={inputType}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={`field ${isPassword ? 'pr-12' : ''} ${
            error ? 'border-blush-500 focus:border-blush-500 focus:ring-blush-500' : ''
          }`}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((r) => !r)}
            aria-label={revealed ? 'Hide password' : 'Show password'}
            className="absolute right-1 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-ink-400 transition-colors hover:text-ink-900"
          >
            {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>

      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-blush-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-ink-400">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
