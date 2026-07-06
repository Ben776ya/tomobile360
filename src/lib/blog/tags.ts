/**
 * Tag normalization for blog posts.
 *
 * Writers frequently paste a whole hashtag block as one chunk, e.g.
 * `#AFRIQUEAUTOMOBILE#ALGÉRIEINDUSTRIE#AUTOMOBILEMONDIALE`. Stored verbatim that
 * becomes a single whitespace-free tag that (a) reads as one giant blob and
 * (b) can't wrap, so it overflows the article layout.
 *
 * `normalizeTags` splits each raw entry into individual tags — on `#`, commas,
 * and newlines — then trims, drops empties, and de-duplicates
 * (case-insensitive, keeping the first occurrence). Used both when a writer
 * adds tags in the admin form and when tags are rendered, so existing posts
 * with an already-glued chunk are cleaned up at display time too.
 */
export function normalizeTags(raw: readonly string[] | null | undefined): string[] {
  if (!raw) return []

  const out: string[] = []
  const seen = new Set<string>()

  for (const entry of raw) {
    if (typeof entry !== 'string') continue
    // Split a single entry into individual tags on '#', commas, and newlines.
    for (const piece of entry.split(/[#,\n\r]+/)) {
      const tag = piece.trim()
      if (!tag) continue
      const key = tag.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      out.push(tag)
    }
  }

  return out
}

/**
 * Keep posts whose (normalized) tags include `tag`, compared case-insensitively.
 * Reuses normalizeTags so glued "#A#B#C" entries and inconsistent casing both
 * match. Pure — takes a fetched list, does no I/O.
 */
export function filterByTag<T extends { tags: string[] | null }>(
  posts: T[],
  tag: string,
): T[] {
  const target = tag.trim().toLowerCase()
  if (!target) return []
  return posts.filter((post) =>
    normalizeTags(post.tags).some((t) => t.toLowerCase() === target),
  )
}
