/**
 * Demo mode: this is a non-production app with NO sign-in. A stable random ID
 * is generated once in this browser and stored locally so the persisted
 * documents keep the same `user_id` shape as the original multi-user design.
 *
 * This ID is only a local label — it is NOT an authentication identity. The
 * Firestore security rules in demo mode are intentionally open, so anyone
 * with the app's public config can read or write the shared demo data.
 */
const STORAGE_KEY = 'class-schedule-builder-demo-user-id'

function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `demo-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function getDemoUserId() {
  if (typeof localStorage === 'undefined') return 'demo-local'
  let id = localStorage.getItem(STORAGE_KEY)
  if (!id) {
    id = createId()
    localStorage.setItem(STORAGE_KEY, id)
  }
  return id
}
