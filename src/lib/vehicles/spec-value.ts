/**
 * Shared "is this spec value worth showing?" test.
 *
 * Some fiche/spec values arrive as placeholder zeros or blanks (e.g. a torque
 * cell stored as the string "0 Nm", an empty "", or "-"). Rendering them
 * produces meaningless rows like "Couple 0 Nm". This predicate is the single
 * source of truth for hiding them — used by both the specs UI (KeySpecsStrip,
 * VehicleSpecs) and the FAQ data checks so the page and its FAQ never disagree.
 *
 * There are no legitimate zero-valued specs in this dataset (a real car never
 * has 0 Nm of torque or a 0 km/h top speed), so numeric zero — in a number or
 * as the leading token of a string like "0 Nm" — is treated as "not meaningful".
 * Booleans are always meaningful (false renders as a deliberate "Non").
 */
export function isMeaningfulSpecValue(value: unknown): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === 'boolean') return true
  if (typeof value === 'number') return value !== 0 && !Number.isNaN(value)
  if (typeof value !== 'string') return true

  const trimmed = value.trim()
  if (trimmed === '') return false

  const placeholders = ['-', '—', '–', 'n/a', 'n.a.', 'n.c.', 'nc', 'null', 'undefined']
  if (placeholders.includes(trimmed.toLowerCase())) return false

  // A leading numeric token of zero means a placeholder: "0", "0 Nm", "0 km/h",
  // "0,0 L/100km", "0.0 ch". parseFloat reads the leading number and ignores the
  // trailing unit; the comma swap first handles French decimals.
  const leading = parseFloat(trimmed.replace(',', '.'))
  if (!Number.isNaN(leading) && leading === 0) return false

  return true
}
