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

/**
 * Models hidden from the origin listings (e.g. utility vans that shouldn't show
 * up among "Voitures chinoises"). These are currently mis-categorised as SUV in
 * the DB, so they're matched by brand + model name rather than by category.
 * Pickups are intentionally NOT listed here — they should stay visible.
 */
export const ORIGIN_EXCLUDED_MODELS: ReadonlyArray<{ brand: string; model: string }> = [
  { brand: 'DFSK', model: 'K01h' },
  { brand: 'DFSK', model: 'C31' },
  { brand: 'DFSK', model: 'C35' },
  { brand: 'Foton', model: 'Tm' },
]

/**
 * True when a (brand, model) pair should be hidden from origin listings.
 * Matching is case-insensitive and whitespace-trimmed for robustness.
 */
export function isOriginExcludedModel(brandName: string, modelName: string): boolean {
  const b = brandName.trim().toLowerCase()
  const m = modelName.trim().toLowerCase()
  return ORIGIN_EXCLUDED_MODELS.some(
    (e) => e.brand.toLowerCase() === b && e.model.toLowerCase() === m
  )
}
