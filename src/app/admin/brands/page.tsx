import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Tag } from 'lucide-react'
import type { BrandWithCounts } from '@/lib/types'
import { BrandCreateForm } from './BrandCreateForm'

export const revalidate = 30

export default async function AdminBrandsPage() {
  const supabase = await createClient()

  const [brandsResult, modelsResult, vehiclesResult] = await Promise.all([
    supabase
      .from('brands')
      .select('id, name, logo_url, description, created_at')
      .order('name', { ascending: true }),
    supabase
      .from('models')
      .select('brand_id'),
    supabase
      .from('vehicles_new')
      .select('brand_id'),
  ])

  const brands = brandsResult.data ?? []

  // Build count maps
  const modelCountMap: Record<string, number> = {}
  for (const row of modelsResult.data ?? []) {
    modelCountMap[row.brand_id] = (modelCountMap[row.brand_id] ?? 0) + 1
  }

  const vehicleCountMap: Record<string, number> = {}
  for (const row of vehiclesResult.data ?? []) {
    vehicleCountMap[row.brand_id] = (vehicleCountMap[row.brand_id] ?? 0) + 1
  }

  const brandsWithCounts: BrandWithCounts[] = brands.map((brand) => ({
    ...brand,
    model_count: modelCountMap[brand.id] ?? 0,
    vehicle_count: vehicleCountMap[brand.id] ?? 0,
  }))

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Gestion des marques
            </h1>
            <p className="text-dark-200">
              {brandsWithCounts.length} marque{brandsWithCounts.length !== 1 ? 's' : ''} enregistrée{brandsWithCounts.length !== 1 ? 's' : ''}
            </p>
          </div>
          <BrandCreateForm />
        </div>
      </div>

      {/* Grid */}
      {brandsWithCounts.length === 0 ? (
        <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg border border-white/10 p-12 text-center">
          <Tag className="h-16 w-16 mx-auto mb-4 text-dark-300" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Aucune marque enregistrée
          </h3>
          <p className="text-dark-300">
            Commencez par ajouter votre première marque
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {brandsWithCounts.map((brand) => (
            <Link
              key={brand.id}
              href={`/admin/brands/${brand.id}`}
              className="bg-dark-700/80 backdrop-blur-sm rounded-lg border border-white/10 p-5 hover:border-secondary/40 hover:shadow-dark-elevated transition-all duration-200 group"
            >
              <div className="flex items-start gap-4">
                {/* Logo */}
                <div className="relative w-14 h-14 flex-shrink-0 bg-dark-600/50 rounded-lg overflow-hidden">
                  {brand.logo_url ? (
                    <Image
                      src={brand.logo_url}
                      alt={brand.name}
                      fill
                      className="object-contain p-1.5"
                      sizes="56px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-dark-400 text-xs font-medium">
                      N/A
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white group-hover:text-secondary transition-colors">
                    {brand.name}
                  </h3>
                  {brand.description ? (
                    <p className="text-sm text-dark-200 mt-1 line-clamp-2">
                      {brand.description}
                    </p>
                  ) : (
                    <p className="text-sm text-dark-400 mt-1 italic">
                      Aucune description
                    </p>
                  )}

                  {/* Counts */}
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-xs text-dark-300">
                      <span className="font-semibold text-dark-200">
                        {brand.model_count}
                      </span>{' '}
                      modèle{brand.model_count !== 1 ? 's' : ''}
                    </span>
                    <span className="text-dark-400">·</span>
                    <span className="text-xs text-dark-300">
                      <span className="font-semibold text-dark-200">
                        {brand.vehicle_count}
                      </span>{' '}
                      véhicule{brand.vehicle_count !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
