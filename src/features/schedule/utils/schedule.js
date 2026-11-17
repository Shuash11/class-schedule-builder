import { format, parse } from 'date-fns'

/**
 * Weekly-schedule domain logic (project guide §8).
 *
 * Stored `day_of_week`: 0 = Sunday … 6 = Saturday.
 * Display order is Monday-first (design-spec §7).
 */
export const DISPLAY_DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]

export const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

export const DAY_SHORT_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function dayName(dayOfWeek) {
  return DAY_NAMES[dayOfWeek] ?? ''
}

export function dayShortName(dayOfWeek) {
  return DAY_SHORT_NAMES[dayOfWeek] ?? ''
}

export function todayDayOfWeek(now = new Date()) {
  return now.getDay()
}

/**
 * Formats a stored time (24-hour) as a 12-hour time such as "9:05 AM".
 * Accepts "HH:mm" (what <input type="time"> yields) and the "HH:mm:ss[.f]"
 * form PostgreSQL/PostgREST returns for `time` columns.
 */
export function formatTime12(time) {
  if (!time) return ''
  const match = /^(\d{1,2}):(\d{2})/.exec(String(time))
  if (!match) return String(time)
  const parsed = parse(`${match[1]}:${match[2]}`, 'HH:mm', new Date())
  return Number.isNaN(parsed.getTime()) ? String(time) : format(parsed, 'h:mm a')
}

/** "9:00 AM–10:30 AM" — en dash between times (design-spec §14.7). */
export function formatTimeRange(startTime, endTime) {
  return `${formatTime12(startTime)}–${formatTime12(endTime)}`
}

/**
 * Parses a 24-hour time ("HH:mm" from <input type="time">, or the
 * "HH:mm:ss[.fraction]" form PostgreSQL/PostgREST returns for `time`
 * columns) into minutes since midnight. Returns null when unparseable.
 *
 * Guide §8 notes that string comparison is only valid for consistently
 * formatted values; the database representation ("HH:mm:ss") and the form
 * representation ("HH:mm") differ, so comparisons are done numerically.
 */
export function timeToMinutes(time) {
  const match = /^(\d{1,2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/.exec(String(time ?? ''))
  if (!match) return null
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours > 23 || minutes > 59) return null
  return hours * 60 + minutes
}

/**
 * Two sessions conflict when they share a day AND their time intervals
 * overlap. Times are compared as minutes since midnight so mixed
 * "HH:mm" / "HH:mm:ss" representations behave identically.
 * Touching times (one ends exactly when the other starts) do NOT conflict.
 */
export function sessionsOverlap(newSession, existingSession) {
  const newStart = timeToMinutes(newSession.start_time)
  const newEnd = timeToMinutes(newSession.end_time)
  const existingStart = timeToMinutes(existingSession.start_time)
  const existingEnd = timeToMinutes(existingSession.end_time)
  if (newStart === null || newEnd === null || existingStart === null || existingEnd === null) {
    return false
  }

  const sameDay = newSession.day_of_week === existingSession.day_of_week
  const startsBeforeExistingEnds = newStart < existingEnd
  const endsAfterExistingStarts = newEnd > existingStart

  return sameDay && startsBeforeExistingEnds && endsAfterExistingStarts
}

/**
 * Returns every session in `sessions` that conflicts with `candidateSession`.
 * Pass the edited session's own id as `excludeId` while editing so a session
 * never conflicts with itself.
 */
export function findConflicts(candidateSession, sessions, excludeId = null) {
  return sessions.filter(
    (session) => session.id !== excludeId && sessionsOverlap(candidateSession, session),
  )
}

function compareByStartTime(a, b) {
  if (a.start_time < b.start_time) return -1
  if (a.start_time > b.start_time) return 1
  if (a.end_time < b.end_time) return -1
  if (a.end_time > b.end_time) return 1
  return 0
}

/** Monday-first day buckets, each with its sessions in chronological order. */
export function groupSessionsByDay(sessions) {
  return DISPLAY_DAY_ORDER.map((day) => ({
    day,
    sessions: sessions
      .filter((session) => session.day_of_week === day)
      .sort(compareByStartTime),
  }))
}

/**
 * Human-readable conflict alert (design-spec §7.3 / §11 microcopy).
 * Returns null when there are no conflicts.
 */
export function buildConflictMessage(conflicts, subjects) {
  if (conflicts.length === 0) return null

  const first = conflicts[0]
  const subject = subjects.find((entry) => entry.id === first.subject_id)
  const code = subject?.subject_code ?? 'another class'
  const when = `${dayName(first.day_of_week)}, ${formatTimeRange(first.start_time, first.end_time)}`

  if (conflicts.length === 1) {
    return `This overlaps with ${code} on ${when}. Adjust the day or times to save.`
  }

  const otherCount = conflicts.length - 1
  const otherLabel = otherCount === 1 ? '1 other class' : `${otherCount} other classes`
  return `This overlaps with ${code} and ${otherLabel}. Adjust the day or times to save.`
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

/** Next calendar occurrence of a weekday strictly after `fromDate`. */
export function nextOccurrence(dayOfWeek, fromDate = new Date()) {
  const base = startOfDay(fromDate)
  const diff = (dayOfWeek - base.getDay() + 7) % 7
  const offset = diff === 0 ? 7 : diff
  const date = new Date(base)
  date.setDate(date.getDate() + offset)
  return date
}

/** Next `count` class occurrences strictly after today, in date order. */
export function getUpcomingSessions(sessions, count = 5, now = new Date()) {
  return sessions
    .map((session) => ({ date: nextOccurrence(session.day_of_week, now), session }))
    .sort((a, b) => a.date - b.date || compareByStartTime(a.session, b.session))
    .slice(0, count)
}

/** Day with the most sessions: { day, count } or null when there are none. */
export function getBusiestDay(sessions) {
  const counts = new Map()
  for (const session of sessions) {
    counts.set(session.day_of_week, (counts.get(session.day_of_week) ?? 0) + 1)
  }

  let busiest = null
  for (const [day, count] of counts) {
    if (!busiest || count > busiest.count) {
      busiest = { day, count }
    }
  }
  return busiest
}
