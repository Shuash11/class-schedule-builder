import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabaseClient.js'
import { AuthContext } from './useAuth.js'

/**
 * Provides the current Supabase session to the app and keeps it in sync via
 * onAuthStateChange (covers sign-in, sign-out and expired tokens, which
 * redirects protected routes to /login).
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let active = true

    const applySession = (nextSession) => {
      setSession(nextSession ?? null)
      setStatus(nextSession ? 'authenticated' : 'unauthenticated')
    }

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!active) return
        if (error) {
          // A failed session lookup is handled as signed-out (safe default):
          // protected routes redirect to /login where the user can retry.
          applySession(null)
          return
        }
        applySession(data.session)
      })
      .catch(() => {
        if (active) applySession(null)
      })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      applySession(nextSession)
    })

    return () => {
      active = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      status,
      /**
       * Signs this browser out. `local` scope removes the stored session even
       * when the server-side revocation call fails (security review M-01);
       * the error is surfaced to the caller so a failed sign-out is visible.
       */
      signOut: async () => {
        const { error } = await supabase.auth.signOut({ scope: 'local' })
        if (error) throw error
      },
    }),
    [session, status],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
