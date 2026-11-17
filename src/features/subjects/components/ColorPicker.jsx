import { Check } from 'lucide-react'
import { SUBJECT_COLORS } from '../colors.js'
import { fieldErrorClasses, labelClasses } from '../../../components/ui/formStyles.js'

/**
 * Color radio group (design-spec §3): fieldset + legend, 8 real radio inputs
 * (visually hidden) with native arrow-key behavior. Selection is shown by a
 * ring plus a white check badge — not by color alone.
 */
export default function ColorPicker({ name, register, error, idPrefix = 'color' }) {
  return (
    <fieldset className="space-y-1.5" aria-describedby={error ? `${idPrefix}-error` : undefined}>
      <legend className={labelClasses}>Color</legend>
      <div className="flex flex-wrap gap-2 pt-0.5">
        {SUBJECT_COLORS.map((color) => (
          <label key={color.value} className="relative block cursor-pointer">
            <input
              type="radio"
              name={name}
              value={color.value}
              aria-label={color.name}
              className="peer sr-only"
              {...register(name)}
            />
            <span
              aria-hidden="true"
              className={`block h-9 w-9 rounded-full transition-colors duration-150 peer-checked:ring-2 peer-checked:ring-indigo-600 peer-checked:ring-offset-2 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-indigo-600 ${color.dot}`}
            />
            <span
              aria-hidden="true"
              className="absolute -right-1 -top-1 hidden h-4 w-4 place-items-center rounded-full bg-white ring-1 ring-slate-300 peer-checked:grid"
            >
              <Check className="h-2.5 w-2.5 text-slate-900" />
            </span>
          </label>
        ))}
      </div>
      {error && (
        <p id={`${idPrefix}-error`} className={fieldErrorClasses} role="alert">
          {error}
        </p>
      )}
    </fieldset>
  )
}
