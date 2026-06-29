/**
 * Match untagged YouTube videos to a specific car by text.
 *
 * Imported videos never have `vehicle_id` set, but their titles reliably name
 * the brand and model. We require the model in the TITLE and the brand in the
 * title or description. Pure module — no I/O — so it is unit-testable.
 */
import { tokenize, containsSequence, brandMatchesText } from '@/lib/text/brand-match'

// Re-exported so existing importers keep getting it from this module.
export { normalizeText } from '@/lib/text/brand-match'

/** Does the model name appear as a consecutive whole-token sequence in the title? */
function modelMatches(titleTokens: string[], modelName: string): boolean {
  return containsSequence(titleTokens, tokenize(modelName))
}

/**
 * True when the video is about this car: the model name must appear in the
 * TITLE (that is what makes a video about a specific car), while the brand may
 * appear in the title or description. Matching the model against descriptions
 * is deliberately avoided — long descriptions list many models in passing
 * (e.g. "...Seal 08 and Sealion 08...") and would produce false positives.
 */
export function videoMatchesCar(
  title: string,
  description: string | null,
  brandName: string,
  modelName: string,
): boolean {
  const titleTokens = tokenize(title)
  if (titleTokens.length === 0) return false
  return brandMatchesText(`${title} ${description ?? ''}`, brandName) && modelMatches(titleTokens, modelName)
}

/**
 * Filter a list of videos to those matching the given car, ordered by views
 * (most popular first) and capped at `limit`. Generic so it accepts the fetched
 * Supabase rows directly.
 */
export function filterVideosForCar<
  T extends { title: string; description: string | null; views: number | null },
>(videos: T[], brandName: string, modelName: string, limit = 4): T[] {
  return videos
    .filter((v) => videoMatchesCar(v.title, v.description, brandName, modelName))
    .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
    .slice(0, limit)
}
