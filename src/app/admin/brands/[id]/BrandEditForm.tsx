'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Save, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { updateBrand, deleteBrand } from '@/lib/actions/brands'
import type { Brand } from '@/lib/types'

interface BrandEditFormProps {
  brand: Brand
}

export function BrandEditForm({ brand }: BrandEditFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(brand.name)
  const [logoUrl, setLogoUrl] = useState(brand.logo_url ?? '')
  const [description, setDescription] = useState(brand.description ?? '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')
    setSuccess('')

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Le nom de la marque est requis')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    const result = await updateBrand(brand.id, {
      name: name.trim(),
      logo_url: logoUrl.trim() || null,
      description: description.trim() || null,
    })

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess('Marque mise à jour avec succès')
      router.refresh()
    }

    setSaving(false)
  }

  const handleDelete = async () => {
    if (!confirm(`Supprimer la marque "${brand.name}" ? Cette action est irréversible.`)) return

    setDeleting(true)
    setError('')
    setSuccess('')

    const result = await deleteBrand(brand.id)

    if (result.error) {
      setError(result.error)
      setDeleting(false)
      return
    }

    router.push('/admin/brands')
  }

  return (
    <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg border border-white/10 p-5 shadow-dark-card">
      <h2 className="text-base font-semibold text-white mb-4">Modifier la marque</h2>

      {error && (
        <p className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded px-3 py-2">
          {error}
        </p>
      )}
      {success && (
        <p className="mb-4 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded px-3 py-2">
          {success}
        </p>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-brand-name" className="text-dark-200 text-sm">
              Nom <span className="text-red-400">*</span>
            </Label>
            <Input
              id="edit-brand-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-dark-600/50 border-white/10 text-white placeholder:text-dark-400 focus:border-secondary/50"
            />
          </div>

          {/* Logo URL + upload */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-brand-logo" className="text-dark-200 text-sm">
              Logo (URL)
            </Label>
            <div className="flex gap-2">
              <Input
                id="edit-brand-logo"
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
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="edit-brand-description" className="text-dark-200 text-sm">
            Description
          </Label>
          <textarea
            id="edit-brand-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description de la marque..."
            rows={3}
            className="w-full px-3 py-2 bg-dark-600/50 border border-white/10 rounded-md text-white placeholder:text-dark-400 text-sm focus:border-secondary/50 focus:outline-none resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <Button
            type="submit"
            disabled={saving || uploading}
            className="shadow-dark-card hover:shadow-dark-elevated transition-all"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>

          <Button
            type="button"
            variant="ghost"
            disabled={deleting}
            onClick={handleDelete}
            className="border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-300 transition-all"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {deleting ? 'Suppression...' : 'Supprimer la marque'}
          </Button>
        </div>
      </form>
    </div>
  )
}
