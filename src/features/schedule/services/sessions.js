import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../../../lib/firebaseClient.js'
import { assertOnline, getOwnedDoc } from '../../../lib/firestoreOwnership.js'
import { getUserId } from '../../auth/services/auth.js'

const SESSIONS_COLLECTION = 'class_sessions'

/** Maps a Firestore class-session document to the shape the UI consumes. */
function toSession(id, data) {
  return {
    id,
    subject_id: data.subject_id,
    user_id: data.user_id,
    day_of_week: data.day_of_week,
    start_time: data.start_time,
    end_time: data.end_time,
    // serverTimestamp() reads back as a Firestore Timestamp; while pending
    // (or absent) it stays null.
    created_at: data.created_at?.toDate ? data.created_at.toDate().toISOString() : null,
  }
}

export async function fetchSessions() {
  const userId = await getUserId()
  const snapshot = await getDocs(
    query(
      collection(db, SESSIONS_COLLECTION),
      where('user_id', '==', userId),
      orderBy('day_of_week', 'asc'),
      orderBy('start_time', 'asc'),
    ),
  )
  return snapshot.docs.map((docSnap) => toSession(docSnap.id, docSnap.data()))
}

export async function createSession(values) {
  assertOnline()
  const userId = await getUserId()

  // Security rules verify the referenced subject belongs to this user;
  // user_id is still set explicitly from the current session on every write
  // (architecture contract). subject_id is the subject document id (string).
  const payload = {
    user_id: userId,
    subject_id: values.subject_id,
    day_of_week: values.day_of_week,
    start_time: values.start_time,
    end_time: values.end_time,
  }
  const docRef = await addDoc(collection(db, SESSIONS_COLLECTION), {
    ...payload,
    created_at: serverTimestamp(),
  })

  // created_at is pending until the caller's refetch resolves it.
  return { id: docRef.id, ...payload, created_at: null }
}

export async function updateSession(id, values) {
  assertOnline()
  const userId = await getUserId()
  const snapshot = await getOwnedDoc(SESSIONS_COLLECTION, id, userId)

  const data = snapshot.data()

  // Never changes user_id.
  await updateDoc(doc(db, SESSIONS_COLLECTION, id), {
    subject_id: values.subject_id,
    day_of_week: values.day_of_week,
    start_time: values.start_time,
    end_time: values.end_time,
  })

  return toSession(id, {
    ...data,
    subject_id: values.subject_id,
    day_of_week: values.day_of_week,
    start_time: values.start_time,
    end_time: values.end_time,
  })
}

export async function deleteSession(id) {
  assertOnline()
  const userId = await getUserId()
  const snapshot = await getOwnedDoc(SESSIONS_COLLECTION, id, userId)
  await deleteDoc(snapshot.ref)
}
