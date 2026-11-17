import Alert from './Alert.jsx'
import Button from './Button.jsx'
import Modal from './Modal.jsx'

/**
 * Delete-confirmation dialog (design-spec §5): Cancel + destructive solid
 * confirm. `error` surfaces a failed delete inline above the footer.
 */
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  body,
  confirmLabel,
  loading = false,
  error = null,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="md"
      pending={loading}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-600">{body}</p>
        {error && (
          <Alert variant="error" role="alert">
            {error}
          </Alert>
        )}
      </div>
    </Modal>
  )
}
