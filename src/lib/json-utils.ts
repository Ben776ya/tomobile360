// Narrowing helpers for values read from Postgres `Json` columns.
//
// Supabase types these as `Json | null`, but our application treats specific
// columns as concrete domain shapes (string arrays, plain records, variant
// lists, etc.). These helpers do a single runtime-shape check and then trust
// the documented schema for the contents — they never accept `any`.

/**
 * Narrow an unknown DB value to `string[] | null`.
 *
 * Returns `null` for anything that isn't an array. The element type is trusted
 * to match the column's documented contents (`string`); we don't deep-validate.
 */
export function toStringArray(value: unknown): string[] | null {
  return Array.isArray(value) ? (value as string[]) : null
}

/**
 * Narrow an unknown DB value to a plain object record.
 *
 * Returns `null` for arrays, primitives, and `null` itself. The value type is
 * `unknown` (not `any`) so call sites must narrow further before consuming
 * individual fields.
 */
export function toRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

/**
 * Narrow an unknown DB value to an array of the supplied element type.
 *
 * Generic counterpart to `toStringArray` for callers that need element-typed
 * arrays (e.g. `Variant[]`). Element shape is trusted to match the documented
 * column contents; we don't deep-validate.
 */
export function toTypedArray<T>(value: unknown): T[] | null {
  return Array.isArray(value) ? (value as T[]) : null
}

/**
 * Back-compat alias for the historical caller in the vehicle edit page.
 * Equivalent to `toTypedArray<Variant>(value)`.
 */
export function toVariantList<T>(value: unknown): T[] | null {
  return toTypedArray<T>(value)
}
