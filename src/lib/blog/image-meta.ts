/**
 * Article image metadata, stored in the Markdown image title:
 *
 *   ![alt](url "size:medium|float:left|caption:Crédit photo")
 *
 * Shared by the public renderer, the admin editor and the gallery syntax so
 * the three never drift apart. Pure — no I/O.
 */

export type ImageSize = 'small' | 'medium' | 'large' | 'full'
export type ImageFloat = 'left' | 'right' | 'none'

export type ImageMeta = {
  size: ImageSize
  float: ImageFloat
  caption: string
}

export const IMAGE_SIZES: readonly ImageSize[] = ['small', 'medium', 'large', 'full']
export const IMAGE_FLOATS: readonly ImageFloat[] = ['left', 'right', 'none']

export function parseImageMeta(title?: string | null): ImageMeta {
  if (!title) return { size: 'full', float: 'none', caption: '' }

  // Caption may contain pipes, so extract it first (everything after "caption:")
  let caption = ''
  let rest = title
  const captionIdx = title.indexOf('caption:')
  if (captionIdx >= 0) {
    caption = title.slice(captionIdx + 'caption:'.length).trim()
    rest = title.slice(0, captionIdx).replace(/\|$/, '')
  }

  const meta: Record<string, string> = {}
  rest.split('|').forEach((part) => {
    const colonIdx = part.indexOf(':')
    if (colonIdx > 0) {
      const key = part.slice(0, colonIdx).trim()
      const val = part.slice(colonIdx + 1).trim()
      meta[key] = val
    }
  })

  return {
    size: (IMAGE_SIZES as readonly string[]).includes(meta.size) ? (meta.size as ImageSize) : 'full',
    float: (IMAGE_FLOATS as readonly string[]).includes(meta.float) ? (meta.float as ImageFloat) : 'none',
    caption,
  }
}

/** Inverse of parseImageMeta. Returns '' when every field is at its default. */
export function buildImageTitle(meta: Partial<ImageMeta>): string {
  const parts: string[] = []
  if (meta.size && meta.size !== 'full') parts.push(`size:${meta.size}`)
  if (meta.float && meta.float !== 'none') parts.push(`float:${meta.float}`)
  // Caption goes last — the parser takes everything after "caption:".
  const caption = sanitizeTitleText(meta.caption ?? '')
  if (caption) parts.push(`caption:${caption}`)
  return parts.join('|')
}

/** A title is a double-quoted Markdown string on one line. */
function sanitizeTitleText(text: string): string {
  return text.replace(/[\r\n]+/g, ' ').replace(/"/g, "'").trim()
}

/** Alt text sits inside `[...]` on one line. */
export function sanitizeAlt(alt: string): string {
  return alt.replace(/[[\]\r\n]/g, ' ').replace(/\s{2,}/g, ' ').trim()
}

/** Keep a URL inside `(...)` unambiguous: no spaces, no parentheses. */
export function sanitizeMarkdownUrl(url: string): string {
  return url.trim().replace(/ /g, '%20').replace(/\(/g, '%28').replace(/\)/g, '%29')
}

export function buildImageMarkdown(image: {
  src: string
  alt?: string | null
  size?: ImageSize
  float?: ImageFloat
  caption?: string | null
}): string {
  const alt = sanitizeAlt(image.alt || '')
  const src = sanitizeMarkdownUrl(image.src)
  const title = buildImageTitle({
    size: image.size,
    float: image.float,
    caption: image.caption ?? '',
  })
  return title ? `![${alt}](${src} "${title}")` : `![${alt}](${src})`
}
