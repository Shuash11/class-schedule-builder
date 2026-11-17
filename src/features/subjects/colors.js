/**
 * Subject color palette (design-spec §3) — the only data colors in the app.
 *
 * Class strings are LITERAL so the Tailwind v4 JIT scanner sees them;
 * never build these class names by concatenation.
 *
 * `value` (the 500-level hex) is what gets stored in `subjects.color`.
 * The SQL default '#6366f1' (legacy) is not in the palette; getSubjectColor()
 * maps any unknown value to Indigo instead of changing the schema default.
 */
export const SUBJECT_COLORS = [
  {
    name: 'Indigo',
    value: '#615fff',
    block: 'bg-indigo-100 border-indigo-500 text-indigo-900',
    dot: 'bg-indigo-500',
    secondaryText: 'text-indigo-800',
  },
  {
    name: 'Violet',
    value: '#8e51ff',
    block: 'bg-violet-100 border-violet-500 text-violet-900',
    dot: 'bg-violet-500',
    secondaryText: 'text-violet-800',
  },
  {
    name: 'Sky',
    value: '#00a6f4',
    block: 'bg-sky-100 border-sky-500 text-sky-900',
    dot: 'bg-sky-500',
    secondaryText: 'text-sky-800',
  },
  {
    name: 'Teal',
    value: '#00bba7',
    block: 'bg-teal-100 border-teal-500 text-teal-900',
    dot: 'bg-teal-500',
    secondaryText: 'text-teal-800',
  },
  {
    name: 'Emerald',
    value: '#00bc7d',
    block: 'bg-emerald-100 border-emerald-500 text-emerald-900',
    dot: 'bg-emerald-500',
    secondaryText: 'text-emerald-800',
  },
  {
    name: 'Amber',
    value: '#fe9a00',
    block: 'bg-amber-100 border-amber-500 text-amber-900',
    dot: 'bg-amber-500',
    secondaryText: 'text-amber-800',
  },
  {
    name: 'Orange',
    value: '#ff6900',
    block: 'bg-orange-100 border-orange-500 text-orange-900',
    dot: 'bg-orange-500',
    secondaryText: 'text-orange-800',
  },
  {
    name: 'Rose',
    value: '#ff2056',
    block: 'bg-rose-100 border-rose-500 text-rose-900',
    dot: 'bg-rose-500',
    secondaryText: 'text-rose-800',
  },
]

export const SUBJECT_COLOR_VALUES = SUBJECT_COLORS.map((color) => color.value)

export const DEFAULT_SUBJECT_COLOR = SUBJECT_COLORS[0]

const COLORS_BY_VALUE = new Map(
  SUBJECT_COLORS.map((color) => [color.value.toLowerCase(), color]),
)

/** Resolves any stored color value (incl. legacy '#6366f1') to a palette entry. */
export function getSubjectColor(value) {
  return COLORS_BY_VALUE.get(String(value ?? '').toLowerCase()) ?? DEFAULT_SUBJECT_COLOR
}
