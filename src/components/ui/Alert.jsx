import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react'

const VARIANTS = {
  error: { classes: 'border-red-200 bg-red-100 text-red-700', Icon: CircleAlert },
  warning: { classes: 'border-amber-200 bg-amber-50 text-amber-800', Icon: TriangleAlert },
  success: { classes: 'border-emerald-200 bg-emerald-50 text-emerald-800', Icon: CircleCheck },
  info: { classes: 'border-indigo-200 bg-indigo-50 text-indigo-700', Icon: Info },
}

/**
 * Inline alert (design-spec §5). Callers pass `role="alert"` for errors that
 * block an action.
 */
export default function Alert({ variant = 'info', title, children, className = '', ...props }) {
  const { classes, Icon } = VARIANTS[variant] ?? VARIANTS.info

  return (
    <div className={`flex gap-3 rounded-lg border p-3 text-sm ${classes} ${className}`} {...props}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        {children}
      </div>
    </div>
  )
}
