import { createContext, useContext } from 'react'

/**
 * Auth context (architecture contract): wraps Firebase Auth's
 * onAuthStateChanged. No custom persistence — Firebase Auth owns it.
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
