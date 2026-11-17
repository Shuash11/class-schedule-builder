import { MapPin, User } from 'lucide-react'
import { getSubjectColor } from '../../subjects/colors.js'
import { dayName, formatTime12 } from '../utils/schedule.js'

/**
 * One class block on the timetable (design-spec §7.1). A real button that
 * opens the SessionModal in edit mode; the accessible name spells out the
 * full class details.
 */
export default function SessionBlock({ session, subject, onEdit }) {
  const color = getSubjectColor(subject?.color)
  const code = subject?.subject_code ?? 'Unknown'
  const name = subject?.subject_name ?? ''
  const room = subject?.room ?? ''
  const instructor = subject?.instructor ?? ''

  const accessibleName = [
    `${code}${name ? ` ${name}` : ''}`,
    `${dayName(session.day_of_week)} ${formatTime12(session.start_time)} to ${formatTime12(session.end_time)}`,
    room,
    instructor,
    'edit',
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <button
      type="button"
      onClick={onEdit}
      aria-label={accessibleName}
      className={`print-colors block w-full rounded-lg border-l-4 p-2.5 text-left transition-colors duration-150 print:break-inside-avoid hover:brightness-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 motion-reduce:transition-none ${color.block}`}
    >
      <span className="flex items-baseline justify-between gap-2">
        <span className="truncate text-sm font-semibold">{code}</span>
        <span className="whitespace-nowrap text-xs font-medium tabular-nums">
          {formatTime12(session.start_time)}–{formatTime12(session.end_time)}
        </span>
      </span>
      {name && <span className="mt-0.5 block truncate text-xs">{name}</span>}
      {(room || instructor) && (
        <span className="mt-1 flex items-center gap-2 text-xs">
          {room && (
            <span className="flex min-w-0 items-center gap-1">
              <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span className="truncate">{room}</span>
            </span>
          )}
          {room && instructor && <span aria-hidden="true">·</span>}
          {instructor && (
            <span className="flex min-w-0 items-center gap-1">
              <User className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span className="truncate">{instructor}</span>
            </span>
          )}
        </span>
      )}
    </button>
  )
}
