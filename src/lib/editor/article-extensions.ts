/**
 * TipTap schema for the article editor — the Markdown-facing half only (no
 * React). The admin editor adds node views on top via `.extend()`; tests and
 * scripts/check-article-editor-compat.ts use these extensions directly so the
 * Markdown they verify is exactly the Markdown the editor writes.
 */

import { Node, mergeAttributes, type AnyExtension, type JSONContent } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { TableKit } from '@tiptap/extension-table'
import { MarkdownManager } from '@tiptap/markdown'
import {
  buildImageTitle,
  parseImageMeta,
  sanitizeAlt,
  sanitizeMarkdownUrl,
  type ImageMeta,
} from '@/lib/blog/image-meta'
import {
  normalizeGalleryLayout,
  parseEmbedBlock,
  parseGalleryBlock,
  serializeEmbed,
  serializeGallery,
  type GalleryImage,
} from '@/lib/blog/article-blocks'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    articleGallery: {
      insertGallery: (attrs: { images: GalleryImage[]; layout?: string; caption?: string }) => ReturnType
    }
    articleEmbed: {
      insertEmbed: (attrs: { url: string; caption?: string }) => ReturnType
    }
  }
}

function sameMeta(a: ImageMeta, b: ImageMeta): boolean {
  return a.size === b.size && a.float === b.float && a.caption === b.caption
}

/**
 * Block image whose size / float / caption live in the Markdown title
 * (see src/lib/blog/image-meta.ts). The original title string is kept so an
 * untouched image is written back byte-for-byte.
 */
export const ArticleImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      size: {
        default: 'full',
        parseHTML: (el: HTMLElement) => el.getAttribute('data-size') || 'full',
        renderHTML: (attrs: Record<string, unknown>) => ({ 'data-size': attrs.size }),
      },
      float: {
        default: 'none',
        parseHTML: (el: HTMLElement) => el.getAttribute('data-float') || 'none',
        renderHTML: (attrs: Record<string, unknown>) => ({ 'data-float': attrs.float }),
      },
      caption: {
        default: '',
        parseHTML: (el: HTMLElement) => el.getAttribute('data-caption') || '',
        renderHTML: (attrs: Record<string, unknown>) =>
          attrs.caption ? { 'data-caption': attrs.caption } : {},
      },
    }
  },

  parseMarkdown: (token, helpers) => {
    const title = typeof token.title === 'string' ? token.title : ''
    return helpers.createNode('image', {
      src: token.href,
      alt: token.text ?? '',
      title: title || null,
      ...parseImageMeta(title),
    })
  },

  renderMarkdown: (node) => {
    const attrs = (node.attrs ?? {}) as Record<string, string | null | undefined>
    const meta: ImageMeta = {
      size: (attrs.size as ImageMeta['size']) || 'full',
      float: (attrs.float as ImageMeta['float']) || 'none',
      caption: attrs.caption || '',
    }
    const src = attrs.src || ''
    if (!src) return ''
    const original = attrs.title || ''
    // Unchanged metadata → keep the author's original title verbatim.
    const title =
      original && !/["\n]/.test(original) && sameMeta(parseImageMeta(original), meta)
        ? original
        : buildImageTitle(meta)
    const alt = sanitizeAlt(attrs.alt || '')
    const url = sanitizeMarkdownUrl(src)
    return title ? `![${alt}](${url} "${title}")` : `![${alt}](${url})`
  },
}).configure({ inline: false, allowBase64: false })

/** Uploads files and returns their public URLs (wired by the admin editor). */
export type GalleryUploadFn = (
  files: File[],
  onProgress?: (progress: { done: number; total: number }) => void,
) => Promise<{ urls: string[]; errors: string[] }>

export interface GalleryOptions {
  upload: GalleryUploadFn | null
}

/** Multi-image gallery block: `:::gallery[caption]{layout="…"} … :::`. */
export const ArticleGallery = Node.create<GalleryOptions>({
  name: 'gallery',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addOptions() {
    return { upload: null }
  },

  addAttributes() {
    return {
      layout: { default: 'mosaic' },
      caption: { default: '' },
      images: {
        default: [],
        parseHTML: (el: HTMLElement) => {
          try {
            const parsed = JSON.parse(el.getAttribute('data-images') || '[]')
            return Array.isArray(parsed) ? parsed : []
          } catch {
            return []
          }
        },
        renderHTML: (attrs: Record<string, unknown>) => ({
          'data-images': JSON.stringify(attrs.images ?? []),
        }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="gallery"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'gallery' })]
  },

  addCommands() {
    return {
      insertGallery:
        ({ images, layout, caption }) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: { images, layout: normalizeGalleryLayout(layout), caption: caption ?? '' },
          }),
    }
  },

  markdownTokenName: 'gallery',
  markdownTokenizer: {
    name: 'gallery',
    level: 'block',
    start: (src: string) => {
      const m = /^:::gallery\b/m.exec(src)
      return m ? m.index : -1
    },
    tokenize: (src: string) => {
      const block = parseGalleryBlock(src)
      if (!block) return undefined
      return { type: 'gallery', raw: block.raw, layout: block.layout, caption: block.caption, images: block.images }
    },
  },
  parseMarkdown: (token, helpers) =>
    helpers.createNode('gallery', {
      layout: normalizeGalleryLayout(token.layout),
      caption: token.caption ?? '',
      images: Array.isArray(token.images) ? token.images : [],
    }),
  renderMarkdown: (node) => {
    const attrs = (node.attrs ?? {}) as { layout?: string; caption?: string; images?: GalleryImage[] }
    if (!attrs.images || attrs.images.length === 0) return ''
    return serializeGallery({
      layout: normalizeGalleryLayout(attrs.layout),
      caption: attrs.caption ?? '',
      images: attrs.images,
    })
  },
})

/** URL-embedded media block: `::embed[caption]{url="…"}`. */
export const ArticleEmbed = Node.create({
  name: 'embed',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      url: {
        default: '',
        parseHTML: (el: HTMLElement) => el.getAttribute('data-url') || '',
        renderHTML: (attrs: Record<string, unknown>) => ({ 'data-url': attrs.url }),
      },
      caption: {
        default: '',
        parseHTML: (el: HTMLElement) => el.getAttribute('data-caption') || '',
        renderHTML: (attrs: Record<string, unknown>) =>
          attrs.caption ? { 'data-caption': attrs.caption } : {},
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="embed"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'embed' })]
  },

  addCommands() {
    return {
      insertEmbed:
        ({ url, caption }) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: { url: url.trim(), caption: caption ?? '' } }),
    }
  },

  markdownTokenName: 'embed',
  markdownTokenizer: {
    name: 'embed',
    level: 'block',
    start: (src: string) => {
      const m = /^::embed\b/m.exec(src)
      return m ? m.index : -1
    },
    tokenize: (src: string) => {
      const block = parseEmbedBlock(src)
      if (!block) return undefined
      return { type: 'embed', raw: block.raw, url: block.url, caption: block.caption }
    },
  },
  parseMarkdown: (token, helpers) =>
    helpers.createNode('embed', { url: token.url ?? '', caption: token.caption ?? '' }),
  renderMarkdown: (node) => {
    const attrs = (node.attrs ?? {}) as { url?: string; caption?: string }
    if (!attrs.url?.trim()) return ''
    return serializeEmbed({ url: attrs.url, caption: attrs.caption ?? '' })
  },
})

/**
 * Extensions that define the document schema + its Markdown mapping. The
 * editor passes node-view-enabled variants of the three article nodes; the
 * Markdown mapping is inherited unchanged.
 */
export function articleSchemaExtensions(
  nodes: { image?: AnyExtension; gallery?: AnyExtension; embed?: AnyExtension } = {},
): AnyExtension[] {
  return [
    StarterKit.configure({
      // The site renderer has no underline style and sanitizes <u>; keep it out.
      underline: false,
      link: {
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        defaultProtocol: 'https',
      },
    }),
    nodes.image ?? ArticleImage,
    nodes.gallery ?? ArticleGallery,
    nodes.embed ?? ArticleEmbed,
    TableKit.configure({ table: { resizable: false } }),
  ]
}

/**
 * Tidy serializer output for storage: drop the `&nbsp;` placeholders TipTap
 * writes for consecutive empty paragraphs (and the trailing empty paragraph),
 * collapse runs of blank lines.
 */
export function normalizeArticleMarkdown(markdown: string): string {
  return markdown
    .replace(/\r\n?/g, '\n')
    .replace(/^[ \t]*(?:&nbsp;| )[ \t]*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** Headless Markdown ⇄ TipTap JSON converter using the article schema. */
export function createArticleMarkdownManager(): MarkdownManager {
  return new MarkdownManager({ extensions: articleSchemaExtensions() })
}

export function markdownToArticleJson(manager: MarkdownManager, markdown: string): JSONContent {
  return manager.parse(markdown)
}

export function articleJsonToMarkdown(manager: MarkdownManager, json: JSONContent): string {
  return normalizeArticleMarkdown(manager.serialize(json))
}
