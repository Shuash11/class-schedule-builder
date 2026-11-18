import { getDemoSession, setDemoSession, clearDemoSession } from '../../../lib/demoSession.js'

/**
 * Demo-mode auth service (NON-PRODUCTION). The form validation lives in the
 * login/register pages; these functions only maintain a browser-local demo
 * session so the UI journey works. There is no Firebase Auth call and no
 * security boundary — Firestore demo rules are intentionally open.
 */
export const AUTH_MESSAGES = {
  invalidCredentials: 'Incorrect email or password. Try again.',
  emailInUse: 'An account with this email already exists. Try signing in.',
  tooManyAttempts: 'Too many attempts. Try again in a few minutes.',
  notConfigured: 'Sign-in is not set up yet. Ask the site owner to enable Email/Password sign-in.',
  network: "Couldn't sign in. Check your connection and try again.",
}

/** Signs in locally; the auth listener redirects to /dashboard. */
export async function signInWithPassword({ email }) {
  setDemoSession(email)
}

/** Registers locally (demo): no account is created on any server. */
export async function signUp({ email }) {
  setDemoSession(email)
  return { emailConfirmed: true }
}

/** Clears the local demo session. */
export async function signOut() {
  clearDemoSession()
}

/** Stable local id used as a label in Firestore documents (not an identity). */
export function getUserId() {
  return getDemoSession()?.email ?? 'demo-local'
}
