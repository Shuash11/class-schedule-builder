import { doc, getDoc } from 'firebase/firestore'
import { db } from './firebaseClient.js'

/**
 * Reads a document and verifies it belongs to the signed-in user, mirroring
 * the old query-level `.eq('user_id', ...)` guard (defense in depth — the
 * Firestore security rules are the primary guard, this keeps the service
 * contract identical if rules ever drift).
 *
 * A missing or non-owned document fails with a neutral error code — it is a
 * stale-data condition (e.g. deleted in another tab), so the UI shows its
 * normal error instead of hiding it.
 */
export async function getOwnedDoc(collectionName, id, userId) {
  const snapshot = await getDoc(doc(db, collectionName, id))
  if (!snapshot.exists() || snapshot.data().user_id !== userId) {
    throw Object.assign(new Error('Document not found for the current user.'), {
      code: 'not-found',
    })
  }
  return snapshot
}

/**
 * Firestore write promises resolve only after the backend acknowledges them;
 * while offline a write can stay pending forever and leave a modal locked in
 * its loading state. Fail fast with a network error (the UI already maps it
 * to the approved message) instead of hanging.
 */
export function assertOnline() {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw Object.assign(new Error('Network unavailable'), { code: 'network-unavailable' })
  }
}
