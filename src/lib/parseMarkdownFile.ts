export interface MarkdownFrontmatter {
  title?: string
  subtitle?: string
  meta_description?: string
  category?: string
  tags?: string[]
  author?: string
  slug?: string
}

export interface ParsedMarkdown {
  metadata: MarkdownFrontmatter
  content: string
}

export function parseMarkdownFile(raw: string): ParsedMarkdown {
  const trimmed = raw.trim()

  // Check for YAML frontmatter delimited by ---
  if (!trimmed.startsWith('---')) {
    return { metadata: {}, content: trimmed }
  }

  const endIndex = trimmed.indexOf('---', 3)
  if (endIndex === -1) {
    return { metadata: {}, content: trimmed }
  }

  const frontmatterBlock = trimmed.slice(3, endIndex).trim()
  const content = trimmed.slice(endIndex + 3).trim()

  const metadata: MarkdownFrontmatter = {}

  for (const line of frontmatterBlock.split('\n')) {
    const colonIdx = line.indexOf(':')
    if (colonIdx === -1) continue

    const key = line.slice(0, colonIdx).trim().toLowerCase()
    let value = line.slice(colonIdx + 1).trim()

    // Strip surrounding quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    switch (key) {
      case 'title':
        metadata.title = value
        break
      case 'subtitle':
        metadata.subtitle = value
        break
      case 'meta_description':
      case 'description':
        metadata.meta_description = value
        break
      case 'category':
        metadata.category = value.toLowerCase()
        break
      case 'tags':
        // Handle both YAML array [a, b] and comma-separated
        metadata.tags = value
          .replace(/^\[|\]$/g, '')
          .split(',')
          .map((t) => t.trim().replace(/^['"]|['"]$/g, ''))
          .filter(Boolean)
        break
      case 'author':
        metadata.author = value
        break
      case 'slug':
        metadata.slug = value
        break
    }
  }

  return { metadata, content }
}
