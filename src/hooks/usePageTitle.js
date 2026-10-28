import { useEffect } from 'react'
import { STORE } from '../data/config'

export const DEFAULT_TITLE = `${STORE.name} — Shalwar Kameez, Sherwani & Unstitched`

/** Sets the browser tab title for the current page; with no argument, the site default. */
export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} — ${STORE.name}` : DEFAULT_TITLE
  }, [title])
}
