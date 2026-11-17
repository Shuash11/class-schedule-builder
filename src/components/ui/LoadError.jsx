import { useId } from 'react'
import Alert from './Alert.jsx'
import Button from './Button.jsx'

/**
 * Page-load error state (design-spec §6.2 / §11): error alert + Retry.
 */
export default function LoadError({ onRetry, className = '' }) {
  const alertId = useId()

  return (
    <div className={`space-y-3 ${className}`} aria-live="polite">
      <Alert id={alertId} variant="error" role="alert">
        Couldn&apos;t load your data. Check your connection and try again.
      </Alert>
      <Button variant="secondary" size="sm" onClick={onRetry} aria-describedby={alertId}>
        Retry
      </Button>
    </div>
  )
}
