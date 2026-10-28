import { useEffect, useRef, useState } from 'react'

/**
 * State that survives a refresh. Every access is guarded because storage can
 * throw in private windows or when the user has blocked site data.
 *
 * It also follows changes made in other tabs, so two open tabs share one cart
 * instead of the later write silently overwriting the earlier one.
 *
 * `isValid` guards against a stored value of the wrong shape (hand-edited or
 * left by an older version): such a value is replaced by `initialValue`
 * rather than handed to code that expects an array and crashes on it.
 */
export function useLocalStorage(key, initialValue, isValid = () => true) {
  const parse = (raw) => {
    if (!raw) return initialValue
    const parsed = JSON.parse(raw)
    return isValid(parsed) ? parsed : initialValue
  }

  const [value, setValue] = useState(() => {
    try {
      return parse(window.localStorage.getItem(key))
    } catch {
      return initialValue
    }
  })

  // Read through a ref so a fresh `[]` literal at the call site does not
  // re-subscribe the listener on every render.
  const reader = useRef(parse)
  useEffect(() => {
    reader.current = parse
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* Storage unavailable — the app still works, it just will not persist. */
    }
  }, [key, value])

  useEffect(() => {
    const onStorage = (event) => {
      if (event.storageArea !== window.localStorage) return
      // `key` is null when another tab clears all storage.
      if (event.key !== null && event.key !== key) return
      try {
        setValue(reader.current(event.newValue))
      } catch {
        /* A value we cannot parse is ignored; this tab keeps its own state. */
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [key])

  return [value, setValue]
}
