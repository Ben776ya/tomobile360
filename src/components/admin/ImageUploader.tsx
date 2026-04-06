'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Upload, X, Copy, Check, Loader2, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

interface ImageUploaderProps {
  /** Current image URL (for hero image replacement) */
  currentUrl?: string
  /** Called with the public URL after successful upload */
  onUpload: (url: string) => void
  /** Show copy-markdown button for inline images */
  showMarkdownCopy?: boolean
  /** Label above the dropzone */
  label?: string
}

export function ImageUploader({
  currentUrl,
  onUpload,
  showMarkdownCopy = false,
  label = 'Image',
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(currentUrl || '')
  const [copied, setCopied] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const upload = useCallback(
    async (file: File) => {
      setError('')

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError('Format non supporté. Utilisez JPG, PNG ou WebP.')
        return
      }
      if (file.size > MAX_FILE_SIZE) {
        setError('Fichier trop volumineux (max 5 Mo).')
        return
      }

      setUploading(true)

      try {
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch('/api/admin/blog/upload-image', {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.error || 'Échec du téléchargement')
        }

        const { url } = await res.json()
        setPreview(url)
        onUpload(url)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
      } finally {
        setUploading(false)
      }
    },
    [onUpload],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) upload(file)
    },
    [upload],
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) upload(file)
    },
    [upload],
  )

  const copyMarkdown = () => {
    if (!preview) return
    navigator.clipboard.writeText(`![image](${preview})`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const clear = () => {
    setPreview('')
    setError('')
    onUpload('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      <p className="text-sm font-medium text-dark-100 mb-2">{label}</p>

      {preview ? (
        <div className="relative rounded-lg border border-white/10 overflow-hidden bg-dark-600/30">
          <div className="relative w-full aspect-video">
            <Image
              src={preview}
              alt="Aperçu"
              fill
              className="object-cover"
              sizes="400px"
            />
          </div>
          <div className="flex items-center gap-2 p-3">
            {showMarkdownCopy && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copyMarkdown}
                className="border-white/10 text-dark-200 hover:text-white hover:bg-dark-600/50"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 mr-1" />
                ) : (
                  <Copy className="h-3.5 w-3.5 mr-1" />
                )}
                {copied ? 'Copié !' : 'Copier Markdown'}
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clear}
              className="ml-auto border-white/10 text-dark-200 hover:text-white hover:bg-dark-600/50"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Supprimer
            </Button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-all duration-200 ${
            dragOver
              ? 'border-secondary bg-secondary/5'
              : 'border-white/10 hover:border-white/20 bg-dark-600/30'
          }`}
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 mx-auto animate-spin text-secondary mb-2" />
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-dark-500/50 flex items-center justify-center">
                {dragOver ? (
                  <ImageIcon className="h-6 w-6 text-secondary" />
                ) : (
                  <Upload className="h-6 w-6 text-dark-300" />
                )}
              </div>
              <p className="text-sm text-dark-200">
                Glissez-déposez ou{' '}
                <span className="text-secondary font-medium">parcourez</span>
              </p>
              <p className="text-xs text-dark-400">
                JPG, PNG ou WebP &middot; 5 Mo max
              </p>
            </div>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <p className="text-xs text-red-400 mt-2">{error}</p>
      )}
    </div>
  )
}
