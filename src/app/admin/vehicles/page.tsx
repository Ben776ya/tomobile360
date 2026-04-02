import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Car, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import { VehicleActions } from '@/components/admin/VehicleActions'
import { BrandFilterSelect } from '@/components/admin/BrandFilterSelect'

export const revalidate = 30

interface SearchParams {
  tab?: string
  page?: string
  brand?: string
}

export default async function AdminVehiclesPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = await createClient()

  const tab = searchParams.tab || 'new'
  const page = parseInt(searchParams.page || '1')
  const itemsPerPage = 20
  const brandFilter = searchParams.brand

  // Fetch vehicles based on tab
  let vehicles: any[] = []
  let count = 0

  if (tab === 'new') {
    let query = supabase
      .from('vehicles_new')
      .select(`
        id, year, price_min, price_max, is_popular, is_new_release, is_coup_de_coeur, coup_de_coeur_category, is_featured_offer, is_available, images, created_at, brand_id,
        brands:brand_id (name, logo_url),
        models:model_id (name)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * itemsPerPage, page * itemsPerPage - 1)

    if (brandFilter) {
      query = query.eq('brand_id', brandFilter)
    }

    const { data, count: total } = await query

    vehicles = data || []
    count = total || 0
  } else {
    const { data, count: total } = await supabase
      .from('vehicles_used')
      .select(`
        *,
        brands:brand_id (name, logo_url),
        models:model_id (name),
        profiles:user_id (full_name)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * itemsPerPage, page * itemsPerPage - 1)

    vehicles = data || []
    count = total || 0
  }

  const { data: allBrands } = await supabase
    .from('brands')
    .select('id, name')
    .order('name', { ascending: true })

  const totalPages = Math.ceil(count / itemsPerPage)

  const brandParam = brandFilter ? `&brand=${brandFilter}` : ''

  return (
    <>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Gestion des véhicules
              </h1>
              <p className="text-dark-200">
                Gérez les véhicules neufs et les annonces d&apos;occasion
              </p>
            </div>
            <Link href="/admin/vehicles/new">
              <Button className="shadow-dark-card hover:shadow-dark-elevated transition-all">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un véhicule
              </Button>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg shadow-dark-card border border-white/10 mb-6 p-1.5">
          <div className="flex gap-1">
            <Link
              href="/admin/vehicles?tab=new"
              className={`flex-1 px-6 py-3 text-center font-medium rounded-md transition-all duration-200 ${
                tab === 'new'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-dark-300 hover:bg-dark-600/50 hover:text-secondary hover:shadow-sm'
              }`}
            >
              Véhicules neufs
            </Link>
            <Link
              href="/admin/vehicles?tab=used"
              className={`flex-1 px-6 py-3 text-center font-medium rounded-md transition-all duration-200 ${
                tab === 'used'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-dark-300 hover:bg-dark-600/50 hover:text-secondary hover:shadow-sm'
              }`}
            >
              Annonces d&apos;occasion
            </Link>
          </div>
        </div>

        {/* Brand Filter */}
        {tab === 'new' && allBrands && allBrands.length > 0 && (
          <div className="mb-4">
            <BrandFilterSelect brands={allBrands} currentBrand={brandFilter} tab={tab} />
          </div>
        )}

        {/* Vehicles Table */}
        <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg shadow-dark-card border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-600/50 border-b border-white/10">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-dark-200">
                    Véhicule
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-dark-200">
                    Prix
                  </th>
                  {tab === 'new' ? (
                    <th className="px-6 py-3 text-left text-sm font-semibold text-dark-200">
                      Badges
                    </th>
                  ) : (
                    <th className="px-6 py-3 text-left text-sm font-semibold text-dark-200">
                      Vendeur
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-sm font-semibold text-dark-200">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-dark-200">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-dark-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-white/5 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-16 h-16 bg-dark-600/50 rounded overflow-hidden flex-shrink-0">
                          {vehicle.images?.[0] ? (
                            <Image
                              src={vehicle.images[0]}
                              alt="Vehicle"
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Car className="h-6 w-6 text-dark-300" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {vehicle.brands?.name} {vehicle.models?.name}
                          </p>
                          <p className="text-sm text-dark-300">
                            {vehicle.year}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-secondary">
                        {tab === 'new'
                          ? formatPrice(vehicle.price_min || vehicle.price_max || 0)
                          : formatPrice(vehicle.price || 0)}
                      </span>
                    </td>
                    {tab === 'new' ? (
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {vehicle.is_popular && (
                            <Badge variant="secondary">Populaire</Badge>
                          )}
                          {vehicle.is_new_release && (
                            <Badge variant="warning">Nouveauté</Badge>
                          )}
                          {vehicle.is_coup_de_coeur && (
                            <Badge className="bg-pink-100 text-pink-700 border border-pink-300 hover:bg-pink-100">
                              ♥ {vehicle.coup_de_coeur_category}
                            </Badge>
                          )}
                          {vehicle.is_featured_offer && (
                            <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-300 hover:bg-emerald-100">
                              Offre
                            </Badge>
                          )}
                        </div>
                      </td>
                    ) : (
                      <td className="px-6 py-4">
                        <p className="text-sm text-dark-300">
                          {vehicle.profiles?.full_name || 'Anonyme'}
                        </p>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      {tab === 'new' ? (
                        vehicle.is_available ? (
                          <Badge variant="default">Actif</Badge>
                        ) : (
                          <Badge variant="outline" className="border-white/10 text-dark-400">Inactif</Badge>
                        )
                      ) : vehicle.is_active ? (
                        vehicle.is_sold ? (
                          <Badge variant="secondary">Vendu</Badge>
                        ) : (
                          <Badge variant="default">Actif</Badge>
                        )
                      ) : (
                        <Badge variant="outline">Inactif</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-dark-300">
                        {new Date(vehicle.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <VehicleActions
                        vehicleId={vehicle.id}
                        vehicleType={tab === 'new' ? 'new' : 'used'}
                        isPopular={tab === 'new' ? vehicle.is_popular : undefined}
                        isNewRelease={tab === 'new' ? vehicle.is_new_release : undefined}
                        isCoupDeCoeur={tab === 'new' ? vehicle.is_coup_de_coeur : undefined}
                        coupDeCoeurCategory={tab === 'new' ? vehicle.coup_de_coeur_category : undefined}
                        isFeaturedOffer={tab === 'new' ? vehicle.is_featured_offer : undefined}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {vehicles.length === 0 && (
            <div className="p-12 text-center">
              <Car className="h-16 w-16 mx-auto mb-4 text-dark-300" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Aucun véhicule trouvé
              </h3>
              <p className="text-dark-300 mb-4">
                Commencez par ajouter votre premier véhicule
              </p>
              <Link href="/admin/vehicles/new">
                <Button className="shadow-dark-card hover:shadow-dark-elevated transition-all">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un véhicule
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {page > 1 && (
              <Link href={`/admin/vehicles?tab=${tab}&page=${page - 1}${brandParam}`}>
                <Button variant="outline" className="shadow-dark-card hover:shadow-dark-elevated transition-all border-white/10 text-dark-200 hover:text-white">Précédent</Button>
              </Link>
            )}
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = i + 1 + Math.max(0, page - 3)
                return p <= totalPages ? (
                  <Link key={p} href={`/admin/vehicles?tab=${tab}&page=${p}${brandParam}`}>
                    <Button variant={p === page ? 'default' : 'outline'} size="sm" className={`shadow-dark-card hover:shadow-dark-elevated transition-all ${p !== page ? 'border-white/10 text-dark-200 hover:text-white' : ''}`}>
                      {p}
                    </Button>
                  </Link>
                ) : null
              })}
            </div>
            {page < totalPages && (
              <Link href={`/admin/vehicles?tab=${tab}&page=${page + 1}${brandParam}`}>
                <Button variant="outline" className="shadow-dark-card hover:shadow-dark-elevated transition-all border-white/10 text-dark-200 hover:text-white">Suivant</Button>
              </Link>
            )}
          </div>
        )}
    </>
  )
}
