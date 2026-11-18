/**
 * Demo sign-in session (NON-PRODUCTION). The login/register screens keep
 * their existing journey, but the session is stored in this browser only —
 * no Firebase Auth network call, no account, no password verification.
 * Firestore demo rules are open, so this is a UX-only sign-in, NOT security.
 */
const STORAGE_KEY = 'class-schedule-builder-demo-session'
const listeners = new Set()

function readSession() {
  try {
    if (typeof localStorage === 'undefined') return null
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function getDemoSession() {
  return readSession()
}

export function setDemoSession(email) {
  const session = { email, signedInAt: new Date().toISOString() }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  } catch {
    // Storage can be unavailable (private mode) — keep the in-memory session.
  }
  listeners.forEach((listener) => listener(session))
  return session
}

export function clearDemoSession() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignore storage failures.
  }
  listeners.forEach((listener) => listener(null))
}

export function subscribeDemoSession(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
