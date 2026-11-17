import { createContext, useContext } from 'react'

/**
 * Auth context (architecture contract): wraps supabase.auth.getSession() and
 * onAuthStateChange. No custom persistence — the Supabase client owns it.
 *
 * status: 'loading' | 'authenticated' | 'unauthenticated'
 */
export const AuthContext = createContext(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
