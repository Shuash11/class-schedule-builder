/**
 * The only persisted LOGIN credential in the browser is this random token —
 * the account, password hash and session record live in Firestore (visible in
 * the Firebase console). Storage failures degrade to an in-memory token.
 */
const STORAGE_KEY = 'class-schedule-builder-session-token'
let inMemoryToken = null

export function getSessionToken() {
  if (inMemoryToken) return inMemoryToken
  try {
    if (typeof localStorage !== 'undefined') {
      inMemoryToken = localStorage.getItem(STORAGE_KEY)
    }
  } catch {
    // Storage blocked — in-memory token only.
  }
  return inMemoryToken
}

export function setSessionToken(token) {
  inMemoryToken = token
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, token)
    }
  } catch {
    // Storage blocked — keep the in-memory token.
  }
}

export function clearSessionToken() {
  inMemoryToken = null
  try {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nothing to clear.
  }
}
