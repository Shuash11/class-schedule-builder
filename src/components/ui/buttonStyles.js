/**
 * Button styling tokens (design-spec §5). Shared by the Button component and
 * by links that must look like buttons (e.g. EmptyState CTAs, header actions).
 */
const VARIANTS = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
  secondary: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  destructive: 'bg-red-600 text-white hover:bg-red-700',
  destructiveQuiet: 'text-red-600 hover:bg-red-50',
}

const SIZES = {
  md: 'h-10 px-4 text-sm',
  sm: 'h-8 px-3 text-xs',
  icon: 'h-9 w-9 shrink-0',
}

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:pointer-events-none disabled:opacity-50'

export function buttonClasses({ variant = 'primary', size = 'md', className = '' } = {}) {
  return [BASE, VARIANTS[variant] ?? VARIANTS.primary, SIZES[size] ?? SIZES.md, className]
    .filter(Boolean)
    .join(' ')
}
