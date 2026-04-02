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
  model?: string
  category?: string
  fuel?: string
  transmission?: string
  priceMin?: string
  priceMax?: string
  yearMin?: string
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
  const model = searchParams.model
  const category = searchParams.category
  const fuel = searchParams.fuel
  const transmission = searchParams.transmission
  const priceMin = searchParams.priceMin ? parseInt(searchParams.priceMin) : undefined
  const priceMax = searchParams.priceMax ? parseInt(searchParams.priceMax) : undefined
  const yearMin = searchParams.yearMin ? parseInt(searchParams.yearMin) : undefined
  // Default to price ascending when filtering by brand (guide d'achat)
  const sort = searchParams.sort || (brand ? 'price-asc' : 'newest')
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
    .eq('is_available', true)

  // Apply filters
  if (brand) query = query.eq('brand_id', brand)
  if (model) query = query.eq('model_id', model)
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
  if (yearMin) query = query.gte('year', yearMin)

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
    { data: allModels },
  ] = await Promise.all([
    supabase.from('brands').select('id, name, logo_url, description, created_at').order('name'),
    supabase.from('models').select('category').order('category'),
    supabase.from('models').select('id, brand_id, name, category').order('name'),
  ])

  // Get unique categories
  const uniqueCategories = categories
    ? Array.from(new Set(categories.map(c => c.category).filter(Boolean)))
    : []

  const totalPages = count ? Math.ceil(count / itemsPerPage) : 0

  const quickFilters = [
    { label: 'Moins de 100 000 DH', key: 'priceMax', value: '100000' },
    { label: 'SUV / 4x4', key: 'category', value: 'SUV' },
    { label: 'Électrique', key: 'fuel', value: 'Electric' },
    { label: `Récent (< 3 ans)`, key: 'yearMin', value: `${new Date().getFullYear() - 3}` },
    { label: 'Moins de 200 000 DH', key: 'priceMax', value: '200000' },
  ]

  // Build quick filter hrefs that preserve existing filters
  const buildQuickFilterHref = (key: string, value: string) => {
    const params = new URLSearchParams()
    // Preserve existing filters
    if (brand) params.set('brand', brand)
    if (model) params.set('model', model)
    if (category && key !== 'category') params.set('category', category)
    if (fuel && key !== 'fuel') params.set('fuel', fuel)
    if (transmission) params.set('transmission', transmission)
    if (priceMin && key !== 'priceMax' && key !== 'priceMin') params.set('priceMin', priceMin.toString())
    if (priceMax && key !== 'priceMax' && key !== 'priceMin') params.set('priceMax', priceMax.toString())
    if (yearMin && key !== 'yearMin') params.set('yearMin', yearMin.toString())
    if (searchParams.sort) params.set('sort', searchParams.sort)
    // Toggle: if already active, remove it; otherwise set it
    const currentValue = searchParams[key as keyof SearchParams]
    if (currentValue !== value) {
      params.set(key, value)
    }
    // Reset page
    return `/neuf?${params.toString()}`
  }

  const isQuickFilterActive = (key: string, value: string) => {
    return searchParams[key as keyof SearchParams] === value
  }

  const activeFilterCount = [brand, model, category, fuel, transmission, priceMin, priceMax, yearMin].filter(Boolean).length

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

        <div className="lg:hidden mb-4">
          <details className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <summary className="flex items-center justify-between p-4 cursor-pointer font-bold text-slate-700">
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-[#006EFE]" />
                Filtres
                {activeFilterCount > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-[#006EFE] rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </span>
            </summary>
            <div className="border-t border-gray-200">
              <VehicleFilters
                brands={brands || []}
                models={allModels || []}
                categories={uniqueCategories}
                currentFilters={{
                  brand,
                  model,
                  category,
                  fuel,
                  transmission,
                  priceMin: priceMin?.toString(),
                  priceMax: priceMax?.toString(),
                  sort,
                }}
              />
            </div>
          </details>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="hidden lg:block lg:col-span-1">
            <VehicleFilters
              brands={brands || []}
              models={allModels || []}
              categories={uniqueCategories}
              currentFilters={{
                brand,
                model,
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
              {quickFilters.map((f) => {
                const active = isQuickFilterActive(f.key, f.value)
                return (
                  <Link
                    key={`${f.key}-${f.value}`}
                    href={buildQuickFilterHref(f.key, f.value)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-full border transition-all duration-150 ${
                      active
                        ? 'border-[#006EFE] bg-[#006EFE] text-white'
                        : 'border-gray-200 text-gray-600 hover:border-[#006EFE] hover:text-[#006EFE] hover:bg-[#006EFE]/5'
                    }`}
                  >
                    {f.label}
                  </Link>
                )
              })}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
                  {vehicles.map((vehicle) => (
                    <VehicleCard
                      key={vehicle.id}
                      vehicle={vehicle as any}
                      showBadges
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (() => {
                  // Sliding window: show 5 pages centered on current page
                  const windowSize = 5
                  let startPage = Math.max(1, page - Math.floor(windowSize / 2))
                  const endPage = Math.min(totalPages, startPage + windowSize - 1)
                  startPage = Math.max(1, endPage - windowSize + 1)

                  const buildHref = (p: number) =>
                    `?${new URLSearchParams({ ...searchParams, page: p.toString() }).toString()}`

                  return (
                    <div className="flex justify-center gap-2">
                      {page > 1 && (
                        <Link
                          href={buildHref(page - 1)}
                          className="px-4 py-2 bg-white border border-gray-200 rounded-md text-gray-700 hover:bg-secondary/20 hover:border-secondary hover:shadow-gold transition-all duration-300"
                        >
                          Précédent
                        </Link>
                      )}

                      {startPage > 1 && (
                        <>
                          <Link href={buildHref(1)} className="px-4 py-2 bg-white border border-gray-200 rounded-md text-gray-700 hover:bg-secondary/20 hover:border-secondary hover:shadow-gold transition-all duration-300">1</Link>
                          {startPage > 2 && <span className="px-2 py-2 text-gray-400">…</span>}
                        </>
                      )}

                      {Array.from({ length: endPage - startPage + 1 }, (_, i) => {
                        const pageNum = startPage + i
                        return (
                          <Link
                            key={pageNum}
                            href={buildHref(pageNum)}
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

                      {endPage < totalPages && (
                        <>
                          {endPage < totalPages - 1 && <span className="px-2 py-2 text-gray-400">…</span>}
                          <Link href={buildHref(totalPages)} className="px-4 py-2 bg-white border border-gray-200 rounded-md text-gray-700 hover:bg-secondary/20 hover:border-secondary hover:shadow-gold transition-all duration-300">{totalPages}</Link>
                        </>
                      )}

                      {page < totalPages && (
                        <Link
                          href={buildHref(page + 1)}
                          className="px-4 py-2 bg-white border border-gray-200 rounded-md text-gray-700 hover:bg-secondary/20 hover:border-secondary hover:shadow-gold transition-all duration-300"
                        >
                          Suivant
                        </Link>
                      )}
                    </div>
                  )
                })()}
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
