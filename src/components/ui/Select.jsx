import { ChevronDown } from 'lucide-react'
import {
  fieldErrorClasses,
  inputClasses,
  labelClasses,
  optionalClasses,
} from './formStyles.js'

/**
 * Native select with the app's control styling and a custom chevron
 * (design-spec §5). Works with react-hook-form via `{...register('field')}`.
 */
export default function Select({
  id,
  label,
  error,
  optional = false,
  className = '',
  children,
  ...props
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className={labelClasses}>
        {label}
        {optional && <span className={optionalClasses}>(optional)</span>}
      </label>
      <div className="relative">
        <select
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`${inputClasses({ invalid: Boolean(error) })} appearance-none pr-9 ${className}`}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
          aria-hidden="true"
        />
      </div>
      {error && (
        <p id={`${id}-error`} className={fieldErrorClasses}>
          {error}
        </p>
      )}
    </div>
  )
}
