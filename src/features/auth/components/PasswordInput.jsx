import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import {
  fieldErrorClasses,
  fieldHelperClasses,
  inputClasses,
  labelClasses,
} from '../../../components/ui/formStyles.js'

/**
 * Password field with show/hide toggle (design-spec §6.1): ghost icon inside
 * the input, Eye/EyeOff, aria-label + aria-pressed.
 */
export default function PasswordInput({
  id,
  label,
  error,
  helper,
  autoComplete,
  className = '',
  ...props
}) {
  const [visible, setVisible] = useState(false)
  const describedBy = error ? `${id}-error` : helper ? `${id}-helper` : undefined

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className={labelClasses}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`${inputClasses({ invalid: Boolean(error) })} pr-11 ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          className="absolute right-1 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-slate-600 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>
      {error ? (
        <p id={`${id}-error`} className={fieldErrorClasses}>
          {error}
        </p>
      ) : helper ? (
        <p id={`${id}-helper`} className={fieldHelperClasses}>
          {helper}
        </p>
      ) : null}
    </div>
  )
}
