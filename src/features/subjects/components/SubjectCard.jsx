import { CalendarDays, MapPin, Pencil, Trash2, User } from 'lucide-react'
import Badge from '../../../components/ui/Badge.jsx'
import Button from '../../../components/ui/Button.jsx'
import { getSubjectColor } from '../colors.js'

function sessionCountLabel(count) {
  return count === 1 ? '1 session' : `${count} sessions`
}

/** Subject summary card (design-spec §6.3). */
export default function SubjectCard({ subject, sessionCount, onEdit, onDelete }) {
  const color = getSubjectColor(subject.color)

  return (
    <div className="flex h-full flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
      <div className="flex items-center gap-2">
        <span
          className={`print-colors h-3 w-3 shrink-0 rounded-full ${color.dot}`}
          aria-hidden="true"
        />
        <h2 className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900">
          {subject.subject_code}
        </h2>
        <Button variant="ghost" size="icon" aria-label={`Edit ${subject.subject_code}`} onClick={onEdit}>
          <Pencil className="h-4 w-4" aria-hidden="true" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="hover:text-red-600"
          aria-label={`Delete ${subject.subject_code}`}
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      <p className="text-sm text-slate-700 line-clamp-2">{subject.subject_name}</p>

      {(subject.instructor || subject.room) && (
        <div className="space-y-1">
          {subject.instructor && (
            <p className="flex items-center gap-1.5 text-xs text-slate-600">
              <User className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden="true" />
              <span className="truncate">{subject.instructor}</span>
            </p>
          )}
          {subject.room && (
            <p className="flex items-center gap-1.5 text-xs text-slate-600">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden="true" />
              <span className="truncate">{subject.room}</span>
            </p>
          )}
        </div>
      )}

      <div className="mt-auto pt-1">
        <Badge>
          <CalendarDays className="h-3 w-3" aria-hidden="true" />
          <span className="tabular-nums">{sessionCountLabel(sessionCount)}</span>
        </Badge>
      </div>
    </div>
  )
}
