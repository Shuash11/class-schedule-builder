import { useEffect, useMemo, useState } from 'react'
import {
  resolveSession,
  signOut as firestoreSignOut,
  subscribeAuth,
} from './services/auth.js'
import { AuthContext } from './useAuth.js'

/**
 * Firestore-backed demo auth provider: resolves the session from Firestore on
 * mount and listens for sign-in/sign-out events. No Firebase Auth is used.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let active = true
    const apply = (next) => {
      if (!active) return
      setUser(next)
      setStatus(next ? 'authenticated' : 'unauthenticated')
    }
    const unsubscribe = subscribeAuth(apply)
    resolveSession().then(apply).catch(() => apply(null))
    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      status,
      signOut: async () => {
        await firestoreSignOut()
      },
    }),
    [user, status],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
