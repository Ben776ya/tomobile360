/**
 * Display-time cleanup of video descriptions imported from YouTube.
 *
 * Imported descriptions end with channel boilerplate: hashtag lines,
 * "Abonne-toi et active la cloche", "… sur les réseaux:" blocks with profile
 * links. This strips it when rendering only — the stored description and the
 * importer are left untouched. Pure — no I/O.
 */

/** Calls to subscribe / like / follow, and the headers of social-link blocks. */
const CALL_TO_ACTION_PATTERNS: RegExp[] = [
  /\babonne[sz]?[- ]?(toi|vous)\b/i,
  /\bsubscribe\b/i,
  /\bactive[sz]? la cloche\b/i,
  /\bpouce bleu\b/i,
  /\blike[sz]? et partage/i,
  /sur les r[ée]seaux( sociaux)?\s*:\s*$/i,
  /^suivez[- ]nous\b/i,
  /^follow us\b/i,
]

/** A line that is nothing but a link to a social profile / channel page. */
const SOCIAL_LINK_LINE =
  /^https?:\/\/(www\.)?(instagram\.com|facebook\.com|fb\.com|tiktok\.com|twitter\.com|x\.com|linkedin\.com|snapchat\.com|threads\.net|youtube\.com\/(@|channel\/|c\/|user\/))\S*$/i

/** True when most of the line's words are hashtags (a tag block). */
function isHashtagLine(line: string): boolean {
  const words = line.split(/[\s,]+/).filter(Boolean)
  const tags = words.filter((w) => w.startsWith('#')).length
  return tags * 2 > words.length
}

/** Drops hashtags trailing a line of text ("… bonne journée! #PouceBleu #Auto"). */
function stripTrailingHashtags(line: string): string {
  const words = line.split(/\s+/)
  let end = words.length
  while (end > 1 && words[end - 1].startsWith('#')) end--
  return end === words.length ? line : words.slice(0, end).join(' ')
}

export function cleanVideoDescription(description: string | null | undefined): string {
  if (!description) return ''

  const kept: string[] = []
  for (const raw of description.split(/\r?\n/)) {
    const line = raw.trim()
    if (line === '') {
      kept.push('')
      continue
    }
    if (isHashtagLine(line)) continue
    const text = stripTrailingHashtags(line)
    if (CALL_TO_ACTION_PATTERNS.some((re) => re.test(text))) continue
    if (SOCIAL_LINK_LINE.test(text)) continue
    kept.push(text)
  }

  // Removed blocks leave runs of blank lines behind: keep at most one.
  return kept.join('\n').replace(/\n{3,}/g, '\n\n').trim()
}
