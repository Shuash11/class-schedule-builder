import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CircleCheck } from 'lucide-react'
import { ToastContext } from './toastContext.js'

const AUTO_DISMISS_MS = 3500
const EXIT_MS = 150

/**
 * Success toast (design-spec §5): fixed bottom-right (above the mobile tab
 * bar), role="status", auto-dismisses after 3.5 s, slide-up + fade 150 ms.
 */
export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null) // { id, message, closing }
  const [enteredId, setEnteredId] = useState(null)
  const timersRef = useRef([])

  const clearTimers = useCallback(() => {
    for (const timerId of timersRef.current) clearTimeout(timerId)
    timersRef.current = []
  }, [])

  useEffect(() => clearTimers, [clearTimers])

  const schedule = useCallback((callback, delay) => {
    timersRef.current.push(setTimeout(callback, delay))
  }, [])

  const showToast = useCallback(
    (message) => {
      clearTimers()
      const id = `${Date.now()}-${Math.random()}`
      setToast({ id, message, closing: false })
      // Next frame: transition from translate-y-2/opacity-0 to resting state.
      schedule(() => setEnteredId(id), 20)
      schedule(() => {
        setToast((current) => (current && current.id === id ? { ...current, closing: true } : current))
      }, AUTO_DISMISS_MS)
      schedule(() => {
        setToast((current) => (current && current.id === id ? null : current))
      }, AUTO_DISMISS_MS + EXIT_MS)
    },
    [clearTimers, schedule],
  )

  const value = useMemo(() => ({ showToast }), [showToast])

  const visible = enteredId !== null && toast && !toast.closing
  const stateClasses =
    toast === null || toast.closing || !visible
      ? 'translate-y-2 opacity-0'
      : 'translate-y-0 opacity-100'

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && (
        <div
          key={toast.id}
          role="status"
          className={`no-print fixed bottom-20 right-4 z-50 flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm text-white shadow-lg transition duration-150 ease-out md:bottom-6 md:right-6 motion-reduce:transform-none motion-reduce:transition-none ${stateClasses}`}
        >
          <CircleCheck className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
          <span>{toast.message}</span>
        </div>
      )}
    </ToastContext.Provider>
  )
}
