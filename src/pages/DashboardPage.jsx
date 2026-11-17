import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { BookOpen, ChevronRight } from 'lucide-react'
import EmptyState from '../components/ui/EmptyState.jsx'
import LoadError from '../components/ui/LoadError.jsx'
import Skeleton from '../components/ui/Skeleton.jsx'
import { buttonClasses } from '../components/ui/buttonStyles.js'
import { useUserData } from '../hooks/useUserData.js'
import { getSubjectColor } from '../features/subjects/colors.js'
import {
  dayShortName,
  formatTime12,
  formatTimeRange,
  getBusiestDay,
  getUpcomingSessions,
  todayDayOfWeek,
} from '../features/schedule/utils/schedule.js'

function StatTile({ label, value, sub }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{value}</p>
      <p className="mt-0.5 text-xs text-slate-500">{sub}</p>
    </div>
  )
}

/** /dashboard — week summary (design-spec §6.2). */
export default function DashboardPage() {
  const { subjects, sessions, loading, error, reload } = useUserData()

  // Mount-time snapshot of today's weekday (stable per page visit).
  const [today] = useState(() => todayDayOfWeek())
  const busiestDay = useMemo(() => getBusiestDay(sessions), [sessions])
  const todaySessions = useMemo(
    () =>
      sessions
        .filter((session) => session.day_of_week === today)
        .sort((a, b) => (a.start_time < b.start_time ? -1 : a.start_time > b.start_time ? 1 : 0)),
    [sessions, today],
  )
  const upcoming = useMemo(() => getUpcomingSessions(sessions, 5), [sessions])

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">Your week at a glance.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/subjects" className={buttonClasses({ variant: 'secondary' })}>
            Manage subjects
          </Link>
          <Link to="/schedule" className={buttonClasses()}>
            View schedule
          </Link>
        </div>
      </header>

      {loading && (
        <div aria-hidden="true">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-24 rounded-xl" />
            ))}
          </div>
          <div className="mt-6 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
          </div>
        </div>
      )}

      {!loading && error && <LoadError onRetry={reload} />}

      {!loading && !error && subjects.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title="Let's set up your schedule"
          description="Add a subject with its code, instructor, and room — then schedule its class times."
          action={
            <Link to="/subjects" className={buttonClasses()}>
              Add your first subject
            </Link>
          }
        />
      )}

      {!loading && !error && subjects.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatTile label="Subjects" value={subjects.length} sub="This term" />
            <StatTile
              label="Weekly sessions"
              value={sessions.length}
              sub={sessions.length === 1 ? 'Class per week' : 'Classes per week'}
            />
            <StatTile
              label="Busiest day"
              value={busiestDay ? dayShortName(busiestDay.day) : '—'}
              sub={
                busiestDay
                  ? `${busiestDay.count} ${busiestDay.count === 1 ? 'session' : 'sessions'}`
                  : 'No sessions yet'
              }
            />
          </div>

          <section aria-label="Today's classes" className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900">Today&apos;s classes</h2>
            {todaySessions.length === 0 ? (
              <p className="text-sm text-slate-600">No classes today.</p>
            ) : (
              <div className="space-y-2">
                {todaySessions.map((session) => {
                  const subject = subjects.find((entry) => entry.id === session.subject_id)
                  const color = getSubjectColor(subject?.color)
                  return (
                    <div
                      key={session.id}
                      className={`print-colors flex items-center gap-3 rounded-lg border-l-4 p-3 ${color.block}`}
                    >
                      <span className="shrink-0 text-sm font-medium tabular-nums">
                        {formatTimeRange(session.start_time, session.end_time)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {subject?.subject_code ?? 'Unknown'}
                        </p>
                        {(subject?.room || subject?.instructor) && (
                          <p className={`truncate text-xs ${color.secondaryText}`}>
                            {[subject?.room, subject?.instructor].filter(Boolean).join(' · ')}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          <section aria-label="Coming up this week" className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900">Coming up this week</h2>
            {upcoming.length === 0 ? (
              <p className="text-sm text-slate-600">Nothing else this week.</p>
            ) : (
              <div className="space-y-2">
                {upcoming.map(({ date, session }) => {
                  const subject = subjects.find((entry) => entry.id === session.subject_id)
                  return (
                    <Link
                      key={session.id}
                      to="/schedule"
                      className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 transition-colors duration-150 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900">{format(date, 'EEEE')}</p>
                        <p className="truncate text-xs text-slate-600">
                          {[subject?.subject_code, formatTime12(session.start_time), subject?.room]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                    </Link>
                  )
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
