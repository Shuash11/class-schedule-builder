import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID
const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET
const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID
const appId = import.meta.env.VITE_FIREBASE_APP_ID

/**
 * The app renders a configuration screen instead of crashing when the
 * Firebase environment variables are missing (see src/App.jsx). The six
 * values are the web app's SDK config from Firebase console → Project
 * settings → Your apps.
 */
export const isFirebaseConfigured = Boolean(
  apiKey && authDomain && projectId && storageBucket && messagingSenderId && appId,
)

// Modular SDK (no getApp()): the app owns its FirebaseApp instance.
export const firebaseApp = isFirebaseConfigured
  ? initializeApp({ apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId })
  : null

export const auth = firebaseApp ? getAuth(firebaseApp) : null
export const db = firebaseApp ? getFirestore(firebaseApp) : null
