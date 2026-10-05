import { Extension, type AnyExtension } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { Markdown } from '@tiptap/markdown'
import { CharacterCount, Placeholder } from '@tiptap/extensions'
import {
  ArticleEmbed,
  ArticleGallery,
  ArticleImage,
  articleSchemaExtensions,
  type GalleryUploadFn,
} from '@/lib/editor/article-extensions'
import { GalleryNodeView } from './nodeviews/GalleryNodeView'
import { EmbedNodeView } from './nodeviews/EmbedNodeView'
import { ImageNodeView } from './nodeviews/ImageNodeView'

/**
 * Which events a block node view keeps for itself. Everything except drag &
 * drop stays inside the block (its inputs and buttons must not reach
 * ProseMirror); drops fall through to the editor — which uploads dropped files
 * at that spot — unless they land in the block's own drop zone.
 */
function blockStopEvent(dropZoneSelector?: string) {
  return ({ event }: { event: Event }) => {
    const isDragOrDrop = event.type === 'drop' || event.type.startsWith('drag')
    if (!isDragOrDrop) return true
    if (!dropZoneSelector) return false
    const target = event.target as HTMLElement | null
    return !!target?.closest?.(dropZoneSelector)
  }
}

const ShortcutKeys = Extension.create<{ onLink: (() => void) | null }>({
  name: 'articleShortcutKeys',
  addOptions() {
    return { onLink: null }
  },
  addKeyboardShortcuts() {
    return {
      'Mod-k': () => {
        this.options.onLink?.()
        return true
      },
    }
  },
})

export function articleEditorExtensions({
  upload,
  onLinkShortcut,
  placeholder,
}: {
  upload: GalleryUploadFn
  onLinkShortcut: () => void
  placeholder: string
}): AnyExtension[] {
  return [
    ...articleSchemaExtensions({
      image: ArticleImage.extend({
        addNodeView() {
          return ReactNodeViewRenderer(ImageNodeView, { stopEvent: blockStopEvent() })
        },
      }),
      gallery: ArticleGallery.extend({
        addNodeView() {
          return ReactNodeViewRenderer(GalleryNodeView, {
            stopEvent: blockStopEvent('[data-gallery-dropzone]'),
          })
        },
      }).configure({ upload }),
      embed: ArticleEmbed.extend({
        addNodeView() {
          return ReactNodeViewRenderer(EmbedNodeView, { stopEvent: blockStopEvent() })
        },
      }),
    }),
    Markdown,
    Placeholder.configure({ placeholder }),
    CharacterCount,
    ShortcutKeys.configure({ onLink: onLinkShortcut }),
  ]
}
