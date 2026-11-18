import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Alert from '../../../components/ui/Alert.jsx'
import Button from '../../../components/ui/Button.jsx'
import ConfirmDialog from '../../../components/ui/ConfirmDialog.jsx'
import Input from '../../../components/ui/Input.jsx'
import Modal from '../../../components/ui/Modal.jsx'
import Select from '../../../components/ui/Select.jsx'
import { buttonClasses } from '../../../components/ui/buttonStyles.js'
import { useToast } from '../../../components/ui/toastContext.js'
import {
  buildConflictMessage,
  dayName,
  DISPLAY_DAY_ORDER,
  findConflicts,
  formatTimeRange,
  timeToMinutes,
} from '../utils/schedule.js'
import { createSession, deleteSession, updateSession } from '../services/sessions.js'

// Strict zero-padded 24-hour "HH:mm" — exactly what <input type="time">
// submits (guide §8 requires format validation before storage/comparison).
const TIME_FORMAT = /^([01]\d|2[0-3]):[0-5]\d$/

const sessionSchema = z
  .object({
    subject_id: z.string().min(1, 'Select a subject.'),
    day_of_week: z.string().min(1, 'Select a day.'),
    start_time: z
      .string()
      .min(1, 'Start time is required.')
      .regex(TIME_FORMAT, 'Enter a valid time.'),
    end_time: z
      .string()
      .min(1, 'End time is required.')
      .regex(TIME_FORMAT, 'Enter a valid time.'),
  })
  // Touching times (end == another class's start) are NOT conflicts (guide §8);
  // only a strictly earlier end fails here. Compared numerically so the rule
  // does not depend on string formatting.
  .refine(
    (values) => {
      const start = timeToMinutes(values.start_time)
      const end = timeToMinutes(values.end_time)
      if (start === null || end === null) return true // format rules handle these
      return end > start
    },
    { message: 'End time must be after start time.', path: ['end_time'] },
  )

const DAY_OPTIONS = DISPLAY_DAY_ORDER.map((day) => ({ value: String(day), label: dayName(day) }))

const SAVE_ERROR_MESSAGE = "Couldn't save. Check your connection and try again."
const DELETE_ERROR_MESSAGE = "Couldn't delete. Check your connection and try again."

/**
 * Create/edit session modal (design-spec §7.3). Keep it mounted and toggle
 * `open`; the native dialog returns focus to its trigger on close.
 *
 * Conflict detection (guide §8): same day + interval overlap against the
 * loaded sessions, excluding the edited session's own id, re-run on every
 * change of day/start/end. The save button stays enabled — submitting while
 * a conflict exists is prevented and focus moves to the alert.
 */
export default function SessionModal({
  open,
  mode,
  session,
  defaultDay,
  subjects,
  sessions,
  onClose,
  onSaved,
}) {
  const isEdit = mode === 'edit' && session !== null
  const toast = useToast()
  const [saveError, setSaveError] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)
  const conflictAlertRef = useRef(null)

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(sessionSchema),
    defaultValues: { subject_id: '', day_of_week: '1', start_time: '', end_time: '' },
  })

  useEffect(() => {
    if (open) {
      reset(
        isEdit
          ? {
              subject_id: session.subject_id,
              day_of_week: String(session.day_of_week),
              start_time: session.start_time,
              end_time: session.end_time,
            }
          : {
              subject_id: '',
              day_of_week: String(defaultDay),
              start_time: '',
              end_time: '',
            },
      )
    }
  }, [open, isEdit, session, defaultDay, reset])

  const watchedDay = useWatch({ control, name: 'day_of_week' })
  const watchedStart = useWatch({ control, name: 'start_time' })
  const watchedEnd = useWatch({ control, name: 'end_time' })

  const subjectsById = useMemo(
    () => new Map(subjects.map((subject) => [subject.id, subject])),
    [subjects],
  )

  const conflicts = useMemo(() => {
    if (!open || !watchedDay || !watchedStart || !watchedEnd || watchedEnd <= watchedStart) {
      return []
    }
    return findConflicts(
      { day_of_week: Number(watchedDay), start_time: watchedStart, end_time: watchedEnd },
      sessions,
      isEdit ? session.id : null,
    )
  }, [open, watchedDay, watchedStart, watchedEnd, sessions, isEdit, session])

  const conflictMessage = conflicts.length > 0 ? buildConflictMessage(conflicts, subjects) : null
  const noSubjects = subjects.length === 0

  // All close paths funnel through here (event handler, so clearing state is fine).
  const handleClose = () => {
    setSaveError(null)
    setConfirmOpen(false)
    setDeleteError(null)
    onClose()
  }

  const onSubmit = async (values) => {
    if (conflicts.length > 0) {
      conflictAlertRef.current?.focus()
      return
    }
    setSaveError(null)
    const payload = {
      subject_id: values.subject_id,
      day_of_week: Number(values.day_of_week),
      start_time: values.start_time,
      end_time: values.end_time,
    }
    try {
      if (isEdit) {
        await updateSession(session.id, payload)
        toast.showToast('Session updated')
      } else {
        await createSession(payload)
        toast.showToast('Session added')
      }
      onSaved()
      handleClose()
    } catch {
      setSaveError(SAVE_ERROR_MESSAGE)
    }
  }

  const handleDelete = async () => {
    if (!session) return
    setDeleting(true)
    setDeleteError(null)
    try {
      await deleteSession(session.id)
      toast.showToast('Session removed')
      setConfirmOpen(false)
      onSaved()
      handleClose()
    } catch {
      setDeleteError(DELETE_ERROR_MESSAGE)
    } finally {
      setDeleting(false)
    }
  }

  // RHF's handleSubmit(...) is invoked from the submit event, not during render.
  const handleFormSubmit = (event) => {
    handleSubmit(onSubmit)(event)
  }

  const editSummary = isEdit
    ? `${subjectsById.get(session.subject_id)?.subject_code ?? 'Unknown'} on ${dayName(
        session.day_of_week,
      )}, ${formatTimeRange(session.start_time, session.end_time)}`
    : ''

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        title={isEdit ? 'Edit session' : 'Add session'}
        pending={isSubmitting}
        footer={
          noSubjects ? (
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
          ) : (
            <div className="flex w-full items-center justify-between gap-3">
              {isEdit ? (
                <Button
                  variant="destructiveQuiet"
                  onClick={() => {
                    setDeleteError(null)
                    setConfirmOpen(true)
                  }}
                >
                  Delete session
                </Button>
              ) : (
                <span aria-hidden="true" />
              )}
              <div className="flex gap-3">
                <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" form="session-form" loading={isSubmitting}>
                  {isEdit ? 'Save changes' : 'Add session'}
                </Button>
              </div>
            </div>
          )
        }
      >
        {noSubjects ? (
          <div className="space-y-4">
            <Alert variant="info">You need a subject before you can add sessions.</Alert>
            <div>
              <Link to="/subjects" className={buttonClasses()} onClick={handleClose}>
                Go to subjects
              </Link>
            </div>
          </div>
        ) : (
          <form
            id="session-form"
            onSubmit={handleFormSubmit}
            noValidate
            className="space-y-4"
          >
            <Select
              id="session-subject"
              label="Subject"
              error={errors.subject_id?.message}
              {...register('subject_id')}
            >
              <option value="" disabled>
                Select a subject
              </option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.subject_code} — {subject.subject_name}
                </option>
              ))}
            </Select>
            <Select
              id="session-day"
              label="Day"
              error={errors.day_of_week?.message}
              {...register('day_of_week')}
            >
              {DAY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <div className="grid grid-cols-2 gap-3">
              <Input
                id="session-start"
                label="Start time"
                type="time"
                step={300}
                error={errors.start_time?.message}
                {...register('start_time')}
              />
              <Input
                id="session-end"
                label="End time"
                type="time"
                step={300}
                error={errors.end_time?.message}
                {...register('end_time')}
              />
            </div>
            {conflictMessage && (
              <div ref={conflictAlertRef} tabIndex={-1}>
                <Alert variant="error" role="alert" title="Time conflict">
                  {conflictMessage}
                </Alert>
              </div>
            )}
            {saveError && (
              <Alert variant="error" role="alert">
                {saveError}
              </Alert>
            )}
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Remove this session?"
        body={`${editSummary} will be removed. This can't be undone.`}
        confirmLabel="Remove session"
        loading={deleting}
        error={deleteError}
      />
    </>
  )
}
