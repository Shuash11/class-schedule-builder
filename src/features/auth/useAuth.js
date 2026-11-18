import { createContext, useContext } from 'react'

/**
 * Auth context (demo mode): wraps the Firestore-backed session provided by
 * AuthProvider / services/auth.js. No Firebase Auth is used.
 *
 * status: 'authenticated' | 'unauthenticated'
 */
export const AuthContext = createContext(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
