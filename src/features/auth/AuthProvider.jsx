import { useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../../lib/firebaseClient.js'
import { AuthContext } from './useAuth.js'

/**
 * Provides the current Firebase Auth user to the app and keeps it in sync via
 * onAuthStateChanged. Firebase fires the listener immediately with the
 * existing session, so it covers both the initial lookup and every later
 * change (sign-in, sign-out) — protected routes redirect accordingly.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (nextUser) => {
        setUser(nextUser)
        setStatus(nextUser ? 'authenticated' : 'unauthenticated')
      },
      () => {
        // A failed auth-state lookup is handled as signed-out (safe default):
        // protected routes redirect to /login where the user can retry.
        setUser(null)
        setStatus('unauthenticated')
      },
    )

    return unsubscribe
  }, [])

  const value = useMemo(
    () => ({
      user,
      status,
      /**
       * Signs this browser out. Firebase Auth removes its own stored session,
       * and the error is surfaced to the caller so a failed sign-out is
       * visible (AppLayout shows an alert).
       */
      signOut: async () => {
        await signOut(auth)
      },
    }),
    [user, status],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
