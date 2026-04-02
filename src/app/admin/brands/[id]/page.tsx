import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Car, Plus, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import type { Brand, Model, VehicleCategory, FuelType, Transmission } from '@/lib/types'
import { CATEGORY_COLORS } from '@/lib/constants'
import { BrandEditForm } from './BrandEditForm'
import { ModelManager } from './ModelManager'

export const revalidate = 30

type VehicleRow = {
  id: string
  version: string | null
  year: number
  price_min: number | null
  price_max: number | null
  images: string[] | null
  is_available: boolean
  fuel_type: FuelType | null
  transmission: Transmission | null
  horsepower: number | null
  model_id: string
  models: { name: string; category: VehicleCategory } | { name: string; category: VehicleCategory }[] | null
}

export default async function AdminBrandDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  const { data: brand } = await supabase
    .from('brands')
    .select('id, name, logo_url, description, created_at')
    .eq('id', params.id)
    .single()

  if (!brand) notFound()

  const [{ data: modelsRaw }, { data: vehiclesRaw }] = await Promise.all([
    supabase
      .from('models')
      .select('id, brand_id, name, category, created_at')
      .eq('brand_id', params.id)
      .order('name', { ascending: true }),
    supabase
      .from('vehicles_new')
      .select('id, version, year, price_min, price_max, images, is_available, fuel_type, transmission, horsepower, model_id, models:model_id (name, category)')
      .eq('brand_id', params.id)
      .order('price_min', { ascending: true }),
  ])

  const models = (modelsRaw ?? []) as (Model & { vehicle_count?: number })[]
  const vehicles = (vehiclesRaw ?? []) as VehicleRow[]

  // Group vehicles by model_id
  const vehiclesByModel = new Map<string, VehicleRow[]>()
  for (const v of vehicles) {
    const existing = vehiclesByModel.get(v.model_id) ?? []
    existing.push(v)
    vehiclesByModel.set(v.model_id, existing)
  }

  // Enrich models with vehicle_count
  const modelsWithCounts = models.map((m) => ({
    ...m,
    vehicle_count: vehiclesByModel.get(m.id)?.length ?? 0,
  }))

  const typedBrand = brand
  const modelsWithVehicles = modelsWithCounts.filter((m) => m.vehicle_count > 0)
  const modelsWithoutVehicles = modelsWithCounts.filter((m) => m.vehicle_count === 0)

  return (
    <>
      {/* Back link */}
      <div className="mb-5">
        <Link
          href="/admin/brands"
          className="inline-flex items-center gap-1.5 text-sm text-dark-300 hover:text-secondary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux marques
        </Link>
      </div>

      {/* Brand header card */}
      <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg border border-white/10 p-6 mb-6 shadow-dark-card">
        <div className="flex items-start gap-5">
          <div className="relative w-20 h-20 flex-shrink-0 bg-dark-600/50 rounded-xl overflow-hidden">
            {typedBrand.logo_url ? (
              <Image
                src={typedBrand.logo_url}
                alt={typedBrand.name}
                fill
                className="object-contain p-2"
                sizes="80px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-dark-400 text-xs font-medium">
                N/A
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">{typedBrand.name}</h1>
                <p className="text-dark-300 text-sm mb-3">
                  <span className="font-semibold text-dark-200">{modelsWithCounts.length}</span>{' '}
                  modèle{modelsWithCounts.length !== 1 ? 's' : ''}{' '}
                  <span className="text-dark-400">·</span>{' '}
                  <span className="font-semibold text-dark-200">{vehicles.length}</span>{' '}
                  véhicule{vehicles.length !== 1 ? 's' : ''}
                </p>
                {typedBrand.description && (
                  <p className="text-dark-200 text-sm">{typedBrand.description}</p>
                )}
              </div>
              <Link href={`/admin/vehicles/new?brand=${typedBrand.id}`} className="flex-shrink-0">
                <Button className="shadow-dark-card hover:shadow-dark-elevated transition-all">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un véhicule
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Brand edit form */}
      <div className="mb-6">
        <BrandEditForm brand={typedBrand} />
      </div>

      {/* Model manager */}
      <div className="mb-8">
        <ModelManager
          brandId={typedBrand.id}
          initialModels={modelsWithCounts}
        />
      </div>

      {/* Vehicle catalog */}
      <div>
        <div className="flex items-baseline gap-3 mb-4">
          <h2 className="text-2xl font-bold text-white">
            Catalogue {typedBrand.name}
          </h2>
          <span className="text-sm text-dark-400">
            ({vehicles.length} véhicule{vehicles.length !== 1 ? 's' : ''} — triés par prix croissant)
          </span>
        </div>

        <div className="space-y-6">
          {/* Models with vehicles */}
          {modelsWithVehicles.map((model) => {
            const modelVehicles = vehiclesByModel.get(model.id) ?? []
            const colorClass = CATEGORY_COLORS[model.category as VehicleCategory] ?? 'bg-gray-500/20 text-gray-300 border-gray-500/30'
            return (
              <div
                key={model.id}
                className="bg-dark-700/80 backdrop-blur-sm rounded-lg border border-white/10 shadow-dark-card overflow-hidden"
              >
                {/* Model header */}
                <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/10 bg-dark-600/30">
                  <h3 className="font-semibold text-white text-base">{model.name}</h3>
                  <Badge className={`border text-xs px-2 py-0 ${colorClass}`}>
                    {model.category}
                  </Badge>
                  <span className="ml-auto text-xs text-dark-400">
                    {modelVehicles.length} version{modelVehicles.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Vehicles table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-dark-600/20 border-b border-white/5">
                      <tr>
                        <th className="px-5 py-2.5 text-left text-xs font-semibold text-dark-300 uppercase tracking-wide">
                          Version
                        </th>
                        <th className="px-5 py-2.5 text-left text-xs font-semibold text-dark-300 uppercase tracking-wide">
                          Année
                        </th>
                        <th className="px-5 py-2.5 text-left text-xs font-semibold text-dark-300 uppercase tracking-wide">
                          Prix
                        </th>
                        <th className="px-5 py-2.5 text-left text-xs font-semibold text-dark-300 uppercase tracking-wide">
                          Motorisation
                        </th>
                        <th className="px-5 py-2.5 text-left text-xs font-semibold text-dark-300 uppercase tracking-wide">
                          Statut
                        </th>
                        <th className="px-5 py-2.5 text-right text-xs font-semibold text-dark-300 uppercase tracking-wide">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {modelVehicles.map((vehicle) => (
                        <tr key={vehicle.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <div className="relative w-12 h-10 bg-dark-600/50 rounded overflow-hidden flex-shrink-0">
                                {vehicle.images?.[0] ? (
                                  <Image
                                    src={vehicle.images[0]}
                                    alt={vehicle.version ?? model.name}
                                    fill
                                    className="object-cover"
                                    sizes="48px"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Car className="h-4 w-4 text-dark-400" />
                                  </div>
                                )}
                              </div>
                              <span className="text-sm text-white font-medium">
                                {vehicle.version ?? <span className="text-dark-400 italic">— sans version</span>}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <span className="text-sm text-dark-200">{vehicle.year}</span>
                          </td>
                          <td className="px-5 py-3">
                            <span className="text-sm font-semibold text-secondary">
                              {vehicle.price_min
                                ? formatPrice(vehicle.price_min)
                                : vehicle.price_max
                                ? formatPrice(vehicle.price_max)
                                : <span className="text-dark-400 font-normal">N/A</span>}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex flex-col gap-0.5">
                              {vehicle.fuel_type && (
                                <span className="text-xs text-dark-200">{vehicle.fuel_type}</span>
                              )}
                              {vehicle.transmission && (
                                <span className="text-xs text-dark-400">{vehicle.transmission}</span>
                              )}
                              {vehicle.horsepower && (
                                <span className="text-xs text-dark-400">{vehicle.horsepower} ch</span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            {vehicle.is_available ? (
                              <Badge variant="default" className="text-xs">Disponible</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs border-white/10 text-dark-300">Indisponible</Badge>
                            )}
                          </td>
                          <td className="px-5 py-3 text-right">
                            <Link href={`/admin/vehicles/${vehicle.id}/edit`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="shadow-sm border border-white/10 hover:shadow-md hover:bg-primary/5 hover:text-primary text-dark-300 text-xs"
                              >
                                Modifier
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                    <div
                      key={model.id}
                      className="flex items-center gap-2 bg-dark-700/50 rounded-md px-3 py-2 border border-white/10"
                    >
                      <span className="text-sm text-white">{model.name}</span>
                      <Badge className={`border text-xs px-1.5 py-0 ${colorClass}`}>
                        {model.category}
                      </Badge>
                      <Link
                        href={`/admin/vehicles/new?brand=${typedBrand.id}&model=${model.id}`}
                        className="text-xs text-secondary hover:underline ml-1"
                      >
                        Ajouter
                      </Link>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* No vehicles at all */}
          {vehicles.length === 0 && modelsWithCounts.length === 0 && (
            <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg border border-white/10 p-12 text-center">
              <Car className="h-16 w-16 mx-auto mb-4 text-dark-300" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Aucun véhicule dans le catalogue
              </h3>
              <p className="text-dark-300 mb-4">
                Commencez par ajouter des modèles, puis des véhicules
              </p>
              <Link href={`/admin/vehicles/new?brand=${typedBrand.id}`}>
                <Button className="shadow-dark-card hover:shadow-dark-elevated transition-all">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un véhicule
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
