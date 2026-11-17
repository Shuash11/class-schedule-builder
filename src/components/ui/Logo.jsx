import { CalendarDays } from 'lucide-react'

const SIZES = {
  md: { tile: 'h-8 w-8 rounded-lg', icon: 'h-4.5 w-4.5' },
  lg: { tile: 'h-12 w-12 rounded-xl', icon: 'h-6 w-6' },
}

/** App logo lockup tile (design-spec §4 / §6.1). */
export default function Logo({ size = 'md' }) {
  const classes = SIZES[size] ?? SIZES.md

  return (
    <div className={`grid shrink-0 place-items-center bg-indigo-600 ${classes.tile}`}>
      <CalendarDays className={`text-white ${classes.icon}`} aria-hidden="true" />
    </div>
  )
}
