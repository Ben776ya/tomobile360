import type { ModelGroup } from '@/components/vehicles/ModelCard'

/** Profile of the vehicle the user is currently viewing. */
export interface SimilarityReference {
  /** Cheapest price of the opened model; null when unknown. */
  anchorPrice: number | null
  /** Fuel types offered by the opened model (e.g. ['Electric']). */
  fuelTypes: string[]
  /** Origin of the opened model's brand (e.g. 'China'); null when unknown. */
  origin: string | null
}

/** Price band half-width: candidates within ±30% of the anchor are "in band". */
export const PRICE_BAND = 0.3
const FUEL_BOOST = 2
const ORIGIN_BOOST = 2

function similarityScore(
  group: ModelGroup,
  origin: string | null,
  ref: SimilarityReference,
): number {
  let score = 0
  if (ref.fuelTypes.length > 0 && group.fuelTypes.some((f) => ref.fuelTypes.includes(f))) {
    score += FUEL_BOOST
  }
  if (ref.origin && origin && origin === ref.origin) {
    score += ORIGIN_BOOST
  }
  return score
}

/** Absolute price gap to the anchor; Infinity when either side is unknown. */
function priceDistance(group: ModelGroup, anchorPrice: number | null): number {
  if (anchorPrice == null || group.minPrice == null) return Infinity
  return Math.abs(group.minPrice - anchorPrice)
}

function isInBand(group: ModelGroup, anchorPrice: number | null): boolean {
  if (anchorPrice == null) return true // no price signal → no band filter
  if (group.minPrice == null) return false
  return (
    group.minPrice >= anchorPrice * (1 - PRICE_BAND) &&
    group.minPrice <= anchorPrice * (1 + PRICE_BAND)
  )
}

/**
 * Rank candidate model groups by similarity to the opened vehicle.
 *
 * In-band candidates (price within ±30% of the anchor) come first, ordered by
 * soft-boost score (same fuel +2, same origin +2) then price proximity. If
 * fewer than `limit` are in band, out-of-band candidates fill the rest, ordered
 * by price proximity only. Category is assumed already filtered by the caller.
 */
export function rankSimilarModels(
  groups: ModelGroup[],
  originByModel: Record<string, string | null>,
  ref: SimilarityReference,
  limit = 4,
): ModelGroup[] {
  const scored = groups.map((group) => ({
    group,
    score: similarityScore(group, originByModel[group.modelId] ?? null, ref),
    distance: priceDistance(group, ref.anchorPrice),
    inBand: isInBand(group, ref.anchorPrice),
  }))

  const primary = scored
    .filter((s) => s.inBand)
    .sort((a, b) => b.score - a.score || a.distance - b.distance)

  const fallback = scored
    .filter((s) => !s.inBand)
    .sort((a, b) => a.distance - b.distance)

  return [...primary, ...fallback].slice(0, limit).map((s) => s.group)
}
