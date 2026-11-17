/**
 * Centered dashed empty state with optional CTA (design-spec §5).
 * `action` is a ready-to-render button or link.
 */
export default function EmptyState({ icon: Icon, title, description, action, className = '' }) {
  return (
    <div className={`rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center ${className}`}>
      {Icon && <Icon className="mx-auto h-10 w-10 text-slate-400" aria-hidden="true" />}
      <p className="mt-3 text-sm font-semibold text-slate-900">{title}</p>
      {description && <p className="mx-auto mt-1 max-w-sm text-sm text-slate-600">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
