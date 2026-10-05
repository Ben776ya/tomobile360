/**
 * Markdown syntax for the rich article blocks, following the generic
 * directives proposal (block forms only — what remarkBlockDirectives parses on
 * the public site):
 *
 *   :::gallery[Légende de la galerie]{layout="mosaic"}
 *   ![Texte alternatif](https://…/1.webp "caption:Légende photo 1")
 *   ![Texte alternatif](https://…/2.webp)
 *   :::
 *
 *   ::embed[Légende de la vidéo]{url="https://www.youtube.com/watch?v=…"}
 *
 * The admin editor parses and writes exactly this through the helpers below,
 * so both sides agree on one format. Pure — no I/O.
 */

import {
  buildImageMarkdown,
  parseImageMeta,
  type ImageFloat,
  type ImageSize,
} from './image-meta'

export type GalleryLayout = 'mosaic' | 'grid' | 'carousel'

export const GALLERY_LAYOUTS: readonly GalleryLayout[] = ['mosaic', 'grid', 'carousel']

export interface GalleryImage {
  src: string
  alt: string
  caption: string
}

export interface GalleryBlock {
  layout: GalleryLayout
  caption: string
  images: GalleryImage[]
}

export interface EmbedBlock {
  url: string
  caption: string
}

export function normalizeGalleryLayout(value: unknown): GalleryLayout {
  return (GALLERY_LAYOUTS as readonly unknown[]).includes(value) ? (value as GalleryLayout) : 'mosaic'
}

// ── Labels: `[...]`, parsed as inline Markdown by the directive parser ──────

const LABEL_ESCAPES = /[\\[\]*_`<>]/g

/** Escape a plain-text label so the directive parser reads it back literally. */
export function escapeLabel(text: string): string {
  return text.replace(/[\r\n]+/g, ' ').trim().replace(LABEL_ESCAPES, (c) => `\\${c}`)
}

export function unescapeLabel(text: string): string {
  return text.replace(/\\([\\[\]*_`<>!#&()+.{}|~-])/g, '$1')
}

// ── Attributes: `{key="value"}` ──────────────────────────────────────────────

/** Encode an attribute value; the directive parser decodes character references. */
export function encodeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/[\r\n]+/g, ' ')
}

export function decodeAttr(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
}

/** Parse `key="v" key2='v' key3=v` (the subset of directive attributes we emit). */
export function parseAttributes(source: string): Record<string, string> {
  const attrs: Record<string, string> = {}
  const re = /([A-Za-z_][\w-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`}]+))/g
  let m: RegExpExecArray | null
  while ((m = re.exec(source)) !== null) {
    attrs[m[1]] = decodeAttr(m[2] ?? m[3] ?? m[4] ?? '')
  }
  return attrs
}

// ── Block headers: `[label]{attrs}` after the directive name ─────────────────

/**
 * Parse what follows `::embed` / `:::gallery` on its line: an optional
 * `[label]` (backslash escapes allowed), an optional `{attrs}`, then only
 * whitespace. Returns null for anything else so it stays ordinary text.
 */
export function parseDirectiveHeader(rest: string): { label: string; attrs: string } | null {
  let i = 0
  let label = ''
  if (rest[i] === '[') {
    i++
    while (i < rest.length && rest[i] !== ']') {
      if (rest[i] === '\\' && i + 1 < rest.length) {
        label += rest.slice(i, i + 2)
        i += 2
      } else {
        label += rest[i]
        i++
      }
    }
    if (rest[i] !== ']') return null
    i++
  }
  let attrs = ''
  if (rest[i] === '{') {
    const end = rest.indexOf('}', i)
    if (end < 0) return null
    attrs = rest.slice(i + 1, end)
    i = end + 1
  }
  if (rest.slice(i).trim() !== '') return null
  return { label, attrs }
}

/** Split `src "title"` (the inside of `![alt](…)`) without a backtracking regex. */
function splitImageTarget(inner: string): { src: string; title: string } | null {
  const trimmed = inner.trim()
  const gap = trimmed.search(/\s/)
  let src = gap < 0 ? trimmed : trimmed.slice(0, gap)
  const rest = gap < 0 ? '' : trimmed.slice(gap).trim()
  if (src.startsWith('<') && src.endsWith('>')) src = src.slice(1, -1)
  if (!src) return null
  if (!rest) return { src, title: '' }
  if (rest.length >= 2 && rest.startsWith('"') && rest.endsWith('"')) {
    return { src, title: rest.slice(1, -1).replace(/\\"/g, '"') }
  }
  return null
}

const IMAGE_RE = /!\[((?:\\.|[^\]\\])*)\]\(([^()]*)\)/g

interface ParsedImage {
  src: string
  alt: string
  title: string
}

function scanImages(source: string): { images: ParsedImage[]; rest: string } {
  const images: ParsedImage[] = []
  const rest = source.replace(IMAGE_RE, (all: string, alt: string, inner: string) => {
    const target = splitImageTarget(inner)
    if (!target) return all
    images.push({ src: target.src, alt: unescapeLabel(alt), title: target.title })
    return ''
  })
  return { images, rest }
}

/**
 * Parse a gallery block at the start of `src`. Returns null unless the body
 * holds images only — anything else is left to the regular Markdown parser
 * so the editor never silently drops content it cannot represent.
 */
export function parseGalleryBlock(src: string): (GalleryBlock & { raw: string }) | null {
  if (!src.startsWith(':::gallery')) return null
  const headerEnd = src.indexOf('\n')
  if (headerEnd < 0) return null
  const header = parseDirectiveHeader(src.slice(':::gallery'.length, headerEnd))
  if (!header) return null
  const close = /\n:::[ \t]*(?:\n|$)/.exec(src.slice(headerEnd))
  if (!close) return null
  const body = src.slice(headerEnd + 1, headerEnd + close.index)
  const { images, rest } = scanImages(body)
  if (images.length === 0 || rest.trim() !== '') return null
  const attrs = parseAttributes(header.attrs)
  return {
    raw: src.slice(0, headerEnd + close.index + close[0].length),
    layout: normalizeGalleryLayout(attrs.layout),
    caption: unescapeLabel(header.label),
    images: images.map((img) => ({
      src: img.src,
      alt: img.alt,
      caption: parseImageMeta(img.title).caption,
    })),
  }
}

export function serializeGallery(block: Partial<GalleryBlock>): string {
  const images = (block.images ?? []).filter((img) => img && img.src)
  const label = block.caption?.trim() ? `[${escapeLabel(block.caption)}]` : ''
  const layout = normalizeGalleryLayout(block.layout)
  const lines = images.map((img) => buildImageMarkdown({ src: img.src, alt: img.alt, caption: img.caption }))
  return [`:::gallery${label}{layout="${layout}"}`, ...lines, ':::'].join('\n')
}

export function parseEmbedBlock(src: string): (EmbedBlock & { raw: string }) | null {
  if (!src.startsWith('::embed')) return null
  const lineEnd = src.indexOf('\n')
  const line = lineEnd < 0 ? src : src.slice(0, lineEnd)
  const header = parseDirectiveHeader(line.slice('::embed'.length))
  if (!header) return null
  const attrs = parseAttributes(header.attrs)
  if (!attrs.url) return null
  return {
    raw: lineEnd < 0 ? src : src.slice(0, lineEnd + 1),
    url: attrs.url,
    caption: unescapeLabel(header.label),
  }
}

export function serializeEmbed(block: Partial<EmbedBlock>): string {
  const label = block.caption?.trim() ? `[${escapeLabel(block.caption)}]` : ''
  return `::embed${label}{url="${encodeAttr((block.url ?? '').trim())}"}`
}

// ── Content-wide image inventory (feeds the blog_images bookkeeping table) ──

export interface ContentImage {
  url: string
  alt: string
  caption: string
  size: ImageSize
  float: ImageFloat
}

/** Every image referenced in the article body, standalone or in a gallery, in order. */
export function extractContentImages(markdown: string): ContentImage[] {
  if (!markdown) return []
  const seen = new Set<string>()
  const out: ContentImage[] = []
  for (const img of scanImages(markdown).images) {
    if (seen.has(img.src)) continue
    seen.add(img.src)
    const meta = parseImageMeta(img.title)
    out.push({ url: img.src, alt: img.alt, caption: meta.caption, size: meta.size, float: meta.float })
  }
  return out
}
