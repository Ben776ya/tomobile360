'use client'

import { useCallback, useRef, useState } from 'react'
import Image from 'next/image'
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react'
import {
  ArrowLeft,
  ArrowRight,
  GalleryHorizontal,
  ImagePlus,
  Images,
  LayoutDashboard,
  LayoutGrid,
  Loader2,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { normalizeGalleryLayout, type GalleryImage, type GalleryLayout } from '@/lib/blog/article-blocks'
import { BlockFrame, moveBlock } from './BlockFrame'
import type { GalleryOptions } from '@/lib/editor/article-extensions'
import { IMAGE_ACCEPT_ATTR, type UploadProgress } from '../upload'

const LAYOUTS: Array<{ value: GalleryLayout; label: string; hint: string; icon: typeof LayoutGrid }> = [
  { value: 'mosaic', label: 'Mosaïque', hint: 'Collage magazine : une grande photo et des vignettes', icon: LayoutDashboard },
  { value: 'grid', label: 'Grille', hint: 'Toutes les photos en vignettes égales', icon: LayoutGrid },
  { value: 'carousel', label: 'Carrousel', hint: 'Diaporama à faire défiler, légende sous chaque photo', icon: GalleryHorizontal },
]

const inputClass =
  'w-full rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-primary placeholder:text-gray-400 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/40'

export function GalleryNodeView({ node, updateAttributes, deleteNode, editor, getPos, extension }: NodeViewProps) {
  const images: GalleryImage[] = Array.isArray(node.attrs.images) ? node.attrs.images : []
  const layout = normalizeGalleryLayout(node.attrs.layout)
  const caption: string = node.attrs.caption ?? ''
  const upload = (extension.options as GalleryOptions).upload

  const fileRef = useRef<HTMLInputElement>(null)
  const [progress, setProgress] = useState<UploadProgress | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const setImages = useCallback(
    (next: GalleryImage[]) => {
      if (next.length === 0) deleteNode()
      else updateAttributes({ images: next })
    },
    [deleteNode, updateAttributes],
  )

  const updateImage = (index: number, patch: Partial<GalleryImage>) =>
    setImages(images.map((img, i) => (i === index ? { ...img, ...patch } : img)))

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= images.length || from === to) return
    const next = [...images]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    setImages(next)
  }

  const addFiles = async (files: File[]) => {
    if (!upload || files.length === 0) return
    setErrors([])
    const result = await upload(files, setProgress)
    setProgress(null)
    setErrors(result.errors)
    if (result.urls.length > 0) {
      // Re-read the node: other edits may have happened during the upload.
      const pos = getPos()
      const current = typeof pos === 'number' ? editor.state.doc.nodeAt(pos) : null
      const base: GalleryImage[] = Array.isArray(current?.attrs.images) ? current!.attrs.images : images
      updateAttributes({ images: [...base, ...result.urls.map((src) => ({ src, alt: '', caption: '' }))] })
    }
  }

  return (
    <NodeViewWrapper data-type="gallery">
      <BlockFrame
        icon={<Images className="h-3.5 w-3.5" />}
        title="Galerie"
        badge={
          <span className="rounded-full bg-gray-200/70 px-2 py-0.5 text-[11px] font-medium text-gray-600">
            {images.length} photo{images.length > 1 ? 's' : ''}
          </span>
        }
        actions={
          <div className="flex items-center rounded-lg border border-gray-200 bg-white p-0.5" role="radiogroup" aria-label="Mise en page">
            {LAYOUTS.map(({ value, label, hint, icon: Icon }) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={layout === value}
                title={hint}
                onClick={() => updateAttributes({ layout: value })}
                className={cn(
                  'flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition',
                  layout === value ? 'bg-secondary text-white shadow-sm' : 'text-gray-500 hover:text-primary',
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        }
        onMoveUp={() => moveBlock(editor, getPos(), -1)}
        onMoveDown={() => moveBlock(editor, getPos(), 1)}
        onDelete={deleteNode}
      >
        <div
          data-gallery-dropzone
          className={cn('relative p-3 transition-colors', dragOver && 'bg-secondary/5')}
          onDragOver={(e) => {
            if (Array.from(e.dataTransfer.types).includes('Files')) {
              e.preventDefault()
              setDragOver(true)
            }
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            setDragOver(false)
            const files = Array.from(e.dataTransfer.files)
            if (files.length > 0) {
              e.preventDefault()
              void addFiles(files)
            }
          }}
        >
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {images.map((img, i) => (
              <li
                key={`${img.src}-${i}`}
                draggable
                onDragStart={(e) => {
                  setDragIndex(i)
                  e.dataTransfer.effectAllowed = 'move'
                  e.dataTransfer.setData('text/x-gallery-index', String(i))
                }}
                onDragOver={(e) => {
                  if (dragIndex !== null) e.preventDefault()
                }}
                onDrop={(e) => {
                  if (dragIndex === null) return
                  e.preventDefault()
                  e.stopPropagation()
                  moveImage(dragIndex, i)
                  setDragIndex(null)
                }}
                onDragEnd={() => setDragIndex(null)}
                className={cn(
                  'group rounded-lg border border-gray-200 bg-white p-1.5 transition',
                  dragIndex === i && 'opacity-40',
                )}
              >
                <div className="relative aspect-[4/3] cursor-grab overflow-hidden rounded-md bg-gray-100 active:cursor-grabbing">
                  <Image src={img.src} alt={img.alt || `Photo ${i + 1}`} fill sizes="200px" className="object-cover" draggable={false} />
                  {i === 0 && layout === 'mosaic' && (
                    <span className="absolute left-1.5 top-1.5 rounded bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      Photo principale
                    </span>
                  )}
                  <div className="absolute inset-x-1.5 bottom-1.5 flex items-center justify-between opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => moveImage(i, i - 1)}
                        disabled={i === 0}
                        aria-label={`Déplacer la photo ${i + 1} vers la gauche`}
                        className="flex h-6 w-6 items-center justify-center rounded bg-white/90 text-primary shadow disabled:opacity-40"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveImage(i, i + 1)}
                        disabled={i === images.length - 1}
                        aria-label={`Déplacer la photo ${i + 1} vers la droite`}
                        className="flex h-6 w-6 items-center justify-center rounded bg-white/90 text-primary shadow disabled:opacity-40"
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, j) => j !== i))}
                      aria-label={`Retirer la photo ${i + 1}`}
                      className="flex h-6 w-6 items-center justify-center rounded bg-white/90 text-red-600 shadow"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="mt-1.5 space-y-1">
                  <input
                    value={img.caption}
                    onChange={(e) => updateImage(i, { caption: e.target.value })}
                    placeholder="Légende"
                    aria-label={`Légende de la photo ${i + 1}`}
                    className={inputClass}
                  />
                  <input
                    value={img.alt}
                    onChange={(e) => updateImage(i, { alt: e.target.value })}
                    placeholder="Texte alternatif (SEO)"
                    aria-label={`Texte alternatif de la photo ${i + 1}`}
                    className={cn(inputClass, 'text-[11px] text-gray-500')}
                  />
                </div>
              </li>
            ))}

            <li>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={!upload || progress !== null}
                className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-200 text-xs text-gray-500 transition hover:border-secondary hover:text-secondary disabled:cursor-wait"
              >
                {progress ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {progress.done}/{progress.total}
                  </>
                ) : (
                  <>
                    <ImagePlus className="h-5 w-5" />
                    Ajouter des photos
                  </>
                )}
              </button>
            </li>
          </ul>

          <input
            ref={fileRef}
            type="file"
            accept={IMAGE_ACCEPT_ATTR}
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? [])
              e.target.value = ''
              void addFiles(files)
            }}
          />

          {errors.length > 0 && (
            <ul className="mt-2 space-y-0.5 text-xs text-red-600">
              {errors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          )}

          <input
            value={caption}
            onChange={(e) => updateAttributes({ caption: e.target.value })}
            placeholder="Légende de la galerie (optionnel)"
            aria-label="Légende de la galerie"
            className={cn(inputClass, 'mt-3 py-1.5 text-sm italic')}
          />
          <p className="mt-1.5 text-[11px] text-gray-400">
            Glissez des images ici pour les ajouter · glissez les vignettes pour les réordonner.
          </p>
        </div>
      </BlockFrame>
    </NodeViewWrapper>
  )
}
