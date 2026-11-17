import { useMemo } from 'react'
import { Plus } from 'lucide-react'
import Button from '../../../components/ui/Button.jsx'
import SessionBlock from './SessionBlock.jsx'
import { dayName, dayShortName } from '../utils/schedule.js'

/**
 * Mobile weekly list (design-spec §7.2): sections only for days that have
 * sessions, then a muted line naming the free days. Hidden at ≥`lg`.
 */
export default function ScheduleList({ groups, subjects, today, onAddSession, onEditSession }) {
  const subjectById = useMemo(
    () => new Map(subjects.map((subject) => [subject.id, subject])),
    [subjects],
  )

  const filledGroups = groups.filter((group) => group.sessions.length > 0)
  const freeDayNames = groups
    .filter((group) => group.sessions.length === 0)
    .map((group) => dayShortName(group.day))

  return (
    <div className="space-y-4 lg:hidden">
      {filledGroups.map(({ day, sessions }) => {
        const isToday = day === today

        return (
          <section key={day} aria-label={dayName(day)}>
            <div className="flex items-center justify-between gap-2 py-2">
              <div className="flex min-w-0 items-baseline gap-2">
                <h2
                  className={`text-sm font-semibold ${
                    isToday ? 'text-indigo-700' : 'text-slate-900'
                  }`}
                >
                  {dayName(day)}
                  {isToday && <span className="sr-only"> (today)</span>}
                </h2>
                <span className="text-xs tabular-nums text-slate-500">
                  {sessions.length} {sessions.length === 1 ? 'class' : 'classes'}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Add class on ${dayName(day)}`}
                className="no-print"
                onClick={() => onAddSession(day)}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
            <div className="space-y-2">
              {sessions.map((session) => (
                <SessionBlock
                  key={session.id}
                  session={session}
                  subject={subjectById.get(session.subject_id)}
                  onEdit={() => onEditSession(session)}
                />
              ))}
            </div>
          </section>
        )
      })}

      {filledGroups.length > 0 && freeDayNames.length > 0 && (
        <p className="text-sm text-slate-500">No classes on {freeDayNames.join(', ')}.</p>
      )}
    </div>
  )
}
