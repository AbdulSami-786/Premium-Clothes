import { useEffect, useState } from 'react'

/**
 * State that survives a refresh. Every access is guarded because storage can
 * throw in private windows or when the user has blocked site data.
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key)
      return stored ? JSON.parse(stored) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* Storage unavailable — the app still works, it just will not persist. */
    }
  }, [key, value])

  return [value, setValue]
}
