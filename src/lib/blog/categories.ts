/**
 * Single source of truth for /actu blog-post categories.
 * Edit this array to add, remove, or reorder categories everywhere at once.
 */
export const BLOG_CATEGORIES = [
  { value: 'nouveautes',   label: 'Nouveautés',   pill: 'bg-secondary text-white',   text: 'text-secondary' },
  { value: 'business',     label: 'Business',     pill: 'bg-indigo-500 text-white',  text: 'text-indigo-400' },
  { value: 'essai',        label: 'Essai',        pill: 'bg-red-500 text-white',     text: 'text-red-400' },
  { value: 'classic-cars', label: 'Classic Cars', pill: 'bg-amber-600 text-white',   text: 'text-amber-500' },
  { value: 'interview',    label: 'Interview',    pill: 'bg-rose-500 text-white',    text: 'text-rose-400' },
] as const

export type BlogCategory = (typeof BLOG_CATEGORIES)[number]
export type BlogCategoryValue = BlogCategory['value']

export const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  BLOG_CATEGORIES.map((c) => [c.value, c.label]),
)

export const CATEGORY_PILL_COLORS: Record<string, string> = Object.fromEntries(
  BLOG_CATEGORIES.map((c) => [c.value, c.pill]),
)

export const CATEGORY_TEXT_COLORS: Record<string, string> = Object.fromEntries(
  BLOG_CATEGORIES.map((c) => [c.value, c.text]),
)

/** Filter options for the /actu bar — leads with "Tout" (all). */
export const ACTU_FILTERS: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'all', label: 'Tout' },
  ...BLOG_CATEGORIES.map((c) => ({ value: c.value, label: c.label })),
]
