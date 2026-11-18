import { useMemo, useState } from 'react'
import { BookOpen, Plus } from 'lucide-react'
import Button from '../../../components/ui/Button.jsx'
import ConfirmDialog from '../../../components/ui/ConfirmDialog.jsx'
import EmptyState from '../../../components/ui/EmptyState.jsx'
import LoadError from '../../../components/ui/LoadError.jsx'
import Skeleton from '../../../components/ui/Skeleton.jsx'
import { useToast } from '../../../components/ui/toastContext.js'
import { useUserData } from '../../../hooks/useUserData.js'
import { deleteSubject } from '../services/subjects.js'
import SubjectCard from '../components/SubjectCard.jsx'
import SubjectModal from '../components/SubjectModal.jsx'

function sessionCounts(sessions) {
  const counts = new Map()
  for (const session of sessions) {
    counts.set(session.subject_id, (counts.get(session.subject_id) ?? 0) + 1)
  }
  return counts
}

/** /subjects — manage subjects (design-spec §6.3). */
export default function SubjectsPage() {
  const { subjects, sessions, loading, error, reload } = useUserData()
  const toast = useToast()
  const [modal, setModal] = useState(null) // { mode: 'create' } | { mode: 'edit', subject }
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  const counts = useMemo(() => sessionCounts(sessions), [sessions])
  const deleteSessionCount = deleteTarget ? (counts.get(deleteTarget.id) ?? 0) : 0

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setDeleteError(null)
    try {
      await deleteSubject(deleteTarget.id)
      toast.showToast('Subject deleted')
      setDeleteTarget(null)
      reload()
    } catch {
      setDeleteError("Couldn't delete. Check your connection and try again.")
    } finally {
      setDeleting(false)
    }
  }

  // design-spec §11 microcopy — always name the cascade consequence.
  const deleteBody = `This also removes its ${deleteSessionCount} class ${
    deleteSessionCount === 1 ? 'session' : 'sessions'
  }. This can't be undone.`

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Subjects</h1>
          <p className="mt-1 text-sm text-slate-600">Your courses for this term.</p>
        </div>
        <Button onClick={() => setModal({ mode: 'create' })}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add subject
        </Button>
      </header>

      {loading && (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
          {Array.from({ length: 6 }, (_, index) => (
            <li key={index}>
              <Skeleton className="h-40 rounded-xl" />
            </li>
          ))}
        </ul>
      )}

      {!loading && error && <LoadError onRetry={reload} />}

      {!loading && !error && subjects.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title="No subjects yet"
          description="Add a subject with its code, instructor, and room — then schedule its class times."
          action={
            <Button onClick={() => setModal({ mode: 'create' })}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add subject
            </Button>
          }
        />
      )}

      {!loading && !error && subjects.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {subjects.map((subject) => (
            <li key={subject.id}>
              <SubjectCard
                subject={subject}
                sessionCount={counts.get(subject.id) ?? 0}
                onEdit={() => setModal({ mode: 'edit', subject })}
                onDelete={() => {
                  setDeleteError(null) // don't show a previous failure for a new target
                  setDeleteTarget(subject)
                }}
              />
            </li>
          ))}
        </ul>
      )}

      <SubjectModal
        open={modal !== null}
        subject={modal?.subject ?? null}
        onClose={() => setModal(null)}
        onSaved={reload}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => {
          setDeleteError(null) // cancel/clear — a failed attempt must not leak
          setDeleteTarget(null)
        }}
        onConfirm={handleDelete}
        title={deleteTarget ? `Delete ${deleteTarget.subject_code}?` : 'Delete subject?'}
        body={deleteBody}
        confirmLabel="Delete subject"
        loading={deleting}
        error={deleteError}
      />
    </div>
  )
}
