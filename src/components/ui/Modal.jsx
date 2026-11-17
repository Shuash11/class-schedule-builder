import { useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'
import Button from './Button.jsx'

const SIZE_CLASSES = {
  md: 'max-w-md',
  lg: 'max-w-lg',
}

/**
 * The app's one overlay pattern (design-spec §5): a native <dialog> opened
 * with showModal(), which provides Esc-to-close, focus trapping and focus
 * restoration for free.
 *
 * Keep the modal MOUNTED and toggle `open` (don't conditionally unmount it):
 * closing through the native dialog is what returns focus to the trigger.
 */
export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  size = 'lg',
  pending = false,
  children,
  footer,
}) {
  const dialogRef = useRef(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => {
        // Esc ≡ Cancel (design-spec §5): route the close through the caller.
        // While a mutation is pending, closing is blocked so its failure
        // cannot end up hidden in a closed dialog (code review finding 3).
        event.preventDefault()
        if (pending) return
        onClose()
      }}
      onClose={() => {
        if (open && !pending) onClose()
      }}
      className={`no-print m-auto w-[calc(100%-2rem)] max-h-[85dvh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl transition duration-150 ease-out
        sm:w-full
        backdrop:bg-slate-900/50 backdrop:transition-opacity backdrop:duration-150
        open:scale-100 open:opacity-100
        opacity-0 scale-95
        motion-reduce:transform-none motion-reduce:transition-none
        ${SIZE_CLASSES[size] ?? SIZE_CLASSES.lg}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id={titleId} className="text-base font-semibold text-slate-900">
            {title}
          </h2>
          {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Close"
          onClick={onClose}
          disabled={pending}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      <div className="mt-4">{children}</div>

      {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
    </dialog>
  )
}
