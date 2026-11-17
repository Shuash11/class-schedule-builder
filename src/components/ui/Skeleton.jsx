/** Loading placeholder (design-spec §5) — never contains text. */
export default function Skeleton({ className = '', ...props }) {
  return (
    <div aria-hidden="true" className={`animate-pulse rounded-md bg-slate-200 ${className}`} {...props} />
  )
}
