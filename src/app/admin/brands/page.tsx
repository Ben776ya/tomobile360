'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { updateBrand } from '@/lib/actions/admin'
import type { Brand } from '@/lib/types'

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const fetchBrands = useCallback(async () => {
    const supabase = createClient()
    const { data, error: fetchError } = await supabase
      .from('brands')
      .select('id, name, logo_url, description, created_at')
      .order('name', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setBrands(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchBrands()
  }, [fetchBrands])

  const handleEdit = (brand: Brand) => {
    setEditingId(brand.id)
    setEditValue(brand.description || '')
    setError('')
    setSuccess('')
  }

  const handleSave = async (brandId: string) => {
    setSaving(true)
    setError('')
    setSuccess('')

    const result = await updateBrand(brandId, {
      description: editValue.trim() || null,
    })

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess('Description mise à jour')
      setEditingId(null)
      fetchBrands()
    }
    setSaving(false)
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditValue('')
  }

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Marques</h1>
        <p className="text-gray-500">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Marques</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm">
          {success}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {brands.map((brand) => (
          <div key={brand.id} className="p-4 flex items-start gap-4">
            {/* Brand logo */}
            <div className="relative w-12 h-12 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
              {brand.logo_url ? (
                <Image
                  src={brand.logo_url}
                  alt={brand.name}
                  fill
                  className="object-contain p-1"
                  sizes="48px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                  N/A
                </div>
              )}
            </div>

            {/* Brand info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm">{brand.name}</h3>

              {editingId === brand.id ? (
                <div className="mt-2">
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder="Ajouter une description de la marque..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:border-[#006EFE] focus:ring-1 focus:ring-[#006EFE]/20 outline-none"
                    rows={3}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleSave(brand.id)}
                      disabled={saving}
                      className="px-3 py-1.5 bg-[#006EFE] text-white text-sm font-medium rounded-lg hover:bg-[#005BD4] disabled:opacity-50 transition-colors"
                    >
                      {saving ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-1">
                  {brand.description ? (
                    <p className="text-sm text-gray-500">{brand.description}</p>
                  ) : (
                    <p className="text-sm text-gray-300 italic">Aucune description</p>
                  )}
                  <button
                    onClick={() => handleEdit(brand)}
                    className="mt-1 text-xs text-[#006EFE] hover:underline"
                  >
                    Modifier
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
