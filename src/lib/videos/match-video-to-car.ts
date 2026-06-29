/**
 * Match untagged YouTube videos to a specific car by text.
 *
 * Imported videos never have `vehicle_id` set, but their titles reliably name
 * the brand and model (e.g. "Essai Mercedes-Benz EQE SUV"). We normalize the
 * title + description and require BOTH the brand and the model to be present.
 * Pure module — no I/O — so it is unit-testable.
 */

/**
 * Brands whose name appears differently in video titles than in the DB.
 * Keys are the normalized brand name (see {@link normalizeText}); values are
 * additional normalized forms that should also satisfy the brand check.
 */
const BRAND_ALIASES: Record<string, string[]> = {
  'mercedes benz': ['mercedes'],
}

/** First-token brand aliases shorter than this are too risky to match alone. */
const MIN_FIRST_TOKEN_LEN = 4

/** Lowercase, strip accents, and collapse every non-alphanumeric run to a single space. */
export function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function tokenize(input: string): string[] {
  const normalized = normalizeText(input)
  return normalized.length > 0 ? normalized.split(' ') : []
}

/** True if `seq` appears as a consecutive run of exact tokens within `tokens`. */
function containsSequence(tokens: string[], seq: string[]): boolean {
  if (seq.length === 0 || seq.length > tokens.length) return false
  for (let i = 0; i <= tokens.length - seq.length; i++) {
    let matched = true
    for (let j = 0; j < seq.length; j++) {
      if (tokens[i + j] !== seq[j]) {
        matched = false
        break
      }
    }
    if (matched) return true
  }
  return false
}

/** Does the brand (full name, an alias, or a long-enough first token) appear? */
function brandMatches(haystackTokens: string[], brandName: string): boolean {
  const normalizedBrand = normalizeText(brandName)
  if (!normalizedBrand) return false

  const candidates = [normalizedBrand, ...(BRAND_ALIASES[normalizedBrand] ?? [])]
  for (const candidate of candidates) {
    const candidateTokens = candidate.split(' ').filter(Boolean)
    if (candidateTokens.length === 0) continue
    // Full candidate present as a consecutive token sequence.
    if (containsSequence(haystackTokens, candidateTokens)) return true
    // First-token fallback, only when it is distinctive enough.
    const first = candidateTokens[0]
    if (first.length >= MIN_FIRST_TOKEN_LEN && haystackTokens.includes(first)) return true
  }
  return false
}

/** Does the model name appear as a consecutive whole-token sequence? */
function modelMatches(haystackTokens: string[], modelName: string): boolean {
  const modelTokens = tokenize(modelName)
  return containsSequence(haystackTokens, modelTokens)
}

/**
 * True when the video's text names BOTH the car's brand and model. Description
 * is included alongside the title to catch models mentioned only there.
 */
export function videoMatchesCar(
  title: string,
  description: string | null,
  brandName: string,
  modelName: string,
): boolean {
  const haystackTokens = tokenize(`${title} ${description ?? ''}`)
  if (haystackTokens.length === 0) return false
  return brandMatches(haystackTokens, brandName) && modelMatches(haystackTokens, modelName)
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
