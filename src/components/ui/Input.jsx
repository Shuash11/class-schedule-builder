import {
  fieldErrorClasses,
  fieldHelperClasses,
  inputClasses,
  labelClasses,
  optionalClasses,
} from './formStyles.js'

/**
 * Labeled text/email/password/time input (design-spec §5).
 * Works directly with react-hook-form: spread `{...register('field')}` onto it.
 */
export default function Input({
  id,
  label,
  error,
  helper,
  optional = false,
  className = '',
  ...props
}) {
  const describedBy = error ? `${id}-error` : helper ? `${id}-helper` : undefined

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className={labelClasses}>
        {label}
        {optional && <span className={optionalClasses}>(optional)</span>}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={inputClasses({ invalid: Boolean(error), className })}
        {...props}
      />
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
