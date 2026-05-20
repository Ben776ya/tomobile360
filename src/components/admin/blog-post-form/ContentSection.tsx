'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useController, useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  BlogImageManager,
  buildMarkdown,
  type ManagedImage,
} from '@/components/admin/BlogImageManager'
import { MarkdownRenderer } from '@/components/blog/MarkdownRenderer'
import { parseMarkdownFile } from '@/lib/parseMarkdownFile'
import { Edit, Eye, FileUp, MousePointerClick } from 'lucide-react'
import type { BlogPostFormValues } from './types'
import { slugify } from './form-helpers'

interface ContentSectionProps {
  mode: 'create' | 'edit'
}

export function ContentSection({ mode }: ContentSectionProps) {
  const { control, getValues, setValue } = useFormContext<BlogPostFormValues>()
  const mdFileRef = useRef<HTMLInputElement>(null)
  const contentRef = useRef<HTMLTextAreaElement>(null)

  // Content textarea — bound through useController so its value reflects
  // form state (needed because the .md-import path imperatively rewrites it).
  const {
    field: { value: content, onChange: setContent },
  } = useController({ control, name: 'content' })

  // Inline images — managed list, also in form state for submit.
  const {
    field: { value: inlineImages, onChange: setInlineImages },
  } = useController({ control, name: 'inline_images' })

  // Transient UI: preview toggle + click-to-place mode (not submitted).
  const [previewMode, setPreviewMode] = useState(false)
  const [activeInsertId, setActiveInsertId] = useState<string | null>(null)

  // Escape key cancels placement mode.
  useEffect(() => {
    if (!activeInsertId) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveInsertId(null)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [activeInsertId])

  const handleMdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      if (!text) return

      const parsed = parseMarkdownFile(text)
      setContent(parsed.content)

      // Auto-fill metadata from frontmatter
      const m = parsed.metadata
      if (m.title) {
        setValue('title', m.title)
        if (mode === 'create') {
          setValue('slug', m.slug || slugify(m.title))
        }
      }
      if (m.slug && mode === 'create') setValue('slug', m.slug)
      if (m.subtitle) setValue('subtitle', m.subtitle)
      if (m.meta_description) setValue('meta_description', m.meta_description)
      if (m.category) setValue('category', m.category)
      if (m.tags && m.tags.length > 0) setValue('tags', m.tags)
      if (m.author) setValue('author', m.author)
    }
    reader.readAsText(file)
  }

  const handleInsertImage = useCallback(
    (markdown: string) => {
      // Read freshest content at write time.
      const currentContent = getValues('content') ?? ''
      const ta = contentRef.current
      if (ta) {
        const start = ta.selectionStart ?? currentContent.length
        const before = currentContent.slice(0, start)
        const after = currentContent.slice(start)
        setContent(before + markdown + after)
        requestAnimationFrame(() => {
          ta.focus()
          const pos = start + markdown.length
          ta.setSelectionRange(pos, pos)
        })
      } else {
        setContent(currentContent + markdown)
      }
    },
    [getValues, setContent],
  )

  const handleRemoveImage = useCallback(
    (image: ManagedImage) => {
      const escapedUrl = image.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const pattern = new RegExp(
        `\\n?!\\[[^\\]]*\\]\\(${escapedUrl}[^)]*\\)\\n?`,
        'g',
      )
      const currentContent = getValues('content') ?? ''
      setContent(currentContent.replace(pattern, '\n').replace(/\n{3,}/g, '\n\n'))
    },
    [getValues, setContent],
  )

  // Click-to-place: when an image is in placement mode and user clicks textarea.
  const handleTextareaClick = useCallback(
    (e: React.MouseEvent<HTMLTextAreaElement>) => {
      if (!activeInsertId) return
      const currentImages = getValues('inline_images') ?? []
      const image = currentImages.find((img) => img.id === activeInsertId)
      if (!image) return

      const ta = e.currentTarget
      requestAnimationFrame(() => {
        const currentContent = getValues('content') ?? ''
        const pos = ta.selectionStart ?? currentContent.length
        const markdown = `\n${buildMarkdown(image)}\n`
        const before = currentContent.slice(0, pos)
        const after = currentContent.slice(pos)
        setContent(before + markdown + after)
        setActiveInsertId(null)

        requestAnimationFrame(() => {
          ta.focus()
          const newPos = pos + markdown.length
          ta.setSelectionRange(newPos, newPos)
        })
      })
    },
    [activeInsertId, getValues, setContent],
  )

  return (
    <div className="bg-dark-700 rounded-lg shadow-dark-card border border-white/10 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          Contenu (Markdown) *
        </h3>
        <div className="flex items-center gap-2">
          {/* .md file import */}
          <label className="cursor-pointer">
            <input
              ref={mdFileRef}
              type="file"
              accept=".md,.markdown,.txt"
              onChange={handleMdUpload}
              className="hidden"
            />
            <span className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-white/10 bg-dark-700/80 text-sm text-dark-100 hover:bg-dark-600/50 transition cursor-pointer">
              <FileUp className="h-4 w-4" />
              Importer .md
            </span>
          </label>
          {/* Preview toggle */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
            className="border-white/10 text-dark-200 hover:text-white hover:bg-dark-600/50"
          >
            {previewMode ? (
              <Edit className="h-4 w-4 mr-1" />
            ) : (
              <Eye className="h-4 w-4 mr-1" />
            )}
            {previewMode ? 'Éditer' : 'Aperçu'}
          </Button>
        </div>
      </div>

      {previewMode ? (
        <div className="border border-white/10 rounded-lg p-6 min-h-[400px] bg-white">
          {content ? (
            <MarkdownRenderer content={content} />
          ) : (
            <p className="text-gray-400 italic">Aucun contenu à afficher</p>
          )}
        </div>
      ) : (
        <div>
          {activeInsertId && (
            <div className="mb-3 flex items-center gap-2 rounded-lg bg-secondary/10 border border-secondary/30 px-4 py-2.5 text-sm text-secondary animate-pulse">
              <MousePointerClick className="h-4 w-4 flex-shrink-0" />
              <span>Cliquez dans l&apos;editeur pour placer l&apos;image</span>
              <button
                type="button"
                onClick={() => setActiveInsertId(null)}
                className="ml-auto text-xs text-secondary/60 hover:text-secondary underline"
              >
                Annuler
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <p className="text-xs text-dark-400 mb-2">Editeur Markdown</p>
              <textarea
                ref={contentRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onClick={handleTextareaClick}
                placeholder="Ecrivez votre article en Markdown..."
                className={cn(
                  'flex-1 w-full rounded-md border bg-dark-700/80 px-4 py-3 text-sm font-mono text-white placeholder-dark-400 min-h-[400px] resize-y focus-visible:outline-none focus-visible:ring-2',
                  activeInsertId
                    ? 'cursor-crosshair border-secondary/50 focus-visible:ring-secondary/70 bg-dark-700/90'
                    : 'border-white/10 focus-visible:ring-secondary/50',
                )}
              />
            </div>
            <div className="flex flex-col">
              <p className="text-xs text-dark-400 mb-2">Apercu en direct</p>
              <div className="flex-1 rounded-lg border border-white/10 bg-white p-4 min-h-[400px] max-h-[700px] overflow-y-auto">
                {content ? (
                  <MarkdownRenderer content={content} />
                ) : (
                  <p className="text-gray-400 italic text-sm">
                    L&apos;apercu apparaitra ici...
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {!previewMode && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <BlogImageManager
            images={inlineImages}
            onChange={setInlineImages}
            onInsert={handleInsertImage}
            onRemove={handleRemoveImage}
            activeInsertId={activeInsertId}
            onActivateInsert={setActiveInsertId}
          />
        </div>
      )}
    </div>
  )
}
