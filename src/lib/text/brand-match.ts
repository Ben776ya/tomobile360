/**
 * Shared text-normalization and brand-matching helpers used by the video and
 * article matchers. Pure — no I/O. The brand-alias map lives here only.
 */

/**
 * Brands whose name appears differently in content than in the DB. Keys are the
 * normalized brand name (see {@link normalizeText}); values are additional
 * normalized forms that should also satisfy the brand check.
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

export function tokenize(input: string): string[] {
  const normalized = normalizeText(input)
  return normalized.length > 0 ? normalized.split(' ') : []
}

/** True if `seq` appears as a consecutive run of exact tokens within `tokens`. */
export function containsSequence(tokens: string[], seq: string[]): boolean {
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

/**
 * Does the brand (full name, an alias, or a long-enough first token) appear in
 * `haystack` as a whole-word token sequence?
 */
export function brandMatchesText(haystack: string, brandName: string): boolean {
  const haystackTokens = tokenize(haystack)
  if (haystackTokens.length === 0) return false
  const normalizedBrand = normalizeText(brandName)
  if (!normalizedBrand) return false

  const candidates = [normalizedBrand, ...(BRAND_ALIASES[normalizedBrand] ?? [])]
  for (const candidate of candidates) {
    const candidateTokens = candidate.split(' ').filter(Boolean)
    if (candidateTokens.length === 0) continue
    if (containsSequence(haystackTokens, candidateTokens)) return true
    const first = candidateTokens[0]
    if (first.length >= MIN_FIRST_TOKEN_LEN && haystackTokens.includes(first)) return true
  }
  return false
}
