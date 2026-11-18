import { useEffect, useMemo, useState } from 'react'
import {
  getDemoSession,
  subscribeDemoSession,
} from '../../lib/demoSession.js'
import { signOut as demoSignOut } from './services/auth.js'
import { AuthContext } from './useAuth.js'

/**
 * Demo-mode auth provider (NON-PRODUCTION): exposes a browser-local session
 * to the existing UI. No Firebase Auth/network calls — Firestore demo rules
 * are open, so every route stays usable with or without signing in.
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => getDemoSession())

  useEffect(() => subscribeDemoSession(setSession), [])

  const value = useMemo(
    () => ({
      user: session ? { email: session.email } : null,
      status: session ? 'authenticated' : 'unauthenticated',
      signOut: async () => {
        await demoSignOut()
      },
    }),
    [session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
