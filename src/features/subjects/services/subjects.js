import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../../../lib/firebaseClient.js'
import { assertOnline, getOwnedDoc } from '../../../lib/firestoreOwnership.js'
import { getDemoUserId } from '../../../lib/demoUser.js'

const SUBJECTS_COLLECTION = 'subjects'
const SESSIONS_COLLECTION = 'class_sessions'

/** Maps a Firestore subject document to the shape the UI consumes. */
function toSubject(id, data) {
  return {
    id,
    user_id: data.user_id,
    subject_code: data.subject_code,
    subject_name: data.subject_name,
    instructor: data.instructor ?? null,
    room: data.room ?? null,
    color: data.color,
    // serverTimestamp() reads back as a Firestore Timestamp; while pending
    // (or absent) it stays null.
    created_at: data.created_at?.toDate ? data.created_at.toDate().toISOString() : null,
  }
}

export async function fetchSubjects() {
  const userId = await getDemoUserId()
  const snapshot = await getDocs(
    query(
      collection(db, SUBJECTS_COLLECTION),
      where('user_id', '==', userId),
      orderBy('created_at', 'asc'),
    ),
  )
  return snapshot.docs.map((docSnap) => toSubject(docSnap.id, docSnap.data()))
}

export async function createSubject(values) {
  assertOnline()
  const userId = await getDemoUserId()

  // Firestore has no unique constraint on (user_id, subject_code): pre-write
  // duplicate check. isUniqueViolation keeps SubjectModal's field error
  // working unchanged (23505 = the old Postgres unique-violation code).
  const duplicates = await getDocs(
    query(
      collection(db, SUBJECTS_COLLECTION),
      where('user_id', '==', userId),
      where('subject_code', '==', values.subject_code),
      limit(1),
    ),
  )
  if (!duplicates.empty) {
    throw Object.assign(new Error('duplicate subject code'), { code: '23505' })
  }

  // Security rules enforce ownership server-side; user_id is still set
  // explicitly from the current session on every write (architecture contract).
  const payload = {
    user_id: userId,
    subject_code: values.subject_code,
    subject_name: values.subject_name,
    instructor: values.instructor || null,
    room: values.room || null,
    color: values.color,
  }
  const docRef = await addDoc(collection(db, SUBJECTS_COLLECTION), {
    ...payload,
    created_at: serverTimestamp(),
  })

  // created_at is pending until the caller's refetch resolves it.
  return { id: docRef.id, ...payload, created_at: null }
}

export async function updateSubject(id, values) {
  assertOnline()
  const userId = await getDemoUserId()
  const snapshot = await getOwnedDoc(SUBJECTS_COLLECTION, id, userId)

  // The old unique (user_id, subject_code) constraint covered EDITS too â€”
  // reject a code already used by a DIFFERENT subject (review finding M1).
  const duplicates = await getDocs(
    query(
      collection(db, SUBJECTS_COLLECTION),
      where('user_id', '==', userId),
      where('subject_code', '==', values.subject_code),
      limit(1),
    ),
  )
  if (duplicates.docs.some((docSnap) => docSnap.id !== id)) {
    throw Object.assign(new Error('duplicate subject code'), { code: '23505' })
  }

  const data = snapshot.data()

  // Never changes user_id.
  await updateDoc(doc(db, SUBJECTS_COLLECTION, id), {
    subject_code: values.subject_code,
    subject_name: values.subject_name,
    instructor: values.instructor || null,
    room: values.room || null,
    color: values.color,
  })

  return toSubject(id, {
    ...data,
    subject_code: values.subject_code,
    subject_name: values.subject_name,
    instructor: values.instructor || null,
    room: values.room || null,
    color: values.color,
  })
}

export async function deleteSubject(id) {
  assertOnline()
  const userId = await getDemoUserId()
  const snapshot = await getOwnedDoc(SUBJECTS_COLLECTION, id, userId)

  // No server-side cascade in Firestore: delete the subject AND all of its
  // sessions in ONE atomic batch, so a partial failure cannot leave a subject
  // without its sessions (review finding M3). A subject with >500 sessions
  // would exceed a Firestore batch; that is not reachable through the UI in
  // practice and is documented as a limitation.
  const sessions = await getDocs(
    query(
      collection(db, SESSIONS_COLLECTION),
      where('user_id', '==', userId),
      where('subject_id', '==', id),
    ),
  )
  const batch = writeBatch(db)
  sessions.docs.forEach((docSnap) => batch.delete(docSnap.ref))
  batch.delete(snapshot.ref)
  await batch.commit()
}

/** Duplicate subject code for this user (kept for SubjectModal). */
export function isUniqueViolation(error) {
  return error?.code === '23505'
}
