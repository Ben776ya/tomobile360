/**
 * The Markdown → HAST pipeline the public article renderer uses, exposed
 * headlessly so tests and scripts/check-article-editor-compat.ts can compare
 * documents exactly as the site sees them (MarkdownRenderer wires the same
 * plugins into react-markdown).
 */

import { unified, type PluggableList } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import { remarkArticleBlocks } from './remark-article-blocks'
import { remarkBlockDirectives } from './remark-block-directives'

/** remark plugins for article bodies, in order. */
export const articleRemarkPlugins: PluggableList = [remarkGfm, remarkBlockDirectives, remarkArticleBlocks]

/** remark plugins of the renderer before article blocks existed (regression baseline). */
export const legacyRemarkPlugins: PluggableList = [remarkGfm]

/**
 * Serialize the HAST of `markdown` to a stable JSON string: positions dropped,
 * whitespace-only text nodes between blocks removed.
 */
export function markdownToHastJson(markdown: string, plugins: PluggableList = articleRemarkPlugins): string {
  const processor = unified().use(remarkParse).use(plugins).use(remarkRehype)
  const tree = processor.runSync(processor.parse(markdown), markdown)
  return JSON.stringify(stripNoise(tree))
}

interface HastLike {
  type: string
  value?: string
  children?: HastLike[]
  position?: unknown
  [key: string]: unknown
}

function stripNoise(node: unknown): unknown {
  const n = node as HastLike
  const { position: _position, children, ...rest } = n
  if (!children) return rest
  return {
    ...rest,
    children: children
      .filter((c) => !(c.type === 'text' && typeof c.value === 'string' && /^\n+$/.test(c.value)))
      .map(stripNoise),
  }
}
