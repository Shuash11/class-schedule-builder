/** Shared form-control styling tokens (design-spec §5). */

export function inputClasses({ invalid = false, className = '' } = {}) {
  return [
    'h-10 w-full rounded-lg border bg-white px-3 text-sm text-slate-900',
    'placeholder:text-slate-500',
    'focus:border-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
    'disabled:bg-slate-100 disabled:text-slate-400',
    invalid ? 'border-red-500' : 'border-slate-300',
    className,
  ]
    .filter(Boolean)
    .join(' ')
}

export const labelClasses = 'block text-sm font-medium text-slate-700'

export const optionalClasses = 'ml-1 text-xs font-normal text-slate-500'

export const fieldErrorClasses = 'text-xs text-red-600'

export const fieldHelperClasses = 'text-xs text-slate-500'
