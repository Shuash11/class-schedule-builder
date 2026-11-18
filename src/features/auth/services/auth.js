import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../../../lib/firebaseClient.js'
import { createSalt, hashPassword } from '../../../lib/passwordHash.js'
import {
  clearSessionToken,
  getSessionToken,
  setSessionToken,
} from '../../../lib/sessionToken.js'

/**
 * Firestore-backed demo login — NO Firebase Authentication. Users (email +
 * salted hash) and session records live in Firestore, visible in the console.
 * The browser keeps only a random session token. Demo-grade only (open rules).
 */
const USERS_COLLECTION = 'users'
const SESSIONS_COLLECTION = 'sessions'
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export const AUTH_MESSAGES = {
  invalidCredentials: 'Incorrect email or password. Try again.',
  emailInUse: 'An account with this email already exists. Try signing in.',
  network: "Couldn't sign in. Check your connection and try again.",
}

const listeners = new Set()

function notify(user) {
  listeners.forEach((listener) => listener(user))
}

export function subscribeAuth(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function normalizeEmail(email) {
  return String(email ?? '').trim().toLowerCase()
}

function randomToken() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  // CSPRNG fallback for runtimes without randomUUID (never Math.random).
  const bytes = new Uint8Array(32)
  globalThis.crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

/** Deterministic doc id (the normalized email) gives stable uniqueness. */
function userRef(email) {
  return doc(db, USERS_COLLECTION, email)
}

async function createSession(userId) {
  // Revoke earlier sessions for this user so logins don't accumulate tokens.
  const previous = await getDocs(
    query(collection(db, SESSIONS_COLLECTION), where('user_id', '==', userId)),
  )
  if (!previous.empty) {
    const batch = writeBatch(db)
    previous.docs.forEach((snapshot) => batch.delete(snapshot.ref))
    await batch.commit()
  }
  const token = randomToken()
  await setDoc(doc(db, SESSIONS_COLLECTION, token), {
    user_id: userId,
    created_at: serverTimestamp(),
    expires_at: Date.now() + SESSION_TTL_MS,
  })
  setSessionToken(token)
}

/** Resolves the session from Firestore on app mount (with expiry check). */
export async function resolveSession() {
  const token = getSessionToken()
  if (!token) return null
  try {
    const session = await getDoc(doc(db, SESSIONS_COLLECTION, token))
    if (!session.exists()) {
      clearSessionToken()
      return null
    }
    const expiresAt = session.data().expires_at
    if (typeof expiresAt === 'number' && Date.now() >= expiresAt) {
      await deleteDoc(session.ref)
      clearSessionToken()
      return null
    }
    const user = await getDoc(userRef(session.data().user_id))
    if (!user.exists()) {
      clearSessionToken()
      return null
    }
    return { email: user.data().email }
  } catch {
    // Offline/backend failure: signed out; schedule data still works via open rules.
    return null
  }
}

/** Registers in Firestore and opens a session. */
export async function signUp({ email, password }) {
  const normalized = normalizeEmail(email)
  try {
    const ref = userRef(normalized)
    if ((await getDoc(ref)).exists()) throw new Error(AUTH_MESSAGES.emailInUse)
    const salt = createSalt()
    await setDoc(ref, {
      email: normalized,
      salt,
      password_hash: await hashPassword(password, salt),
      created_at: serverTimestamp(),
    })
    try {
      await createSession(normalized)
    } catch (sessionError) {
      await deleteDoc(ref) // roll back a half-created account
      throw sessionError
    }
    notify({ email: normalized })
  } catch (error) {
    if (error.message === AUTH_MESSAGES.emailInUse) throw error
    throw new Error(AUTH_MESSAGES.network)
  }
}

/** Verifies the salted hash in Firestore and opens a session. */
export async function signInWithPassword({ email, password }) {
  const normalized = normalizeEmail(email)
  try {
    const user = await getDoc(userRef(normalized))
    if (!user.exists()) throw new Error(AUTH_MESSAGES.invalidCredentials)
    const data = user.data()
    if ((await hashPassword(password, data.salt)) !== data.password_hash) {
      throw new Error(AUTH_MESSAGES.invalidCredentials)
    }
    await createSession(normalized)
    notify({ email: normalized })
  } catch (error) {
    if (error.message === AUTH_MESSAGES.invalidCredentials) throw error
    throw new Error(AUTH_MESSAGES.network)
  }
}

/** Deletes the Firestore session and clears the local token. */
export async function signOut() {
  const token = getSessionToken()
  clearSessionToken()
  notify(null)
  if (!token) return
  try {
    await deleteDoc(doc(db, SESSIONS_COLLECTION, token))
  } catch {
    // Local sign-out already succeeded; an orphan record will expire.
  }
}

/** Data labels use a separate local id; this is only the auth-facing id. */
export function getUserId() {
  return 'demo-local'
}
