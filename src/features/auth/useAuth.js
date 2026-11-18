import { createContext, useContext } from 'react'

/**
 * Auth context (demo mode): wraps the browser-local demo session provided
 * by AuthProvider / demoSession.js. No Firebase Auth or server persistence.
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
