'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { updateVehicle } from '@/lib/actions/admin'
import type { VehicleNew } from '@/lib/types'

type CoupDeCoeurVehicle = VehicleNew & {
  brands?: { name: string; logo_url: string | null }
  models?: { name: string }
}

const CATEGORY_LABELS: Record<string, string> = {
  voiture: 'Voiture',
  suv: 'SUV & 4×4',
  pickup: 'Pick-up',
  electrique: 'Électrique',
}

export default function AdminCoupsDeCoeurPage() {
  const [vehicles, setVehicles] = useState<CoupDeCoeurVehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const fetchVehicles = useCallback(async () => {
    const supabase = createClient()
    const { data, error: fetchError } = await supabase
      .from('vehicles_new')
      .select('id, brand_id, model_id, version, year, images, coup_de_coeur_category, coup_de_coeur_reason, is_coup_de_coeur, brands:brand_id (name, logo_url), models:model_id (name)')
      .eq('is_coup_de_coeur', true)
      .order('coup_de_coeur_category', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setVehicles((data as CoupDeCoeurVehicle[]) || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchVehicles()
  }, [fetchVehicles])

  const handleEdit = (vehicle: CoupDeCoeurVehicle) => {
    setEditingId(vehicle.id)
    setEditValue(vehicle.coup_de_coeur_reason || '')
    setError('')
    setSuccess('')
  }

  const handleSave = async (vehicleId: string) => {
    setSaving(true)
    setError('')
    setSuccess('')

    const result = await updateVehicle(vehicleId, {
      coup_de_coeur_reason: editValue.trim() || null,
    })

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess('Raison mise à jour')
      setEditingId(null)
      fetchVehicles()
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
        <h1 className="text-2xl font-bold mb-6">Coups de Cœur</h1>
        <p className="text-gray-500">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Coups de Cœur</h1>
        <p className="text-sm text-gray-500 mt-1">
          Modifiez la raison éditoriale affichée pour chaque véhicule coup de cœur.
        </p>
      </div>

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

      {vehicles.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400">
            Aucun véhicule coup de cœur pour le moment.
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Activez le statut coup de cœur depuis la page Véhicules.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {vehicles.map((vehicle) => {
            const mainImage = vehicle.images?.[0] || null
            const brandName = vehicle.brands?.name || ''
            const modelName = vehicle.models?.name || ''
            const categoryLabel = vehicle.coup_de_coeur_category
              ? CATEGORY_LABELS[vehicle.coup_de_coeur_category] || vehicle.coup_de_coeur_category
              : '—'

            return (
              <div key={vehicle.id} className="p-4 flex items-start gap-4">
                {/* Vehicle image */}
                <div className="relative w-16 h-12 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                  {mainImage ? (
                    <Image
                      src={mainImage}
                      alt={`${brandName} ${modelName}`}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                      N/A
                    </div>
                  )}
                </div>

                {/* Vehicle info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">
                      {brandName} {modelName} {vehicle.version && `— ${vehicle.version}`}
                    </h3>
                    <span className="text-xs px-2 py-0.5 bg-pink-50 text-pink-600 rounded-full border border-pink-100">
                      {categoryLabel}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{vehicle.year}</p>

                  {editingId === vehicle.id ? (
                    <div className="mt-2">
                      <textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        placeholder="Ex: Meilleur rapport qualité/prix du segment, finition exemplaire..."
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:border-[#006EFE] focus:ring-1 focus:ring-[#006EFE]/20 outline-none"
                        rows={3}
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleSave(vehicle.id)}
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
                      {vehicle.coup_de_coeur_reason ? (
                        <p className="text-sm text-gray-500">{vehicle.coup_de_coeur_reason}</p>
                      ) : (
                        <p className="text-sm text-gray-300 italic">Aucune raison éditoriale</p>
                      )}
                      <button
                        onClick={() => handleEdit(vehicle)}
                        className="mt-1 text-xs text-[#006EFE] hover:underline"
                      >
                        Modifier
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
