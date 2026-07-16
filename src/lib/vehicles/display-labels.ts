/**
 * Display-only French labels for vehicle enum values.
 *
 * DB values stay English (Hybrid, Electric, Manual, Automatic, …) — these are
 * what filter query params and stored rows use. Map to French ONLY at render
 * time (dropdown options, filter chips, card badges). Never write these labels
 * back to the database or use them as query values.
 */

export const FUEL_LABELS: Record<string, string> = {
  Essence: 'Essence',
  Diesel: 'Diesel',
  Hybrid: 'Hybride',
  PHEV: 'Hybride rechargeable',
  Electric: 'Électrique',
}

export const TRANSMISSION_LABELS: Record<string, string> = {
  Manual: 'Manuelle',
  Automatic: 'Automatique',
  CVT: 'CVT',
  DCT: 'Automatique (DCT)',
}

/** French fuel label, falling back to the raw value for anything unmapped. */
export function fuelLabel(value: string | null | undefined): string {
  if (!value) return ''
  return FUEL_LABELS[value] ?? value
}

/** French transmission label, falling back to the raw value for anything unmapped. */
export function transmissionLabel(value: string | null | undefined): string {
  if (!value) return ''
  return TRANSMISSION_LABELS[value] ?? value
}
