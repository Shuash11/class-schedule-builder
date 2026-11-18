/**
 * Demo password hashing using the browser's Web Crypto API (SHA-256).
 * Each user gets a random salt; Firestore stores `salt` + `password_hash`,
 * never the plain password. This is a demo-grade measure — not a substitute
 * for a real password KDF (Argon2/bcrypt/scrypt) in production.
 */

function bytesToHex(bytes) {
  return Array.from(new Uint8Array(bytes))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export function createSalt() {
  const bytes = new Uint8Array(16)
  globalThis.crypto.getRandomValues(bytes)
  return bytesToHex(bytes)
}

export async function hashPassword(password, salt) {
  const data = new TextEncoder().encode(`${salt}:${password}`)
  const digest = await globalThis.crypto.subtle.digest('SHA-256', data)
  return bytesToHex(digest)
}
