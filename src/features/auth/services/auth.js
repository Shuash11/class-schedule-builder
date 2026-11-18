import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from '../../../lib/firebaseClient.js'

/**
 * Auth error mapping (design-spec §6.1 / §11). The approved messages are
 * shared by /login and /register; anything unrecognized (including
 * network/fetch failures) falls back to the network message.
 */
export const AUTH_MESSAGES = {
  invalidCredentials: 'Incorrect email or password. Try again.',
  emailInUse: 'An account with this email already exists. Try signing in.',
  tooManyAttempts: 'Too many attempts. Try again in a few minutes.',
  // Lead-approved Firebase-specific diagnostic: a CLI-created project has no
  // Auth config until Email/Password is enabled in the Firebase console.
  notConfigured:
    'Sign-in is not set up yet. Ask the site owner to enable Email/Password sign-in.',
  network: "Couldn't sign in. Check your connection and try again.",
}

// Firebase Auth error codes → user-facing copy. `auth/invalid-credential` is
// the current code for wrong credentials (email enumeration protection);
// `auth/wrong-password` / `auth/user-not-found` are kept for older projects.
const INVALID_CREDENTIAL_CODES = new Set([
  'auth/invalid-credential',
  'auth/wrong-password',
  'auth/user-not-found',
])

const EMAIL_IN_USE_CODES = new Set(['auth/email-already-in-use', 'auth/email-exists'])

const TOO_MANY_ATTEMPTS_CODE = 'auth/too-many-requests'

// Auth provider/config not ready (not a network failure): Email/Password can
// be disabled, the Auth config uninitialized, or the domain not allowlisted.
const NOT_CONFIGURED_CODES = new Set([
  'auth/operation-not-allowed',
  'auth/configuration-not-found',
  'auth/invalid-api-key',
  'auth/app-not-authorized',
  'auth/unauthorized-domain',
])

export function mapAuthError(error) {
  if (!error) return AUTH_MESSAGES.network

  const code = String(error.code ?? '')
  const message = String(error.message ?? '')
  const name = String(error.name ?? '')

  if (INVALID_CREDENTIAL_CODES.has(code)) return AUTH_MESSAGES.invalidCredentials
  if (EMAIL_IN_USE_CODES.has(code)) return AUTH_MESSAGES.emailInUse
  if (code === TOO_MANY_ATTEMPTS_CODE) return AUTH_MESSAGES.tooManyAttempts
  if (
    NOT_CONFIGURED_CODES.has(code) ||
    /CONFIGURATION_NOT_FOUND|OPERATION_NOT_ALLOWED|unauthorized-domain/i.test(message)
  ) {
    return AUTH_MESSAGES.notConfigured
  }

  const isNetworkFailure =
    error instanceof TypeError ||
    /network|timeout/i.test(code) ||
    /fetch|network|load failed|timed? ?out|temporarily unavailable/i.test(message) ||
    /retryable|network/i.test(name)
  if (isNetworkFailure) return AUTH_MESSAGES.network

  // Unrecognized errors (including unexpected Firebase codes) keep the same
  // safe default as before.
  return AUTH_MESSAGES.network
}

/** Signs in; on success the auth state change redirects to /dashboard. */
export async function signInWithPassword({ email, password }) {
  try {
    await signInWithEmailAndPassword(auth, email, password)
  } catch (error) {
    throw new Error(mapAuthError(error))
  }
}

/**
 * Registers a new account. Firebase email/password accounts are signed in
 * immediately after registration (there is no required-confirmation response,
 * so this always reports confirmed; the "check your inbox" branch the
 * register page already handles stays as the graceful fallback if the
 * project ever gates sign-in on verified emails).
 */
export async function signUp({ email, password }) {
  try {
    await createUserWithEmailAndPassword(auth, email, password)
    return { emailConfirmed: true }
  } catch (error) {
    throw new Error(mapAuthError(error))
  }
}

/** Current user id for explicit `user_id` values on every write (architecture contract). */
export async function getUserId() {
  const uid = auth.currentUser?.uid
  if (!uid) {
    throw new Error('You are not signed in.')
  }
  return uid
}

/**
 * True only when the error proves the authentication session is unusable
 * (design-spec §4: during use this redirects to /login). `permission-denied`
 * means "authenticated but not authorized" (rules denial, stale document,
 * missing subject) and must NOT sign the user out — that is a normal data
 * error. The prefix (e.g. `firestore/…`) is stripped so both forms match.
 */
export function isSessionInvalidError(error) {
  if (!error) return false
  const code = String(error.code ?? '').split('/').pop()
  return code === 'unauthenticated' || code === 'id-token-expired'
}

/**
 * Removes the local session after an invalid-session response. Firebase Auth
 * clears this browser's stored session (its own persistence layer), so the
 * auth listener flips the app to unauthenticated and the protected routes
 * redirect to /login. Rejection is surfaced to the caller.
 */
export async function clearLocalSession() {
  await signOut(auth)
}
