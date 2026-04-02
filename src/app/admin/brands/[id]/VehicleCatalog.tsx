'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Car, Plus, ChevronDown, ChevronUp, Trash2, Star, Sparkles, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import { VehicleForm } from '@/components/admin/VehicleForm'
import { deleteVehicle, toggleVehicleBadge } from '@/lib/actions/admin'
import { CATEGORY_COLORS } from '@/lib/constants'
import type { Brand, Model, VehicleNew, VehicleCategory } from '@/lib/types'

interface VehicleCatalogProps {
  brand: Brand
  models: (Model & { vehicle_count: number })[]
  vehicles: VehicleNew[]
  allBrands: Brand[]
  allModels: Model[]
}

export function VehicleCatalog({ brand, models, vehicles, allBrands, allModels }: VehicleCatalogProps) {
  const router = useRouter()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [creatingForModel, setCreatingForModel] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Group vehicles by model
  const vehiclesByModel = new Map<string, VehicleNew[]>()
  for (const v of vehicles) {
    const existing = vehiclesByModel.get(v.model_id) ?? []
    existing.push(v)
    vehiclesByModel.set(v.model_id, existing)
  }

  const modelsWithVehicles = models.filter(m => (vehiclesByModel.get(m.id)?.length ?? 0) > 0)
  const modelsWithoutVehicles = models.filter(m => (vehiclesByModel.get(m.id)?.length ?? 0) === 0)

  const handleToggleExpand = (vehicleId: string) => {
    setCreatingForModel(null)
    setExpandedId(expandedId === vehicleId ? null : vehicleId)
  }

  const handleStartCreate = (modelId: string) => {
    setExpandedId(null)
    setCreatingForModel(creatingForModel === modelId ? null : modelId)
  }

  const handleFormSuccess = () => {
    setExpandedId(null)
    setCreatingForModel(null)
    router.refresh()
  }

  const handleFormCancel = () => {
    setExpandedId(null)
    setCreatingForModel(null)
  }

  const handleDelete = async (vehicleId: string) => {
    if (!confirm('Supprimer ce véhicule ? Cette action est irréversible.')) return
    setActionLoading(vehicleId)
    const result = await deleteVehicle(vehicleId, 'new')
    if (result.error) {
      alert(result.error)
    } else {
      router.refresh()
    }
    setActionLoading(null)
  }

  const handleToggleBadge = async (vehicleId: string, badge: 'is_popular' | 'is_new_release' | 'is_featured_offer', current: boolean) => {
    setActionLoading(vehicleId)
    const result = await toggleVehicleBadge(vehicleId, badge, !current)
    if (result.error) alert(result.error)
    else router.refresh()
    setActionLoading(null)
  }

  return (
    <div>
      <div className="flex items-baseline gap-3 mb-4">
        <h2 className="text-2xl font-bold text-white">
          Catalogue {brand.name}
        </h2>
        <span className="text-sm text-dark-400">
          ({vehicles.length} véhicule{vehicles.length !== 1 ? 's' : ''} — triés par prix croissant)
        </span>
      </div>

      <div className="space-y-6">
        {modelsWithVehicles.map((model) => {
          const modelVehicles = vehiclesByModel.get(model.id) ?? []
          const colorClass = CATEGORY_COLORS[model.category as VehicleCategory] ?? 'bg-gray-500/20 text-gray-300 border-gray-500/30'

          return (
            <div key={model.id} className="bg-dark-700/80 backdrop-blur-sm rounded-lg border border-white/10 shadow-dark-card overflow-hidden">
              {/* Model header */}
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/10 bg-dark-600/30">
                <h3 className="font-semibold text-white text-base">{model.name}</h3>
                <Badge className={`border text-xs px-2 py-0 ${colorClass}`}>
                  {model.category}
                </Badge>
                <span className="text-xs text-dark-400">
                  {modelVehicles.length} version{modelVehicles.length !== 1 ? 's' : ''}
                </span>
                <div className="ml-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStartCreate(model.id)}
                    className={`text-xs border border-white/10 ${
                      creatingForModel === model.id
                        ? 'bg-primary text-white'
                        : 'text-dark-300 hover:text-white hover:bg-dark-600/50'
                    }`}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Ajouter une version
                  </Button>
                </div>
              </div>

              {/* Inline create form for this model */}
              {creatingForModel === model.id && (
                <div className="border-b border-secondary/30 bg-dark-600/20 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Plus className="h-4 w-4 text-secondary" />
                    <h4 className="text-sm font-semibold text-secondary">
                      Nouveau véhicule — {brand.name} {model.name}
                    </h4>
                  </div>
                  <VehicleForm
                    brands={allBrands}
                    models={allModels}
                    mode="create"
                    defaultBrandId={brand.id}
                    defaultModelId={model.id}
                    onSuccess={handleFormSuccess}
                    onCancel={handleFormCancel}
                  />
                </div>
              )}

              {/* Vehicles table */}
              <div>
                {modelVehicles.map((vehicle) => (
                  <div key={vehicle.id}>
                    {/* Vehicle row */}
                    <div
                      className={`flex items-center gap-4 px-5 py-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${
                        expandedId === vehicle.id ? 'bg-white/5' : ''
                      }`}
                      onClick={() => handleToggleExpand(vehicle.id)}
                    >
                      {/* Thumbnail */}
                      <div className="relative w-12 h-10 bg-dark-600/50 rounded overflow-hidden flex-shrink-0">
                        {vehicle.images?.[0] ? (
                          <Image src={vehicle.images[0]} alt={vehicle.version ?? ''} fill className="object-cover" sizes="48px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Car className="h-4 w-4 text-dark-400" />
                          </div>
                        )}
                      </div>

                      {/* Version */}
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-white font-medium">
                          {vehicle.version || <span className="text-dark-400 italic">Version de base</span>}
                        </span>
                        <span className="text-xs text-dark-400 ml-2">{vehicle.year}</span>
                      </div>

                      {/* Badges */}
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleToggleBadge(vehicle.id, 'is_popular', vehicle.is_popular)}
                          disabled={actionLoading === vehicle.id}
                          title="Populaire"
                          className={`p-1.5 rounded border transition ${vehicle.is_popular ? 'bg-yellow-500/20 border-yellow-500/30' : 'border-white/10 hover:bg-white/5'}`}
                        >
                          <Star className={`h-3.5 w-3.5 ${vehicle.is_popular ? 'fill-yellow-500 text-yellow-500' : 'text-dark-400'}`} />
                        </button>
                        <button
                          onClick={() => handleToggleBadge(vehicle.id, 'is_new_release', vehicle.is_new_release)}
                          disabled={actionLoading === vehicle.id}
                          title="Nouveauté"
                          className={`p-1.5 rounded border transition ${vehicle.is_new_release ? 'bg-green-500/20 border-green-500/30' : 'border-white/10 hover:bg-white/5'}`}
                        >
                          <Sparkles className={`h-3.5 w-3.5 ${vehicle.is_new_release ? 'fill-green-500 text-green-500' : 'text-dark-400'}`} />
                        </button>
                        <button
                          onClick={() => handleToggleBadge(vehicle.id, 'is_featured_offer', vehicle.is_featured_offer)}
                          disabled={actionLoading === vehicle.id}
                          title="Offre spéciale"
                          className={`p-1.5 rounded border transition ${vehicle.is_featured_offer ? 'bg-emerald-500/20 border-emerald-500/30' : 'border-white/10 hover:bg-white/5'}`}
                        >
                          <Tag className={`h-3.5 w-3.5 ${vehicle.is_featured_offer ? 'fill-emerald-500 text-emerald-500' : 'text-dark-400'}`} />
                        </button>
                      </div>

                      {/* Price */}
                      <span className="text-sm font-semibold text-secondary w-28 text-right">
                        {vehicle.price_min ? formatPrice(vehicle.price_min) : '—'}
                      </span>

                      {/* Motorisation */}
                      <span className="text-xs text-dark-300 w-24">
                        {[vehicle.fuel_type, vehicle.transmission].filter(Boolean).join(' · ')}
                      </span>

                      {/* Status */}
                      <div className="w-20">
                        {vehicle.is_available ? (
                          <Badge variant="default" className="text-xs">Actif</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs border-white/10 text-dark-400">Inactif</Badge>
                        )}
                      </div>

                      {/* Expand arrow + delete */}
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleDelete(vehicle.id)}
                          disabled={actionLoading === vehicle.id}
                          className="p-1.5 rounded border border-white/10 text-dark-400 hover:text-red-400 hover:border-red-500/30 transition"
                          title="Supprimer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleExpand(vehicle.id)}
                          className="p-1.5 rounded border border-white/10 text-dark-400 hover:text-white transition"
                        >
                          {expandedId === vehicle.id ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expanded edit form */}
                    {expandedId === vehicle.id && (
                      <div className="border-b border-primary/30 bg-dark-600/20 p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <h4 className="text-sm font-semibold text-primary">
                            Modifier — {brand.name} {model.name} {vehicle.version || ''}
                          </h4>
                        </div>
                        <VehicleForm
                          brands={allBrands}
                          models={allModels}
                          vehicle={vehicle}
                          mode="edit"
                          defaultBrandId={brand.id}
                          defaultModelId={model.id}
                          onSuccess={handleFormSuccess}
                          onCancel={handleFormCancel}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {/* Models without vehicles */}
        {modelsWithoutVehicles.length > 0 && (
          <div className="rounded-lg border border-dashed border-white/20 p-5">
            <p className="text-sm font-semibold text-dark-300 mb-3">
              Modèles sans véhicules ({modelsWithoutVehicles.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {modelsWithoutVehicles.map((model) => {
                const colorClass = CATEGORY_COLORS[model.category as VehicleCategory] ?? 'bg-gray-500/20 text-gray-300 border-gray-500/30'
                return (
                  <div key={model.id} className="flex items-center gap-2 bg-dark-700/50 rounded-md px-3 py-2 border border-white/10">
                    <span className="text-sm text-white">{model.name}</span>
                    <Badge className={`border text-xs px-1.5 py-0 ${colorClass}`}>{model.category}</Badge>
                    <button
                      onClick={() => handleStartCreate(model.id)}
                      className="text-xs text-secondary hover:underline ml-1"
                    >
                      Ajouter
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Show create form for empty model if selected */}
            {modelsWithoutVehicles.some(m => m.id === creatingForModel) && (
              <div className="mt-4 bg-dark-700/80 rounded-lg border border-secondary/30 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Plus className="h-4 w-4 text-secondary" />
                  <h4 className="text-sm font-semibold text-secondary">
                    Nouveau véhicule — {brand.name} {models.find(m => m.id === creatingForModel)?.name}
                  </h4>
                </div>
                <VehicleForm
                  brands={allBrands}
                  models={allModels}
                  mode="create"
                  defaultBrandId={brand.id}
                  defaultModelId={creatingForModel!}
                  onSuccess={handleFormSuccess}
                  onCancel={handleFormCancel}
                />
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {vehicles.length === 0 && models.length === 0 && (
          <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg border border-white/10 p-12 text-center">
            <Car className="h-16 w-16 mx-auto mb-4 text-dark-300" />
            <h3 className="text-xl font-semibold text-white mb-2">Aucun véhicule</h3>
            <p className="text-dark-300">Ajoutez d&apos;abord des modèles, puis des véhicules</p>
          </div>
        )}
      </div>
    </div>
  )
}
