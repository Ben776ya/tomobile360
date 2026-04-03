import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ModelCard, type ModelGroup } from '@/components/vehicles/ModelCard'
import { VehicleFilters } from '@/components/vehicles/VehicleFilters'
import { BrandHeader } from '@/components/vehicles/BrandHeader'
import { SlidersHorizontal } from 'lucide-react'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'

export const revalidate = 60

export const metadata = {
  title: 'Voitures Neuves au Maroc 2026 — Prix, Fiches Techniques et Comparatifs',
  description: 'Consultez le catalogue complet des voitures neuves au Maroc : prix, équipements, puissance fiscale. Comparez et trouvez le modèle idéal.',
  alternates: {
    canonical: 'https://tomobile360.ma/neuf',
  },
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
  const sort = searchParams.sort || (brand ? 'price-asc' : 'newest')
  const page = searchParams.page ? parseInt(searchParams.page) : 1
  const itemsPerPage = 12

  // Build query — fetch ALL matching vehicles (we group by model server-side)
  let query = supabase
    .from('vehicles_new')
    .select(`
      id, images, price_min, price_max, is_new_release, is_popular, version, year, fuel_type, transmission, horsepower, brand_id, model_id, created_at, views,
      brands:brand_id (name, logo_url),
      models:model_id (name),
      promotions (discount_percentage, is_active)
    `)
    .eq('is_available', true)

  // Apply filters
  if (brand) query = query.eq('brand_id', brand)
  if (model) query = query.eq('model_id', model)
  if (category) {
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
  if (priceMax) query = query.lte('price_min', priceMax)
  if (yearMin) query = query.gte('year', yearMin)

  // Sort at DB level for consistent ordering within groups
  query = query.order('price_min', { ascending: true })

  const { data: vehicles } = await query

  // Group vehicles by model
  type VehicleRow = NonNullable<typeof vehicles>[number]
  const modelMap: Record<string, VehicleRow[]> = {}
  for (const v of vehicles ?? []) {
    const key = v.model_id
    if (!modelMap[key]) modelMap[key] = []
    modelMap[key].push(v)
  }

  // Build model groups
  const modelGroups: ModelGroup[] = []
  for (const key of Object.keys(modelMap)) {
    const groupVehicles = modelMap[key]
    const representative = groupVehicles[0] // cheapest (sorted by price_min asc)
    const brandsRaw = representative.brands as unknown
    const brandData = (Array.isArray(brandsRaw) ? brandsRaw[0] : brandsRaw) as { name: string; logo_url: string | null } | null
    const modelsRaw = representative.models as unknown
    const modelData = (Array.isArray(modelsRaw) ? modelsRaw[0] : modelsRaw) as { name: string } | null

    if (!brandData || !modelData) continue

    const prices = groupVehicles.map((v: VehicleRow) => v.price_min).filter((p): p is number => p !== null)
    const minPrice = prices.length > 0 ? Math.min(...prices) : null

    const maxPrices = groupVehicles.map((v: VehicleRow) => v.price_max ?? v.price_min).filter((p): p is number => p !== null)
    const maxPrice = maxPrices.length > 0 ? Math.max(...maxPrices) : null

    const fuelSet: Record<string, boolean> = {}
    const transSet: Record<string, boolean> = {}
    for (const v of groupVehicles) {
      if (v.fuel_type) fuelSet[v.fuel_type] = true
      if (v.transmission) transSet[v.transmission] = true
    }
    const fuelTypes = Object.keys(fuelSet)
    const transmissions = Object.keys(transSet)

    const hasPromo = groupVehicles.some((v: VehicleRow) => {
      const promos = v.promotions as { discount_percentage: number | null; is_active?: boolean }[] | null
      return promos?.some((p: { discount_percentage: number | null; is_active?: boolean }) => p.discount_percentage && p.discount_percentage > 0 && p.is_active !== false)
    })

    modelGroups.push({
      brandId: representative.brand_id,
      brandName: brandData.name,
      brandLogo: brandData.logo_url,
      modelId: representative.model_id,
      modelName: modelData.name,
      minPrice,
      maxPrice,
      mainImage: representative.images?.[0] || '/placeholder-car.svg',
      versionCount: groupVehicles.length,
      fuelTypes,
      transmissions,
      hasNewRelease: groupVehicles.some((v: VehicleRow) => v.is_new_release),
      hasPopular: groupVehicles.some((v: VehicleRow) => v.is_popular),
      hasPromo,
      singleVehicleId: groupVehicles.length === 1 ? groupVehicles[0].id : undefined,
    })
  }

  // Sort model groups
  switch (sort) {
    case 'price-asc':
      modelGroups.sort((a, b) => (a.minPrice ?? Infinity) - (b.minPrice ?? Infinity))
      break
    case 'price-desc':
      modelGroups.sort((a, b) => (b.minPrice ?? 0) - (a.minPrice ?? 0))
      break
    case 'popular':
      // Models with popular badge first, then by version count
      modelGroups.sort((a, b) => (b.hasPopular ? 1 : 0) - (a.hasPopular ? 1 : 0) || b.versionCount - a.versionCount)
      break
    case 'newest':
    default:
      modelGroups.sort((a, b) => (b.hasNewRelease ? 1 : 0) - (a.hasNewRelease ? 1 : 0))
      break
  }

  // Paginate model groups
  const totalModels = modelGroups.length
  const totalPages = Math.ceil(totalModels / itemsPerPage)
  const from = (page - 1) * itemsPerPage
  const paginatedModels = modelGroups.slice(from, from + itemsPerPage)

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

  const uniqueCategories = categories
    ? Array.from(new Set(categories.map(c => c.category).filter(Boolean)))
    : []

  const quickFilters = [
    { label: 'Moins de 100 000 DH', key: 'priceMax', value: '100000' },
    { label: 'SUV / 4x4', key: 'category', value: 'SUV' },
    { label: 'Électrique', key: 'fuel', value: 'Electric' },
    { label: `Récent (< 3 ans)`, key: 'yearMin', value: `${new Date().getFullYear() - 3}` },
    { label: 'Moins de 200 000 DH', key: 'priceMax', value: '200000' },
  ]

  const buildQuickFilterHref = (key: string, value: string) => {
    const params = new URLSearchParams()
    if (brand) params.set('brand', brand)
    if (model) params.set('model', model)
    if (category && key !== 'category') params.set('category', category)
    if (fuel && key !== 'fuel') params.set('fuel', fuel)
    if (transmission) params.set('transmission', transmission)
    if (priceMin && key !== 'priceMax' && key !== 'priceMin') params.set('priceMin', priceMin.toString())
    if (priceMax && key !== 'priceMax' && key !== 'priceMin') params.set('priceMax', priceMax.toString())
    if (yearMin && key !== 'yearMin') params.set('yearMin', yearMin.toString())
    if (searchParams.sort) params.set('sort', searchParams.sort)
    const currentValue = searchParams[key as keyof SearchParams]
    if (currentValue !== value) {
      params.set(key, value)
    }
    return `/neuf?${params.toString()}`
  }

  const isQuickFilterActive = (key: string, value: string) => {
    return searchParams[key as keyof SearchParams] === value
  }

  const activeFilterCount = [brand, model, category, fuel, transmission, priceMin, priceMax, yearMin].filter(Boolean).length

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={[{ name: 'Voitures Neuves', href: '/neuf' }]} />
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2">
            Découvrez vos véhicules neufs : Le meilleur choix au Maroc !
          </h1>
          <p className="text-gray-500">
            Trouvez des véhicules correspondant à votre budget parmi notre catalogue complet
          </p>
        </div>

        {/* SEO Intro Text */}
        <div className="mb-8 bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-gray-600 text-sm leading-relaxed">
            Bienvenue sur le catalogue de voitures neuves de Tomobile 360. Retrouvez l&apos;ensemble des marques et modèles
            disponibles au Maroc avec leurs prix actualisés, fiches techniques détaillées et équipements de série.
            Que vous cherchiez une citadine économique, un SUV familial ou une berline premium, utilisez nos filtres
            pour affiner votre recherche par budget, type de carburant, puissance fiscale ou catégorie de véhicule.
            Comparez les versions et trouvez l&apos;offre qui correspond à vos besoins et à votre budget.
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
            {/* Brand header when brand filter is active */}
            {brand && (() => {
              const activeBrand = brands?.find((b) => b.id === brand)
              return activeBrand ? <BrandHeader brand={activeBrand as any} /> : null
            })()}

            {/* Quick-filter pills */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide sm:flex-wrap sm:overflow-visible sm:pb-0">
              {quickFilters.map((f) => {
                const active = isQuickFilterActive(f.key, f.value)
                return (
                  <Link
                    key={`${f.key}-${f.value}`}
                    href={buildQuickFilterHref(f.key, f.value)}
                    className={`whitespace-nowrap px-4 py-1.5 text-sm font-medium rounded-full border transition-all duration-150 ${
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 bg-white p-4 rounded-lg shadow-card border border-gray-200">
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-secondary">{totalModels}</span> modèle
                {totalModels > 1 ? 's' : ''} trouvé{totalModels > 1 ? 's' : ''}
                <span className="text-gray-400 ml-1">
                  ({(vehicles ?? []).length} version{(vehicles ?? []).length !== 1 ? 's' : ''})
                </span>
              </p>

              {/* Quick Links */}
              <div className="flex gap-2 text-xs sm:text-sm">
                <Link
                  href="/neuf/nouveautes"
                  className="text-secondary hover:text-secondary-400 hover:underline font-medium transition-all duration-300"
                >
                  Nouveautés
                </Link>
                <span className="text-gray-400">•</span>
                <Link
                  href="/neuf/populaires"
                  className="text-secondary hover:text-secondary-400 hover:underline font-medium transition-all duration-300"
                >
                  Populaires
                </Link>
                <span className="text-gray-400">•</span>
                <Link
                  href="/neuf/promotions"
                  className="text-secondary hover:text-secondary-400 hover:underline font-medium transition-all duration-300"
                >
                  Promotions
                </Link>
              </div>
            </div>

            {/* Model Grid */}
            {paginatedModels.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
                  {paginatedModels.map((mg) => (
                    <ModelCard key={mg.modelId} model={mg} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (() => {
                  const windowSize = 5
                  let startPage = Math.max(1, page - Math.floor(windowSize / 2))
                  const endPage = Math.min(totalPages, startPage + windowSize - 1)
                  startPage = Math.max(1, endPage - windowSize + 1)

                  const buildHref = (p: number) =>
                    `?${new URLSearchParams({ ...searchParams, page: p.toString() }).toString()}`

                  return (
                    <div className="flex flex-wrap justify-center gap-2">
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
