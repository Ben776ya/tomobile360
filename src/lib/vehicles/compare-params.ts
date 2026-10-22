/**
 * Comparator URL state: one `v` param per column, `<vehicleId>` or
 * `<vehicleId>_<versionSlug>` (e.g. from « Comparer ce véhicule » on a model
 * page). Vehicle ids are UUIDs and version slugs are [a-z0-9-], so neither
 * contains '_', and '_' survives URLSearchParams unescaped.
 */
export type CompareSlot = { id: string; version: string | null }

export function parseCompareSlot(value: string): CompareSlot {
  const i = value.indexOf('_')
  if (i === -1) return { id: value.trim(), version: null }
  return { id: value.slice(0, i).trim(), version: value.slice(i + 1).trim() || null }
}

/** Parse every `v` value, dropping empty ones. */
export function parseCompareSlots(values: string[]): CompareSlot[] {
  return values.map(parseCompareSlot).filter((s) => s.id !== '')
}

export function compareSlotParam(slot: CompareSlot): string {
  return slot.version ? `${slot.id}_${slot.version}` : slot.id
}

export function compareHref(slots: CompareSlot[]): string {
  const params = new URLSearchParams()
  slots.forEach((s) => params.append('v', compareSlotParam(s)))
  return `/neuf/comparer?${params.toString()}`
}
