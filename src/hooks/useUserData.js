import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchSessions } from '../features/schedule/services/sessions.js'
import { fetchSubjects } from '../features/subjects/services/subjects.js'

/**
 * Demo mode (no sign-in): loads subjects and sessions together — the dataset
 * shared by the Dashboard, Subjects and Schedule pages. Firestore demo rules
 * permit access to the shared data; the local demo id is only a label in the
 * documents. Concurrent loads are guarded by a request sequence so a slow
 * stale response can never overwrite fresher data.
 */
export function useUserData() {
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
        setError(loadError)
      })
      .finally(() => {
        if (sequence === loadSequenceRef.current) setLoading(false)
      })
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // Event-handler variant (Retry): shows the loading state again.
  const reload = useCallback(() => {
    setLoading(true)
    setError(null)
    return load()
  }, [load])

  return { subjects, sessions, loading, error, reload }
}
