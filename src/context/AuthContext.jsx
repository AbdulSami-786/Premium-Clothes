import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { api, apiConfigured, ApiError } from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useLocalStorage('pc.token', null)
  const [user, setUser] = useState(null)
  /* 'loading' until the stored token has been checked, so pages do not flash
     a signed-out state for a visitor who is actually signed in. */
  const [status, setStatus] = useState(token && apiConfigured ? 'loading' : 'ready')

  useEffect(() => {
    if (!token || !apiConfigured) {
      setUser(null)
      setStatus('ready')
      return
    }

    let cancelled = false
    api
      .me(token)
      .then((res) => {
        if (!cancelled) setUser(res.user)
      })
      .catch((err) => {
        // Only clear the token when the server actually rejected it; a network
        // blip should not sign the customer out.
        if (!cancelled && err instanceof ApiError && err.code === 'AUTH') {
          setToken(null)
          setUser(null)
        }
      })
      .finally(() => {
        if (!cancelled) setStatus('ready')
      })

    return () => {
      cancelled = true
    }
  }, [token, setToken])

  const signIn = useCallback(
    async (email, password) => {
      const res = await api.login(email, password)
      setToken(res.token)
      setUser(res.user)
      return res.user
    },
    [setToken],
  )

  const signUp = useCallback(
    async (fields) => {
      const res = await api.signup(fields)
      setToken(res.token)
      setUser(res.user)
      return res.user
    },
    [setToken],
  )

  const signOut = useCallback(async () => {
    const current = token
    setToken(null)
    setUser(null)
    // Best effort — the local session is already gone either way.
    if (current) {
      try {
        await api.logout(current)
      } catch {
        /* ignored */
      }
    }
  }, [token, setToken])

  const updateProfile = useCallback(
    async (fields) => {
      const res = await api.updateProfile(token, fields)
      setUser(res.user)
      return res.user
    },
    [token],
  )

  const value = useMemo(
    () => ({
      token,
      user,
      status,
      isAuthed: Boolean(user),
      ready: status === 'ready',
      apiConfigured,
      signIn,
      signUp,
      signOut,
      updateProfile,
    }),
    [token, user, status, signIn, signUp, signOut, updateProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
