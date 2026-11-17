import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchSessions } from '../features/schedule/services/sessions.js'
import { fetchSubjects } from '../features/subjects/services/subjects.js'
import { useAuth } from '../features/auth/useAuth.js'
import { clearLocalSession, isSessionInvalidError } from '../features/auth/services/auth.js'

/**
 * Loads the signed-in user's subjects and sessions together — the dataset
 * shared by the Dashboard, Subjects and Schedule pages. RLS scopes every
 * query server-side; the client only ever reads its own rows.
 *
 * Concurrent loads are guarded by a request sequence: only the newest
 * request may commit state, so a slow stale response can never overwrite
 * fresher data (code review finding 2).
 */
export function useUserData() {
  const { status } = useAuth()
  const [subjects, setSubjects] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const loadSequenceRef = useRef(0)

  const load = useCallback(() => {
    const sequence = ++loadSequenceRef.current
    return Promise.all([fetchSubjects(), fetchSessions()])
      .then(([nextSubjects, nextSessions]) => {
        if (sequence !== loadSequenceRef.current) return // superseded by a newer request
        setSubjects(nextSubjects)
        setSessions(nextSessions)
        setError(null)
      })
      .catch((loadError) => {
        if (sequence !== loadSequenceRef.current) return
        if (isSessionInvalidError(loadError)) {
          // Invalid/expired token (design-spec §4): drop the local session so
          // the auth listener flips to unauthenticated and routes redirect.
          clearLocalSession().catch(() => {})
          return
        }
        setError(loadError)
      })
      .finally(() => {
        if (sequence === loadSequenceRef.current) setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (status === 'authenticated') {
      load()
    }
  }, [status, load])

  // Event-handler variant (Retry): shows the loading state again.
  const reload = useCallback(() => {
    setLoading(true)
    setError(null)
    return load()
  }, [load])

  return { subjects, sessions, loading, error, reload }
}
