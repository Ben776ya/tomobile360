import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { VehicleCard } from '@/components/vehicles/VehicleCard'
import { VehicleFilters } from '@/components/vehicles/VehicleFilters'
import { BrandHeader } from '@/components/vehicles/BrandHeader'
import { Loader2, SlidersHorizontal } from 'lucide-react'

export const revalidate = 60

export const metadata = {
  title: 'Voitures Neuves au Maroc | Tomobile 360',
  description: 'Découvrez toutes les voitures neuves disponibles au Maroc. Comparez les prix, les modèles et les équipements des véhicules neufs de toutes les marques.',
}

interface SearchParams {
  brand?: string
  category?: string
  fuel?: string
  transmission?: string
  priceMin?: string
  priceMax?: string
  sort?: string
  page?: string
}

export default async function NewVehiclesPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = await createClient()

  // Parse filters
  const brand = searchParams.brand
  const category = searchParams.category
  const fuel = searchParams.fuel
  const transmission = searchParams.transmission
  const priceMin = searchParams.priceMin ? parseInt(searchParams.priceMin) : undefined
  const priceMax = searchParams.priceMax ? parseInt(searchParams.priceMax) : undefined
  const sort = searchParams.sort || 'newest'
  const page = searchParams.page ? parseInt(searchParams.page) : 1
  const itemsPerPage = 12

  // Build query
  let query = supabase
    .from('vehicles_new')
    .select(`
      id, images, price_min, price_max, is_new_release, is_popular, version, year, fuel_type, transmission, horsepower, brand_id, model_id,
      brands:brand_id (name, logo_url),
      models:model_id (name),
      promotions (discount_percentage, is_active)
    `, { count: 'exact' })

  // Apply filters
  if (brand) query = query.eq('brand_id', brand)
  if (category) {
    // Filter by model category
    const { data: categoryModels } = await supabase
      .from('models')
      .select('id')
      .eq('category', category)

    if (categoryModels && categoryModels.length > 0) {
      const modelIds = categoryModels.map(m => m.id)
      query = query.in('model_id', modelIds)
    }
  }
  if (fuel) query = query.eq('fuel_type', fuel)
  if (transmission) query = query.eq('transmission', transmission)
  if (priceMin) query = query.gte('price_min', priceMin)
  if (priceMax) query = query.lte('price_max', priceMax)

  // Apply sorting
  switch (sort) {
    case 'price-asc':
      query = query.order('price_min', { ascending: true })
      break
    case 'price-desc':
      query = query.order('price_min', { ascending: false })
      break
    case 'popular':
      query = query.order('views', { ascending: false })
      break
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false })
      break
  }

  // Apply pagination
  const from = (page - 1) * itemsPerPage
  const to = from + itemsPerPage - 1
  query = query.range(from, to)

  const { data: vehicles, count } = await query

  // Fetch filter options
  const [
    { data: brands },
    { data: categories },
  ] = await Promise.all([
    supabase.from('brands').select('id, name, logo_url, description, created_at').order('name'),
    supabase.from('models').select('category').order('category'),
  ])

  // Get unique categories
  const uniqueCategories = categories
    ? Array.from(new Set(categories.map(c => c.category).filter(Boolean)))
    : []

  const totalPages = count ? Math.ceil(count / itemsPerPage) : 0

  const quickFilters = [
    { label: 'Moins de 100 000 DH', params: 'priceMax=100000' },
    { label: 'SUV / 4x4', params: 'category=SUV' },
    { label: 'Électrique', params: 'fuel=Electric' },
    { label: `Récent (< 3 ans)`, params: `yearMin=${new Date().getFullYear() - 3}` },
    { label: 'Moins de 200 000 DH', params: 'priceMax=200000' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2">
            Découvrez vos véhicules neufs : Le meilleur choix au Maroc !
          </h1>
          <p className="text-gray-500">
            Trouvez des véhicules correspondant à votre budget parmi notre catalogue complet
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="hidden lg:block lg:col-span-1">
            <VehicleFilters
              brands={brands || []}
              categories={uniqueCategories}
              currentFilters={{
                brand,
                category,
                fuel,
                transmission,
                priceMin: priceMin?.toString(),
                priceMax: priceMax?.toString(),
                sort,
              }}
            />
          </aside>

          {/* Results */}
          <main className="lg:col-span-3">
            {/* Brand header when brand filter is active (D-36) */}
            {brand && (() => {
              const activeBrand = brands?.find((b) => b.id === brand)
              return activeBrand ? <BrandHeader brand={activeBrand as any} /> : null
            })()}

            {/* Quick-filter pills */}
            <div className="flex flex-wrap gap-2 mb-6">
              {quickFilters.map((f) => (
                <Link
                  key={f.params}
                  href={`/neuf?${f.params}`}
                  className="px-4 py-1.5 text-sm font-medium rounded-full border border-gray-200 text-gray-600 hover:border-[#006EFE] hover:text-[#006EFE] hover:bg-[#006EFE]/5 transition-all duration-150"
                >
                  {f.label}
                </Link>
              ))}
            </div>

            {/* Results Header */}
            <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-card border border-gray-200">
              <p className="text-sm text-gray-500">
                {count !== null ? (
                  <>
                    <span className="font-semibold text-secondary">{count}</span> véhicule
                    {count > 1 ? 's' : ''} trouvé{count > 1 ? 's' : ''}
                  </>
                ) : (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-secondary" />
                    <span>Recherche en cours...</span>
                  </span>
                )}
              </p>

              {/* Quick Links */}
              <div className="flex gap-2">
                <Link
                  href="/neuf/nouveautes"
                  className="text-sm text-secondary hover:text-secondary-400 hover:underline font-medium transition-all duration-300"
                >
                  Nouveautés
                </Link>
                <span className="text-gray-400">•</span>
                <Link
                  href="/neuf/populaires"
                  className="text-sm text-secondary hover:text-secondary-400 hover:underline font-medium transition-all duration-300"
                >
                  Populaires
                </Link>
                <span className="text-gray-400">•</span>
                <Link
                  href="/neuf/promotions"
                  className="text-sm text-secondary hover:text-secondary-400 hover:underline font-medium transition-all duration-300"
                >
                  Promotions
                </Link>
              </div>
            </div>

            {/* Vehicle Grid */}
            {vehicles && vehicles.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                  {vehicles.map((vehicle) => (
                    <VehicleCard
                      key={vehicle.id}
                      vehicle={vehicle as any}
                      showBadges
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2">
                    {page > 1 && (
                      <Link
                        href={`?${new URLSearchParams({ ...searchParams, page: (page - 1).toString() }).toString()}`}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-md text-gray-700 hover:bg-secondary/20 hover:border-secondary hover:shadow-gold transition-all duration-300"
                      >
                        Précédent
                      </Link>
                    )}

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1
                      return (
                        <Link
                          key={pageNum}
                          href={`?${new URLSearchParams({ ...searchParams, page: pageNum.toString() }).toString()}`}
                          className={`px-4 py-2 rounded-md transition-all duration-300 ${
                            pageNum === page
                              ? 'bg-secondary text-white font-semibold shadow-gold ring-2 ring-secondary/50'
                              : 'bg-white border border-gray-200 text-gray-700 hover:bg-secondary/20 hover:border-secondary hover:shadow-gold'
                          }`}
                        >
                          {pageNum}
                        </Link>
                      )
                    })}

                    {page < totalPages && (
                      <Link
                        href={`?${new URLSearchParams({ ...searchParams, page: (page + 1).toString() }).toString()}`}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-md text-gray-700 hover:bg-secondary/20 hover:border-secondary hover:shadow-gold transition-all duration-300"
                      >
                        Suivant
                      </Link>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
                <p className="text-gray-500 mb-4">
                  Aucun véhicule ne correspond à vos critères de recherche.
                </p>
                <Link
                  href="/neuf"
                  className="inline-block px-6 py-3 bg-secondary hover:bg-secondary-400 text-white font-semibold rounded-xl shadow-gold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  Réinitialiser les filtres
                </Link>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
