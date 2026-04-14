'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Upload, ImageIcon, Loader2, AlignLeft, AlignRight, AlignCenter, Trash2, MousePointerClick } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type ImageSize = 'small' | 'medium' | 'large' | 'full'
type FloatPosition = 'left' | 'right' | 'none'

export type ManagedImage = {
  id: string
  url: string
  alt: string
  caption: string
  size: ImageSize
  float: FloatPosition
}

interface BlogImageManagerProps {
  images: ManagedImage[]
  onChange: (images: ManagedImage[]) => void
  onInsert: (markdown: string) => void
  onRemove?: (image: ManagedImage) => void
  activeInsertId: string | null
  onActivateInsert: (id: string | null) => void
}

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const SIZE_OPTIONS: { value: ImageSize; label: string }[] = [
  { value: 'small', label: 'Petit' },
  { value: 'medium', label: 'Moyen' },
  { value: 'large', label: 'Grand' },
  { value: 'full', label: 'Pleine largeur' },
]

const FLOAT_OPTIONS: { value: FloatPosition; label: string; icon: React.ReactNode }[] = [
  { value: 'left', label: 'Gauche', icon: <AlignLeft className="h-3.5 w-3.5" /> },
  { value: 'right', label: 'Droite', icon: <AlignRight className="h-3.5 w-3.5" /> },
  { value: 'none', label: 'Centre', icon: <AlignCenter className="h-3.5 w-3.5" /> },
]

export function buildMarkdown(image: ManagedImage): string {
  const safeAlt = (image.alt || 'image').replace(/[\[\]]/g, '')
  const parts: string[] = []
  if (image.size !== 'full') parts.push(`size:${image.size}`)
  if (image.float !== 'none') parts.push(`float:${image.float}`)
  // Caption goes last — parser takes everything after "caption:" to end of string
  if (image.caption.trim()) {
    const safeCaption = image.caption.trim().replace(/"/g, "'")
    parts.push(`caption:${safeCaption}`)
  }

  if (parts.length === 0) {
    return `![${safeAlt}](${image.url})`
  }
  return `![${safeAlt}](${image.url} "${parts.join('|')}")`
}

export function BlogImageManager({ images, onChange, onInsert, onRemove, activeInsertId, onActivateInsert }: BlogImageManagerProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const [uploadCount, setUploadCount] = useState({ done: 0, total: 0 })

  const uploadFiles = useCallback(
    async (files: File[]) => {
      setUploadError('')

      const valid = files.filter((f) => {
        if (!ACCEPTED_TYPES.includes(f.type)) return false
        if (f.size > MAX_FILE_SIZE) return false
        return true
      })

      if (valid.length === 0) {
        setUploadError('Aucun fichier valide. Utilisez JPG, PNG ou WebP (max 5 Mo).')
        return
      }
      if (valid.length < files.length) {
        setUploadError(`${files.length - valid.length} fichier(s) ignore(s) (format ou taille invalide).`)
      }

      setUploading(true)
      setUploadCount({ done: 0, total: valid.length })

      const newImages: ManagedImage[] = []

      for (const file of valid) {
        try {
          const formData = new FormData()
          formData.append('file', file)

          const res = await fetch('/api/admin/blog/upload-image', {
            method: 'POST',
            body: formData,
          })

          if (!res.ok) {
            const body = await res.json().catch(() => ({}))
            throw new Error(body.error || 'Echec du telechargement')
          }

          const { url } = await res.json()
          newImages.push({
            id: crypto.randomUUID(),
            url,
            alt: '',
            caption: '',
            size: 'full',
            float: 'none',
          })
          setUploadCount((prev) => ({ ...prev, done: prev.done + 1 }))
        } catch (err: unknown) {
          setUploadError(err instanceof Error ? err.message : 'Erreur inconnue')
        }
      }

      if (newImages.length > 0) {
        onChange([...images, ...newImages])
      }
      setUploading(false)
      setUploadCount({ done: 0, total: 0 })
    },
    [images, onChange],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) uploadFiles(files)
    },
    [uploadFiles],
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      if (files.length > 0) uploadFiles(files)
      e.target.value = ''
    },
    [uploadFiles],
  )

  const updateImage = (id: string, patch: Partial<ManagedImage>) => {
    onChange(images.map((img) => (img.id === id ? { ...img, ...patch } : img)))
  }

  const removeImage = async (id: string) => {
    const removed = images.find((img) => img.id === id)
    if (!removed) return

    onChange(images.filter((img) => img.id !== id))
    if (onRemove) onRemove(removed)

    // Delete from Supabase storage (fire-and-forget)
    fetch('/api/admin/blog/upload-image', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: removed.url }),
    }).catch(() => {})
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-dark-100 mb-1">Images du contenu</p>
        <p className="text-xs text-dark-400 mb-3">
          Uploadez des images, configurez leur taille et position, puis inserez-les dans le contenu.
        </p>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-all duration-200',
            dragOver
              ? 'border-secondary bg-secondary/5'
              : 'border-white/10 hover:border-white/20 bg-dark-600/30',
          )}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-7 w-7 animate-spin text-secondary" />
              {uploadCount.total > 1 && (
                <p className="text-xs text-secondary">{uploadCount.done}/{uploadCount.total} images</p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-dark-500/50 flex items-center justify-center">
                {dragOver ? (
                  <ImageIcon className="h-5 w-5 text-secondary" />
                ) : (
                  <Upload className="h-5 w-5 text-dark-300" />
                )}
              </div>
              <p className="text-sm text-dark-200">
                Glissez-deposez ou{' '}
                <span className="text-secondary font-medium">parcourez</span>
              </p>
              <p className="text-xs text-dark-400">JPG, PNG ou WebP &middot; 5 Mo max &middot; Plusieurs fichiers possibles</p>
            </div>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        {uploadError && <p className="text-xs text-red-400 mt-2">{uploadError}</p>}
      </div>

      {images.length === 0 ? (
        <p className="text-xs text-dark-400 text-center py-2">
          Aucune image ajoutee. Uploadez une image ci-dessus.
        </p>
      ) : (
        <div className="space-y-3">
          {images.map((image) => {
            const isActive = activeInsertId === image.id
            const anotherIsActive = activeInsertId !== null && activeInsertId !== image.id
            return (
            <div
              key={image.id}
              className={cn(
                'rounded-lg border bg-dark-700/80 overflow-hidden transition-all duration-200',
                isActive
                  ? 'border-secondary shadow-[0_0_12px_rgba(var(--secondary-rgb,59,130,246),0.3)] ring-1 ring-secondary/30'
                  : 'border-white/10',
              )}
            >
              <div className="flex gap-3 p-3">
                <div className="relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden bg-dark-600/50">
                  <Image
                    src={image.url}
                    alt={image.alt || 'Image'}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  <div>
                    <Label className="text-xs text-dark-300 mb-1 block">Texte alternatif</Label>
                    <Input
                      value={image.alt}
                      onChange={(e) => updateImage(image.id, { alt: e.target.value })}
                      placeholder="Description de l'image..."
                      className="h-8 text-xs bg-dark-600/50 border-white/10 text-white placeholder:text-dark-400 focus-visible:ring-secondary/50"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-dark-300 mb-1 block">Legende (optionnel)</Label>
                    <Input
                      value={image.caption}
                      onChange={(e) => updateImage(image.id, { caption: e.target.value })}
                      placeholder="Credit photo, source..."
                      className="h-8 text-xs bg-dark-600/50 border-white/10 text-white placeholder:text-dark-400 focus-visible:ring-secondary/50"
                    />
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <div>
                      <Label className="text-xs text-dark-300 mb-1 block">Taille</Label>
                      <select
                        value={image.size}
                        onChange={(e) => updateImage(image.id, { size: e.target.value as ImageSize })}
                        className="h-8 rounded-md border border-white/10 bg-dark-600/50 px-2 text-xs text-white focus:ring-secondary/50 focus:ring-2 focus:outline-none"
                      >
                        {SIZE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label className="text-xs text-dark-300 mb-1 block">Position</Label>
                      <div className="flex gap-1">
                        {FLOAT_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => updateImage(image.id, { float: opt.value })}
                            title={opt.label}
                            className={cn(
                              'flex items-center gap-1 px-2 h-8 rounded-md border text-xs transition-all duration-150',
                              image.float === opt.value
                                ? 'border-secondary bg-secondary/20 text-secondary'
                                : 'border-white/10 text-dark-300 hover:text-white hover:bg-dark-500/50',
                            )}
                          >
                            {opt.icon}
                            <span>{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 pb-3">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => onActivateInsert(isActive ? null : image.id)}
                  disabled={anotherIsActive}
                  className={cn(
                    'h-8 text-xs transition-all',
                    isActive
                      ? 'bg-secondary text-white hover:bg-secondary/90 animate-pulse'
                      : 'bg-secondary/20 border border-secondary/40 text-secondary hover:bg-secondary/30 hover:border-secondary',
                    anotherIsActive && 'opacity-40 cursor-not-allowed',
                  )}
                >
                  <MousePointerClick className="h-3.5 w-3.5 mr-1.5" />
                  {isActive ? 'Cliquez dans le texte...' : 'Placer dans le texte'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeImage(image.id)}
                  className="h-8 text-xs text-dark-400 hover:text-red-400 hover:bg-red-400/10 ml-auto"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  Supprimer
                </Button>
              </div>
            </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
