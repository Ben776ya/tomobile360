import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft } from 'lucide-react'
import type { Brand, Model, VehicleNew } from '@/lib/types'
import { BrandEditForm } from './BrandEditForm'
import { ModelManager } from './ModelManager'
import { VehicleCatalog } from './VehicleCatalog'

export const revalidate = 30

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

  const [
    { data: modelsRaw },
    { data: vehiclesRaw },
    { data: allBrands },
    { data: allModels },
  ] = await Promise.all([
    supabase
      .from('models')
      .select('id, brand_id, name, category, created_at')
      .eq('brand_id', params.id)
      .order('name', { ascending: true }),
    supabase
      .from('vehicles_new')
      .select('id, brand_id, model_id, version, year, price_min, price_max, fuel_type, transmission, engine_size, cylinders, horsepower, torque, acceleration, top_speed, fuel_consumption_city, fuel_consumption_highway, fuel_consumption_combined, co2_emissions, doors, seating_capacity, cargo_capacity, exterior_color, interior_color, warranty_months, euro_norm, mileage, features, safety_features, images, dimensions, is_available, is_popular, is_new_release, is_coming_soon, is_featured_offer, is_coup_de_coeur, coup_de_coeur_category, coup_de_coeur_reason, views, created_at, updated_at')
      .eq('brand_id', params.id)
      .order('price_min', { ascending: true }),
    supabase
      .from('brands')
      .select('id, name, logo_url, description, created_at')
      .order('name', { ascending: true }),
    supabase
      .from('models')
      .select('id, brand_id, name, category, created_at')
      .order('name', { ascending: true }),
  ])

  const models = (modelsRaw ?? []) as Model[]
  const vehicles = (vehiclesRaw ?? []) as VehicleNew[]

  // Build vehicle counts per model
  const vehicleCounts = new Map<string, number>()
  for (const v of vehicles) {
    vehicleCounts.set(v.model_id, (vehicleCounts.get(v.model_id) ?? 0) + 1)
  }

  const modelsWithCounts = models.map(m => ({
    ...m,
    vehicle_count: vehicleCounts.get(m.id) ?? 0,
  }))

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

      {/* Brand header */}
      <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg border border-white/10 p-6 mb-6 shadow-dark-card">
        <div className="flex items-start gap-5">
          <div className="relative w-20 h-20 flex-shrink-0 bg-dark-600/50 rounded-xl overflow-hidden">
            {brand.logo_url ? (
              <Image src={brand.logo_url} alt={brand.name} fill className="object-contain p-2" sizes="80px" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-dark-400 text-xs font-medium">
                {brand.name.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-white mb-1">{brand.name}</h1>
            <p className="text-dark-300 text-sm">
              <span className="font-semibold text-dark-200">{modelsWithCounts.length}</span> modèle{modelsWithCounts.length !== 1 ? 's' : ''}{' '}
              <span className="text-dark-400">·</span>{' '}
              <span className="font-semibold text-dark-200">{vehicles.length}</span> véhicule{vehicles.length !== 1 ? 's' : ''}
            </p>
            {brand.description && <p className="text-dark-200 text-sm mt-2">{brand.description}</p>}
          </div>
        </div>
      </div>

      {/* Brand edit form */}
      <div className="mb-6">
        <BrandEditForm brand={brand} />
      </div>

      {/* Model manager */}
      <div className="mb-8">
        <ModelManager brandId={brand.id} initialModels={modelsWithCounts} />
      </div>

      {/* Vehicle catalog with inline editing */}
      <VehicleCatalog
        brand={brand}
        models={modelsWithCounts}
        vehicles={vehicles}
        allBrands={(allBrands ?? []) as Brand[]}
        allModels={(allModels ?? []) as Model[]}
      />
    </>
  )
}
