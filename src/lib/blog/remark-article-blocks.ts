/**
 * remark plugin (runs after remarkBlockDirectives) that maps the article block
 * directives onto custom elements the renderer knows how to draw:
 *
 *   :::gallery[caption]{layout}  → <tm-gallery layout caption>…images…</tm-gallery>
 *   ::embed[caption]{url}        → <tm-embed url caption>
 *
 * Any other leaf directive is turned back into the literal line it came from
 * and any other container is unwrapped, so a stray "::note" line renders
 * exactly as it did before directives were enabled.
 */

import { normalizeGalleryLayout } from './article-blocks'

interface MdNode {
  type: string
  name?: string
  value?: string
  attributes?: Record<string, string | null | undefined> | null
  children?: MdNode[]
  data?: Record<string, unknown>
  position?: { start?: { offset?: number }; end?: { offset?: number } }
}

function plainText(node: MdNode | MdNode[] | undefined): string {
  if (!node) return ''
  if (Array.isArray(node)) return node.map(plainText).join('')
  if (typeof node.value === 'string') return node.value
  return plainText(node.children)
}

/** The exact source text a node was parsed from (falls back to a rebuild). */
function rawSource(node: MdNode, source: string): string {
  const start = node.position?.start?.offset
  const end = node.position?.end?.offset
  if (typeof start === 'number' && typeof end === 'number' && end > start) {
    return source.slice(start, end)
  }
  const colons = node.type === 'containerDirective' ? ':::' : '::'
  const label = node.children?.length ? `[${plainText(node.children)}]` : ''
  return `${colons}${node.name ?? ''}${label}`
}

function transform(parent: MdNode, source: string): void {
  const children = parent.children
  if (!children) return

  for (let i = 0; i < children.length; i++) {
    const node = children[i]

    if (node.type === 'leafDirective') {
      if (node.name === 'embed') {
        node.data = {
          hName: 'tm-embed',
          hProperties: {
            url: node.attributes?.url ?? '',
            caption: plainText(node.children).trim(),
          },
        }
        node.children = []
      } else {
        children[i] = { type: 'paragraph', children: [{ type: 'text', value: rawSource(node, source) }] }
      }
      continue
    }

    if (node.type === 'containerDirective') {
      if (node.name === 'gallery') {
        const kids = node.children ?? []
        const labelIdx = kids.findIndex((c) => c.data?.directiveLabel === true)
        let caption = ''
        if (labelIdx >= 0) {
          caption = plainText(kids[labelIdx]).trim()
          kids.splice(labelIdx, 1)
        }
        node.data = {
          hName: 'tm-gallery',
          hProperties: {
            layout: normalizeGalleryLayout(node.attributes?.layout),
            caption,
          },
        }
        transform(node, source)
      } else {
        // Unknown container: render its content as ordinary blocks.
        const kids = (node.children ?? []).filter((c) => c.data?.directiveLabel !== true)
        transform({ type: 'root', children: kids }, source)
        children.splice(i, 1, ...kids)
        i += kids.length - 1
      }
      continue
    }

    transform(node, source)
  }
}

export function remarkArticleBlocks() {
  return (tree: unknown, file: { value?: unknown }) => {
    transform(tree as MdNode, String(file?.value ?? ''))
  }
}
