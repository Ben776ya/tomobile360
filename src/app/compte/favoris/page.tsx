import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VehicleCard } from '@/components/vehicles/VehicleCard'
import { UsedListingCard } from '@/components/vehicles/UsedListingCard'

export default async function FavoritesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch user's favorites
  const { data: favorites } = await supabase
    .from('favorites')
    .select(`
      id,
      created_at,
      vehicle_type,
      vehicle_new_id,
      vehicle_used_id
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch new vehicles
  const newVehicleIds = favorites
    ?.filter((f) => f.vehicle_type === 'new' && f.vehicle_new_id)
    .map((f) => f.vehicle_new_id) || []

  const { data: newVehicles } = newVehicleIds.length > 0
    ? await supabase
        .from('vehicles_new')
        .select(`
          *,
          brands:brand_id (name, logo_url),
          models:model_id (name)
        `)
        .in('id', newVehicleIds)
    : { data: [] }

  // Fetch used vehicles
  const usedVehicleIds = favorites
    ?.filter((f) => f.vehicle_type === 'used' && f.vehicle_used_id)
    .map((f) => f.vehicle_used_id) || []

  const { data: usedVehicles } = usedVehicleIds.length > 0
    ? await supabase
        .from('vehicles_used')
        .select(`
          *,
          brands:brand_id (name, logo_url),
          models:model_id (name),
          profiles:user_id (full_name, avatar_url)
        `)
        .in('id', usedVehicleIds)
    : { data: [] }

  const hasNoFavorites = !favorites || favorites.length === 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">
          Mes favoris
        </h1>
        <p className="text-gray-500">
          Retrouvez tous les véhicules que vous avez sauvegardés
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-card border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Véhicules neufs</p>
          <p className="text-2xl font-bold text-secondary">
            {newVehicles?.length || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-card border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Véhicules d&apos;occasion</p>
          <p className="text-2xl font-bold text-secondary">
            {usedVehicles?.length || 0}
          </p>
        </div>
      </div>

      {/* New Vehicles */}
      {newVehicles && newVehicles.length > 0 && (
        <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-primary mb-6">
            Véhicules neufs favoris
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newVehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} showBadges />
            ))}
          </div>
        </div>
      )}

      {/* Used Vehicles */}
      {usedVehicles && usedVehicles.length > 0 && (
        <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-primary mb-6">
            Véhicules d&apos;occasion favoris
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {usedVehicles.map((vehicle) => (
              <UsedListingCard key={vehicle.id} listing={vehicle} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {hasNoFavorites && (
        <div className="bg-white rounded-lg shadow-card border border-gray-200 p-12 text-center">
          <Heart className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-primary mb-2">
            Vous n&apos;avez pas encore de favoris
          </h3>
          <p className="text-gray-500 mb-6">
            Explorez notre catalogue et sauvegardez vos véhicules préférés
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/neuf">
              <Button variant="outline" className="shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                Véhicules neufs
              </Button>
            </Link>
            <Link href="/occasion">
              <Button className="shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                Véhicules d&apos;occasion
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
