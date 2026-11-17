import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Alert from '../../../components/ui/Alert.jsx'
import Button from '../../../components/ui/Button.jsx'
import Input from '../../../components/ui/Input.jsx'
import Modal from '../../../components/ui/Modal.jsx'
import { useToast } from '../../../components/ui/toastContext.js'
import { DEFAULT_SUBJECT_COLOR, getSubjectColor, SUBJECT_COLOR_VALUES } from '../colors.js'
import { createSubject, isUniqueViolation, updateSubject } from '../services/subjects.js'
import { clearLocalSession, isSessionInvalidError } from '../../auth/services/auth.js'
import ColorPicker from './ColorPicker.jsx'

const subjectSchema = z.object({
  subject_code: z
    .string()
    .trim()
    .min(1, 'Subject code is required.')
    .max(20, 'Subject code must be 20 characters or fewer.'),
  subject_name: z
    .string()
    .trim()
    .min(1, 'Subject name is required.')
    .max(80, 'Subject name must be 80 characters or fewer.'),
  instructor: z.string().trim().max(80, 'Instructor must be 80 characters or fewer.'),
  room: z.string().trim().max(40, 'Room must be 40 characters or fewer.'),
  color: z.enum(SUBJECT_COLOR_VALUES, { message: 'Choose a color.' }),
})

const EMPTY_VALUES = {
  subject_code: '',
  subject_name: '',
  instructor: '',
  room: '',
  color: DEFAULT_SUBJECT_COLOR.value,
}

const SAVE_ERROR_MESSAGE = "Couldn't save. Check your connection and try again."

/**
 * Create/edit subject modal (design-spec §6.3). Keep it mounted and toggle
 * `open`; the native dialog returns focus to its trigger on close.
 */
export default function SubjectModal({ open, subject, onClose, onSaved }) {
  const isEdit = subject !== null
  const toast = useToast()
  const [saveError, setSaveError] = useState(null)
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(subjectSchema),
    defaultValues: EMPTY_VALUES,
  })

  useEffect(() => {
    if (open) {
      reset({
        subject_code: subject?.subject_code ?? '',
        subject_name: subject?.subject_name ?? '',
        instructor: subject?.instructor ?? '',
        room: subject?.room ?? '',
        color: getSubjectColor(subject?.color).value,
      })
    }
  }, [open, subject, reset])

  // All close paths funnel through here (event handler, so clearing state is fine).
  const handleClose = () => {
    setSaveError(null)
    onClose()
  }

  // RHF's handleSubmit(...) is invoked from the submit event, not during render.
  const handleFormSubmit = (event) => {
    handleSubmit(onSubmit)(event)
  }

  const onSubmit = async (values) => {
    setSaveError(null)
    try {
      if (isEdit) {
        await updateSubject(subject.id, values)
        toast.showToast('Subject updated')
      } else {
        await createSubject(values)
        toast.showToast('Subject added')
      }
      onSaved()
      handleClose()
    } catch (error) {
      if (isUniqueViolation(error)) {
        setError('subject_code', {
          type: 'manual',
          message: 'You already have a subject with this code.',
        })
      } else if (isSessionInvalidError(error)) {
        // Session no longer valid (design-spec §4): drop it and redirect.
        await clearLocalSession()
      } else {
        setSaveError(SAVE_ERROR_MESSAGE)
      }
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEdit ? 'Edit subject' : 'Add subject'}
      pending={isSubmitting}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="subject-form" loading={isSubmitting}>
            {isEdit ? 'Save changes' : 'Add subject'}
          </Button>
        </>
      }
    >
      <form id="subject-form" onSubmit={handleFormSubmit} noValidate className="space-y-4">
        <Input
          id="subject-code"
          label="Subject code"
          placeholder="IT 101"
          error={errors.subject_code?.message}
          {...register('subject_code')}
        />
        <Input
          id="subject-name"
          label="Subject name"
          error={errors.subject_name?.message}
          {...register('subject_name')}
        />
        <Input
          id="subject-instructor"
          label="Instructor"
          optional
          error={errors.instructor?.message}
          {...register('instructor')}
        />
        <Input
          id="subject-room"
          label="Room"
          optional
          placeholder="Room 204 or Online"
          error={errors.room?.message}
          {...register('room')}
        />
        <ColorPicker
          name="color"
          register={register}
          error={errors.color?.message}
          idPrefix="subject-color"
        />
        {saveError && (
          <Alert variant="error" role="alert">
            {saveError}
          </Alert>
        )}
      </form>
    </Modal>
  )
}
