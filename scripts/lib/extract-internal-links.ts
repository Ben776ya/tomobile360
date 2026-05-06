// Markdown link: [text](href) — but NOT preceded by `!` (image syntax).
// Negative lookbehind ensures we skip `![alt](src)`.
// Handles balanced parentheses in the URL: captures either non-paren/non-whitespace chars OR balanced inner parens.
const MARKDOWN_LINK_RE = /(?<!\!)\[[^\]]*\]\(\s*((?:[^()\s]|\([^()]*\))+)\s*\)/g

// HTML anchor: <a ... href="..." ...> or <a ... href='...' ...>
const HTML_ANCHOR_RE = /<a\s[^>]*?href=["']([^"']+)["']/gi

export function extractInternalLinks(content: string): string[] {
  if (!content) return []

  const found = new Set<string>()

  let m: RegExpExecArray | null
  while ((m = MARKDOWN_LINK_RE.exec(content)) !== null) {
    if (m[1]) {
      const href = m[1].trim()
      // Only include internal links (starting with /)
      if (href.startsWith('/')) {
        found.add(href)
      }
    }
  }
  while ((m = HTML_ANCHOR_RE.exec(content)) !== null) {
    if (m[1]) {
      const href = m[1].trim()
      // Only include internal links (starting with /)
      if (href.startsWith('/')) {
        found.add(href)
      }
    }
  }

  return Array.from(found)
}
