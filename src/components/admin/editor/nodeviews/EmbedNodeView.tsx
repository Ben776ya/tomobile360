'use client'

import { useEffect, useState } from 'react'
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react'
import { AlertTriangle, CheckCircle2, MonitorPlay } from 'lucide-react'
import { cn } from '@/lib/utils'
import { describeEmbedProblem, parseEmbedUrl } from '@/lib/blog/embeds'
import { ArticleEmbed } from '@/components/blog/ArticleEmbed'
import { BlockFrame, moveBlock } from './BlockFrame'

const inputClass =
  'w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-primary placeholder:text-gray-400 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/40'

export function EmbedNodeView({ node, updateAttributes, deleteNode, editor, getPos }: NodeViewProps) {
  const url: string = node.attrs.url ?? ''
  const caption: string = node.attrs.caption ?? ''
  // The URL is committed on blur / Enter so the preview does not reload on every keystroke.
  const [draftUrl, setDraftUrl] = useState(url)
  useEffect(() => setDraftUrl(url), [url])

  const info = parseEmbedUrl(url)
  const problem = describeEmbedProblem(url)
  const commit = () => {
    const next = draftUrl.trim()
    if (next !== url) updateAttributes({ url: next })
  }

  return (
    <NodeViewWrapper data-type="embed">
      <BlockFrame
        icon={<MonitorPlay className="h-3.5 w-3.5" />}
        title="Vidéo / média"
        badge={
          info ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
              <CheckCircle2 className="h-3 w-3" />
              {info.label}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
              <AlertTriangle className="h-3 w-3" />
              Lien simple
            </span>
          )
        }
        onMoveUp={() => moveBlock(editor, getPos(), -1)}
        onMoveDown={() => moveBlock(editor, getPos(), 1)}
        onDelete={deleteNode}
      >
        <div className="space-y-3 p-3">
          <div>
            <input
              value={draftUrl}
              onChange={(e) => setDraftUrl(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  commit()
                }
              }}
              placeholder="https://www.youtube.com/watch?v=…"
              aria-label="Adresse de la vidéo ou de la publication"
              className={cn(inputClass, 'font-mono text-xs')}
            />
            {problem && <p className="mt-1.5 text-xs text-amber-700">{problem}</p>}
          </div>

          {url && (
            <div className="rounded-lg bg-gray-50 p-2" onDragStart={(e) => e.preventDefault()}>
              <ArticleEmbed url={url} caption={caption} className="!my-0" />
            </div>
          )}

          <input
            value={caption}
            onChange={(e) => updateAttributes({ caption: e.target.value })}
            placeholder="Légende (optionnel)"
            aria-label="Légende de la vidéo"
            className={cn(inputClass, 'italic')}
          />
        </div>
      </BlockFrame>
    </NodeViewWrapper>
  )
}
