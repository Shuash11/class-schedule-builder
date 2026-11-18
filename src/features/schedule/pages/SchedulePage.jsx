import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { BookOpen, CalendarDays, Plus, Printer } from 'lucide-react'
import Button from '../../../components/ui/Button.jsx'
import EmptyState from '../../../components/ui/EmptyState.jsx'
import LoadError from '../../../components/ui/LoadError.jsx'
import Skeleton from '../../../components/ui/Skeleton.jsx'
import { buttonClasses } from '../../../components/ui/buttonStyles.js'
import { useAuth } from '../../auth/useAuth.js'
import { getSubjectColor } from '../../subjects/colors.js'
import { useUserData } from '../../../hooks/useUserData.js'
import ScheduleList from '../components/ScheduleList.jsx'
import SessionModal from '../components/SessionModal.jsx'
import TimetableGrid from '../components/TimetableGrid.jsx'
import { groupSessionsByDay, todayDayOfWeek } from '../utils/schedule.js'

function ScheduleSkeletons() {
  return (
    <div aria-hidden="true">
      <div className="hidden grid-cols-7 gap-3 lg:grid">
        {Array.from({ length: 7 }, (_, index) => (
          <div
            key={index}
            className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-2"
          >
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
          </div>
        ))}
      </div>
      <div className="space-y-4 lg:hidden">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}

/** /schedule — weekly timetable with session CRUD and conflict detection (design-spec §7). */
export default function SchedulePage() {
  const { subjects, sessions, loading, error, reload } = useUserData()
  const { user } = useAuth() // optional sign-in — only used in the print header
  const [modalState, setModalState] = useState(null) // { mode: 'create', day } | { mode: 'edit', session }

  // Mount-time snapshots (stable per page visit) — avoids impure calls during render.
  const [today] = useState(() => todayDayOfWeek())
  const [generatedLabel] = useState(() => format(new Date(), 'PPP'))
  const groups = useMemo(() => groupSessionsByDay(sessions), [sessions])
  const legendSubjects = useMemo(
    () =>
      subjects.filter((subject) =>
        sessions.some((session) => session.subject_id === subject.id),
      ),
    [subjects, sessions],
  )

  const openCreate = (day = today) => setModalState({ mode: 'create', day })
  const openEdit = (session) => setModalState({ mode: 'edit', session })

  return (
    <div className="space-y-6">
      <header className="no-print flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Schedule</h1>
          <p className="mt-1 text-sm text-slate-600">Your recurring weekly timetable.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => window.print()}>
            <Printer className="h-4 w-4" aria-hidden="true" />
            Print
          </Button>
          <Button onClick={() => openCreate()} disabled={loading || error !== null}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add session
          </Button>
        </div>
      </header>

      {/* Print-only header block (design-spec §8) */}
      <div className="hidden print:block">
        <h1 className="text-xl font-bold text-slate-900">Weekly Class Schedule</h1>
        <p className="mt-1 text-xs text-slate-600">
          Generated {generatedLabel}
          {user?.email ? ` · ${user.email}` : ''}
        </p>
        {legendSubjects.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {legendSubjects.map((subject) => (
              <li key={subject.id} className="flex items-center gap-1.5 text-xs text-slate-700">
                <span
                  className={`print-colors h-2.5 w-2.5 rounded-full ${getSubjectColor(subject.color).dot}`}
                  aria-hidden="true"
                />
                {subject.subject_code} {subject.subject_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {loading && <ScheduleSkeletons />}

      {!loading && error && <LoadError onRetry={reload} />}

      {!loading && !error && sessions.length === 0 && (
        subjects.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Add a subject first"
            description="Sessions belong to a subject. Create one, then come back to plan your week."
            action={
              <Link to="/subjects" className={buttonClasses()}>
                Go to subjects
              </Link>
            }
          />
        ) : (
          <EmptyState
            icon={CalendarDays}
            title="Your week is clear"
            description="Add a class session to start building your timetable."
            action={<Button onClick={() => openCreate()}>Add session</Button>}
          />
        )
      )}

      {!loading && !error && sessions.length > 0 && (
        <>
          <TimetableGrid
            groups={groups}
            subjects={subjects}
            today={today}
            onAddSession={openCreate}
            onEditSession={openEdit}
          />
          <ScheduleList
            groups={groups}
            subjects={subjects}
            today={today}
            onAddSession={openCreate}
            onEditSession={openEdit}
          />
        </>
      )}

      <SessionModal
        open={modalState !== null}
        mode={modalState?.mode ?? 'create'}
        session={modalState?.session ?? null}
        defaultDay={modalState?.day ?? today}
        subjects={subjects}
        sessions={sessions}
        onClose={() => setModalState(null)}
        onSaved={reload}
      />
    </div>
  )
}
