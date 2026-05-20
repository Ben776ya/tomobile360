'use client'

import { useState } from 'react'
import { useController, useFormContext } from 'react-hook-form'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Plus, Upload, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { VehicleFormValues } from './types'

interface ImageManagerSectionProps {
  onUploadError?: (message: string) => void
}

export function ImageManagerSection({ onUploadError }: ImageManagerSectionProps) {
  const { control, getValues } = useFormContext<VehicleFormValues>()

  // useFieldArray wants an object array (each entry needs a stable id). We
  // store plain strings in form state, so wrap them through useController +
  // append/remove manually using the controller's `onChange`.
  const {
    field: { value: images, onChange: setImages },
  } = useController({
    control,
    name: 'images',
  })

  // Bind the urlInput as a local state — it's pure UI helper text, not form data.
  const [newImageUrl, setNewImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)

  const addImage = () => {
    if (newImageUrl.trim()) {
      // Read the freshest value at write time to avoid closure-stale state.
      setImages([...(getValues('images') ?? []), newImageUrl.trim()])
      setNewImageUrl('')
    }
  }

  const removeImage = (idx: number) => {
    const current = getValues('images') ?? []
    setImages(current.filter((_, j) => j !== idx))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    const supabase = createClient()

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const filePath = `vehicles/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file)

      if (uploadError) {
        onUploadError?.(`Erreur upload: ${uploadError.message}`)
        continue
      }

      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)

      if (urlData?.publicUrl) {
        // Per-file functional append: always read the freshest array at write
        // time so concurrent uploads / re-renders don't clobber each other.
        setImages([...(getValues('images') ?? []), urlData.publicUrl])
      }
    }

    setUploading(false)
    e.target.value = ''
  }

  return (
    <div className="bg-dark-700 rounded-lg shadow-dark-card border border-white/10 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Images</h3>
      <div className="space-y-3">
        <div>
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
            <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md border border-white/10 bg-dark-700/80 text-sm text-dark-100 hover:bg-dark-600/50 transition cursor-pointer w-full justify-center">
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Upload en cours...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" /> Importer des images
                </>
              )}
            </span>
          </label>
        </div>

        <div className="flex gap-2">
          <Input
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder="Ou coller une URL d'image..."
            className="flex-1 bg-dark-700/80 border-white/10 text-white placeholder-dark-400 focus:ring-secondary/50"
          />
          <Button
            type="button"
            variant="outline"
            onClick={addImage}
            className="border-white/10 text-dark-200 hover:text-white hover:bg-dark-600/50"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {images.length > 0 && (
          <div className="space-y-2">
            {images.map((url, i) => (
              <div key={i} className="flex items-center gap-2 bg-dark-600/50 rounded px-3 py-2">
                <div className="w-10 h-10 rounded overflow-hidden bg-dark-600/50 flex-shrink-0 relative">
                  <Image src={url} alt="" fill className="object-cover" sizes="40px" />
                </div>
                <span className="text-sm truncate flex-1 text-dark-200">{url.split('/').pop()}</span>
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="text-red-400 hover:text-red-300"
                  aria-label="Supprimer cette image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
