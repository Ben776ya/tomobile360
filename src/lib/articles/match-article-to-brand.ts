/**
 * Match blog articles to a car BRAND by text. Articles have no brand link, so
 * an article belongs to a brand when the brand name appears in its title or
 * tags. Pure module — no I/O — so it is unit-testable.
 */
import { brandMatchesText } from '@/lib/text/brand-match'

/** True when the brand appears in the article's title or any of its tags. */
export function articleMatchesBrand(
  title: string,
  tags: string[] | null,
  brandName: string,
): boolean {
  const haystack = `${title} ${(tags ?? []).join(' ')}`
  return brandMatchesText(haystack, brandName)
}

/**
 * Filter posts to those matching the given brand, preserving the input order
 * (callers fetch newest-first) and capping at `limit`. Generic so it accepts
 * the fetched Supabase rows directly.
 */
export function filterArticlesForBrand<T extends { title: string; tags: string[] | null }>(
  posts: T[],
  brandName: string,
  limit = 3,
): T[] {
  return posts.filter((p) => articleMatchesBrand(p.title, p.tags, brandName)).slice(0, limit)
}
