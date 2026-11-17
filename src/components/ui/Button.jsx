import { Loader2 } from 'lucide-react'
import { buttonClasses } from './buttonStyles.js'

/**
 * The app's single button component (design-spec §5).
 * `loading` shows a spinner, keeps the label, and disables the button.
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  children,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, className })}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  )
}
