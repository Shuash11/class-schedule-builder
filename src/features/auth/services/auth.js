import { supabase } from '../../../lib/supabaseClient.js'

/**
 * Auth error mapping (design-spec §6.1 / §11). The three approved messages
 * are shared by /login and /register; anything unrecognized (including
 * network/fetch failures) falls back to the network message.
 */
export const AUTH_MESSAGES = {
  invalidCredentials: 'Incorrect email or password. Try again.',
  emailInUse: 'An account with this email already exists. Try signing in.',
  network: "Couldn't sign in. Check your connection and try again.",
}

export function mapAuthError(error) {
  if (!error) return AUTH_MESSAGES.network

  const message = String(error.message ?? '')
  const name = String(error.name ?? '')
  const isNetworkFailure =
    error instanceof TypeError ||
    /fetch|network|load failed|timed? ?out|temporarily unavailable/i.test(message) ||
    /retryable|network/i.test(name)

  if (isNetworkFailure) return AUTH_MESSAGES.network
  if (error.code === 'invalid_credentials' || error.status === 400) {
    return AUTH_MESSAGES.invalidCredentials
  }
  if (error.code === 'user_already_exists' || error.code === 'email_exists') {
    return AUTH_MESSAGES.emailInUse
  }
  return AUTH_MESSAGES.network
}

/** Signs in; on success the session state change redirects to /dashboard. */
export async function signInWithPassword({ email, password }) {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    throw new Error(mapAuthError(error))
  }
}

/**
 * Registers a new account. When email confirmation is disabled (default),
 * Supabase signs the user in immediately. Returns whether a session is
 * active so the page can show a "check your inbox" alert otherwise.
 */
export async function signUp({ email, password }) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) {
    throw new Error(mapAuthError(error))
  }
  return { emailConfirmed: Boolean(data.session) }
}

/** Current user id for explicit `user_id` values on INSERT (architecture contract). */
export async function getUserId() {
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    throw new Error('You are not signed in.')
  }
  return data.user.id
}

/**
 * True when a Data API error means the browser session is no longer valid
 * (design-spec §4: a 401 during use redirects to /login). PostgREST signals
 * expired/invalid JWTs with code PGRST301 (or HTTP 401); the message always
 * mentions the JWT.
 */
export function isSessionInvalidError(error) {
  if (!error) return false
  if (error.status === 401) return true
  const code = String(error.code ?? '')
  if (code === 'PGRST301' || code === '401') return true
  return /jwt/i.test(String(error.message ?? ''))
}

/**
 * Removes the local session after an invalid-token response. `local` scope
 * clears this browser's session even if the network revocation call fails,
 * so the auth listener flips the app to unauthenticated and the protected
 * routes redirect to /login.
 */
export async function clearLocalSession() {
  const { error } = await supabase.auth.signOut({ scope: 'local' })
  if (error) throw error
}
