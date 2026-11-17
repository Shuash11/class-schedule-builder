/** Small pill label (design-spec §5). */
export default function Badge({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 ${className}`}>
      {children}
    </span>
  )
}
