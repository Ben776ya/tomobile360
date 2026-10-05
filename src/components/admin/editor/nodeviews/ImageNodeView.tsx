'use client'

import Image from 'next/image'
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react'
import { AlignCenter, AlignLeft, AlignRight, ArrowDown, ArrowUp, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ImageFloat, ImageSize } from '@/lib/blog/image-meta'
import { BlockToolbarButton, moveBlock } from './BlockFrame'

const SIZES: Array<{ value: ImageSize; label: string }> = [
  { value: 'small', label: 'S' },
  { value: 'medium', label: 'M' },
  { value: 'large', label: 'L' },
  { value: 'full', label: 'Pleine largeur' },
]

const FLOATS: Array<{ value: ImageFloat; label: string; icon: typeof AlignLeft }> = [
  { value: 'left', label: 'Aligner à gauche (texte autour)', icon: AlignLeft },
  { value: 'none', label: 'Centrer', icon: AlignCenter },
  { value: 'right', label: 'Aligner à droite (texte autour)', icon: AlignRight },
]

// Mirrors the public renderer (src/components/blog/MarkdownRenderer.tsx).
const SIZE_CLASSES: Record<ImageSize, string> = {
  small: 'max-w-[200px]',
  medium: 'max-w-[340px]',
  large: 'max-w-[500px]',
  full: 'w-full',
}

const inputClass =
  'w-full rounded-md border border-transparent bg-transparent px-1.5 py-1 text-center text-xs text-gray-500 placeholder:text-gray-300 hover:border-gray-200 focus:border-secondary focus:bg-white focus:outline-none'

export function ImageNodeView({ node, updateAttributes, deleteNode, editor, getPos }: NodeViewProps) {
  const size: ImageSize = node.attrs.size || 'full'
  const float: ImageFloat = node.attrs.float || 'none'
  const src: string = node.attrs.src
  const alt: string = node.attrs.alt || ''
  const caption: string = node.attrs.caption || ''

  return (
    <NodeViewWrapper
      data-type="image"
      className={cn(
        'group relative my-6 block',
        SIZE_CLASSES[size],
        float === 'left' && 'clear-both sm:float-left sm:mr-5 sm:mb-4 sm:mt-1',
        float === 'right' && 'clear-both sm:float-right sm:ml-5 sm:mb-4 sm:mt-1',
        float === 'none' && size !== 'full' && 'mx-auto',
      )}
    >
      <div contentEditable={false}>
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-100 ring-secondary/60 transition group-focus-within:ring-2 group-hover:ring-2">
          {src && <Image src={src} alt={alt} fill sizes="(max-width: 768px) 100vw, 680px" className="object-cover" draggable={false} />}

          <div className="absolute inset-x-2 top-2 flex flex-wrap items-center gap-1 rounded-lg bg-white/95 p-1 opacity-0 shadow-md transition group-focus-within:opacity-100 group-hover:opacity-100">
            <div className="flex items-center rounded-md border border-gray-200" role="radiogroup" aria-label="Taille">
              {SIZES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  role="radio"
                  aria-checked={size === s.value}
                  onClick={() => updateAttributes({ size: s.value })}
                  title={s.value === 'full' ? 'Pleine largeur' : `Taille ${s.label}`}
                  className={cn(
                    'px-1.5 py-0.5 text-[11px] font-semibold transition',
                    size === s.value ? 'bg-secondary text-white' : 'text-gray-500 hover:text-primary',
                  )}
                >
                  {s.value === 'full' ? '100%' : s.label}
                </button>
              ))}
            </div>
            <div className="flex items-center rounded-md border border-gray-200" role="radiogroup" aria-label="Position">
              {FLOATS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={float === value}
                  aria-label={label}
                  title={label}
                  onClick={() => updateAttributes({ float: value })}
                  className={cn(
                    'px-1.5 py-1 transition',
                    float === value ? 'bg-secondary text-white' : 'text-gray-500 hover:text-primary',
                  )}
                >
                  <Icon className="h-3 w-3" />
                </button>
              ))}
            </div>
            <div className="ml-auto flex items-center">
              <BlockToolbarButton onClick={() => moveBlock(editor, getPos(), -1)} label="Monter l’image">
                <ArrowUp className="h-3.5 w-3.5" />
              </BlockToolbarButton>
              <BlockToolbarButton onClick={() => moveBlock(editor, getPos(), 1)} label="Descendre l’image">
                <ArrowDown className="h-3.5 w-3.5" />
              </BlockToolbarButton>
              <BlockToolbarButton onClick={deleteNode} label="Supprimer l’image" danger>
                <Trash2 className="h-3.5 w-3.5" />
              </BlockToolbarButton>
            </div>
            <input
              value={alt}
              onChange={(e) => updateAttributes({ alt: e.target.value })}
              placeholder="Texte alternatif (description pour Google et l’accessibilité)"
              aria-label="Texte alternatif"
              className="mt-1 w-full rounded border border-gray-200 px-1.5 py-0.5 text-[11px] text-primary placeholder:text-gray-400 focus:border-secondary focus:outline-none"
            />
          </div>
        </div>
        <input
          value={caption}
          onChange={(e) => updateAttributes({ caption: e.target.value })}
          placeholder="Ajouter une légende…"
          aria-label="Légende de l’image"
          className={cn(inputClass, 'mt-1.5 italic')}
        />
      </div>
    </NodeViewWrapper>
  )
}
