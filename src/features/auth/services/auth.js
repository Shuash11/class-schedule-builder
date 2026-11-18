import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore'
import { db } from '../../../lib/firebaseClient.js'
import { createSalt, hashPassword } from '../../../lib/passwordHash.js'
import {
  clearSessionToken,
  getSessionToken,
  setSessionToken,
} from '../../../lib/sessionToken.js'

/**
 * Firestore-backed demo login — NO Firebase Authentication and NO local
 * account. Users (email + salted hash) and session records live in Firestore,
 * so both are visible in the Firebase console. The browser keeps only a
 * random session token. Demo-grade only: see README security warning.
 */
const USERS_COLLECTION = 'users'
const SESSIONS_COLLECTION = 'sessions'

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

async function findUserByEmail(email) {
  const snapshot = await getDocs(
    query(collection(db, USERS_COLLECTION), where('email', '==', email), limit(1)),
  )
  return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
}

async function createSession(userId) {
  const token = globalThis.crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
  await setDoc(doc(db, SESSIONS_COLLECTION, token), {
    user_id: userId,
    created_at: serverTimestamp(),
  })
  setSessionToken(token)
}

/** Resolves the current user from the Firestore session record (called on mount). */
export async function resolveSession() {
  const token = getSessionToken()
  if (!token) return null
  try {
    const session = await getDoc(doc(db, SESSIONS_COLLECTION, token))
    if (!session.exists()) {
      clearSessionToken()
      return null
    }
    const user = await getDoc(doc(db, USERS_COLLECTION, session.data().user_id))
    if (!user.exists()) {
      clearSessionToken()
      return null
    }
    return { email: user.data().email }
  } catch {
    // Offline / backend failure: treat as signed out. Schedule data still
    // works because the Firestore demo rules are open.
    return null
  }
}

/** Registers in Firestore and opens a Firestore-backed session. */
export async function signUp({ email, password }) {
  const normalized = normalizeEmail(email)
  try {
    if (await findUserByEmail(normalized)) {
      throw new Error(AUTH_MESSAGES.emailInUse)
    }
    const salt = createSalt()
    const passwordHash = await hashPassword(password, salt)
    const userRef = await addDoc(collection(db, USERS_COLLECTION), {
      email: normalized,
      salt,
      password_hash: passwordHash,
      created_at: serverTimestamp(),
    })
    await createSession(userRef.id)
    notify({ email: normalized })
    return { emailConfirmed: true }
  } catch (error) {
    if (error.message === AUTH_MESSAGES.emailInUse) throw error
    throw new Error(AUTH_MESSAGES.network)
  }
}

/** Verifies the salted hash in Firestore and opens a session. */
export async function signInWithPassword({ email, password }) {
  const normalized = normalizeEmail(email)
  try {
    const user = await findUserByEmail(normalized)
    if (!user) throw new Error(AUTH_MESSAGES.invalidCredentials)
    const candidateHash = await hashPassword(password, user.salt)
    if (candidateHash !== user.password_hash) {
      throw new Error(AUTH_MESSAGES.invalidCredentials)
    }
    await createSession(user.id)
    notify({ email: normalized })
  } catch (error) {
    if (error.message === AUTH_MESSAGES.invalidCredentials) throw error
    throw new Error(AUTH_MESSAGES.network)
  }
}

/** Deletes the Firestore session record and clears the local token. */
export async function signOut() {
  const token = getSessionToken()
  clearSessionToken()
  notify(null)
  if (!token) return
  try {
    await deleteDoc(doc(db, SESSIONS_COLLECTION, token))
  } catch {
    // Local sign-out already succeeded; the orphan session record is harmless.
  }
}

/** Data labels use a separate local id; this is only the auth-facing id. */
export function getUserId() {
  return 'demo-local'
}
