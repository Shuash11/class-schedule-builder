import { useMemo } from 'react'
import { Plus } from 'lucide-react'
import Button from '../../../components/ui/Button.jsx'
import SessionBlock from './SessionBlock.jsx'
import { dayName } from '../utils/schedule.js'

/**
 * Desktop 7-column weekly grid, Monday-first (design-spec §7.1).
 * Hidden below `lg` and in print from narrow windows — ScheduleList takes over.
 */
export default function TimetableGrid({ groups, subjects, today, onAddSession, onEditSession }) {
  const subjectById = useMemo(
    () => new Map(subjects.map((subject) => [subject.id, subject])),
    [subjects],
  )

  return (
    <div className="print-colors hidden grid-cols-7 gap-3 lg:grid">
      {groups.map(({ day, sessions }) => {
        const isToday = day === today

        return (
          <section
            key={day}
            aria-label={dayName(day)}
            className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-2 print:border-slate-300"
          >
            <div
              className={`flex items-center justify-between gap-1 px-1 pb-1 ${
                isToday ? 'border-b-2 border-indigo-500' : ''
              }`}
            >
              <div className="flex min-w-0 items-baseline gap-1.5">
                <h2
                  className={`text-sm font-semibold ${isToday ? 'text-indigo-700' : 'text-slate-700'}`}
                >
                  {dayName(day)}
                </h2>
                <span className="text-xs tabular-nums text-slate-500">{sessions.length}</span>
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

            {sessions.length === 0 ? (
              <button
                type="button"
                onClick={() => onAddSession(day)}
                aria-label={`Add class on ${dayName(day)}`}
                className="no-print flex-1 rounded-lg border-2 border-dashed border-slate-300 p-3 text-center text-xs text-slate-500 transition-colors duration-150 hover:border-indigo-400 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                + Add class
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                {sessions.map((session) => (
                  <SessionBlock
                    key={session.id}
                    session={session}
                    subject={subjectById.get(session.subject_id)}
                    onEdit={() => onEditSession(session)}
                  />
                ))}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
