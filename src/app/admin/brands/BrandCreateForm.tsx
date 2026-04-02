'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { createBrand } from '@/lib/actions/brands'

export function BrandCreateForm() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleClose = () => {
    setOpen(false)
    setName('')
    setLogoUrl('')
    setDescription('')
    setError('')
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')

    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `brands/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      setError(uploadError.message)
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(path)

    setLogoUrl(urlData.publicUrl)
    setUploading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Le nom de la marque est requis')
      return
    }

    setSubmitting(true)
    setError('')

    const result = await createBrand({
      name: name.trim(),
      logo_url: logoUrl.trim() || undefined,
      description: description.trim() || undefined,
    })

    if (result.error) {
      setError(result.error)
      setSubmitting(false)
      return
    }

    handleClose()
    router.refresh()
  }

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        className="shadow-dark-card hover:shadow-dark-elevated transition-all flex-shrink-0"
      >
        <Plus className="h-4 w-4 mr-2" />
        Ajouter une marque
      </Button>
    )
  }

  return (
    <div className="w-full max-w-md bg-dark-700/80 backdrop-blur-sm rounded-lg border border-white/10 p-5 shadow-dark-elevated">
      {/* Form header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-white">Nouvelle marque</h2>
        <button
          type="button"
          onClick={handleClose}
          className="text-dark-300 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {error && (
        <p className="mb-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded px-3 py-2">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div className="space-y-1.5">
          <Label htmlFor="brand-name" className="text-dark-200 text-sm">
            Nom <span className="text-red-400">*</span>
          </Label>
          <Input
            id="brand-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ex. Renault"
            required
            className="bg-dark-600/50 border-white/10 text-white placeholder:text-dark-400 focus:border-secondary/50"
          />
        </div>

        {/* Logo URL + upload */}
        <div className="space-y-1.5">
          <Label htmlFor="brand-logo" className="text-dark-200 text-sm">
            Logo (URL)
          </Label>
          <div className="flex gap-2">
            <Input
              id="brand-logo"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://..."
              className="bg-dark-600/50 border-white/10 text-white placeholder:text-dark-400 focus:border-secondary/50 flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="border-white/10 text-dark-200 hover:text-white hover:border-white/20 flex-shrink-0"
            >
              <Upload className="h-4 w-4 mr-1.5" />
              {uploading ? '...' : 'Upload'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="brand-description" className="text-dark-200 text-sm">
            Description
          </Label>
          <textarea
            id="brand-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description de la marque..."
            rows={3}
            className="w-full px-3 py-2 bg-dark-600/50 border border-white/10 rounded-md text-white placeholder:text-dark-400 text-sm focus:border-secondary/50 focus:outline-none resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button
            type="submit"
            disabled={submitting || uploading}
            className="flex-1 shadow-dark-card hover:shadow-dark-elevated transition-all"
          >
            {submitting ? 'Création...' : 'Créer la marque'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="border-white/10 text-dark-200 hover:text-white hover:border-white/20"
          >
            Annuler
          </Button>
        </div>
      </form>
    </div>
  )
}
