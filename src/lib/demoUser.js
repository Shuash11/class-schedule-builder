/**
 * Demo mode: this non-production app has OPTIONAL Firestore-backed login. A
 * stable random ID is generated once in this browser and stored locally so
 * schedule documents keep the same `user_id` shape as the original design;
 * it is a data label, independent of the Firestore login account.
 *
 * This ID is only a local label — NOT an authentication identity. Firestore
 * demo rules are intentionally open, so anyone with the public config can
 * read or write the shared demo data.
 */
const STORAGE_KEY = 'class-schedule-builder-demo-user-id'
let inMemoryId = null

function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `demo-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function getDemoUserId() {
  if (inMemoryId) return inMemoryId
  try {
    if (typeof localStorage !== 'undefined') {
      let id = localStorage.getItem(STORAGE_KEY)
      if (!id) {
        id = createId()
        localStorage.setItem(STORAGE_KEY, id)
      }
      inMemoryId = id
      return id
    }
  } catch {
    // Storage can be blocked (private mode / security policy) — fall through
    // to an in-memory id so demo mode still functions.
  }
  inMemoryId = inMemoryId ?? createId()
  return inMemoryId
}
