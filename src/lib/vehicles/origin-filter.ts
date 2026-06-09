// Single source of truth for the catalogue "origin" filter (e.g. the homepage
// "Voitures chinoises" button). Maps the public ?origin= URL slug to the
// canonical brands.origin DB value, and provides a display label per origin.
// Extensible: add a new slug + label pair to support "voitures allemandes", etc.

export const ORIGIN_PARAM_TO_DB: Record<string, string> = {
  chinese: 'China',
}

export const ORIGIN_LABELS: Record<string, string> = {
  China: 'Voitures chinoises',
}

/**
 * Resolve a raw ?origin= URL param to the canonical brands.origin DB value.
 * Returns null for missing or unrecognised values (caller should then apply
 * no origin filter, or render an empty state for a deliberately-unknown origin).
 */
export function resolveOriginDbValue(param: string | undefined | null): string | null {
  if (!param) return null
  return ORIGIN_PARAM_TO_DB[param.toLowerCase()] ?? null
}
