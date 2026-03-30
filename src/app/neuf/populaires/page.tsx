import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { VehicleCard } from '@/components/vehicles/VehicleCard'

export const metadata: Metadata = {
  title: 'Voitures Populaires au Maroc | Tomobile 360',
  description: 'Les voitures neuves les plus populaires au Maroc. Comparez les modèles les plus vendus et trouvez votre prochaine voiture.',
}

export const revalidate = 60

export default async function PopularVehiclesPage() {
  const supabase = await createClient()

  const { data: vehicles } = await supabase
    .from('vehicles_new')
    .select(`
      *,
      brands:brand_id (name, logo_url),
      models:model_id (name),
      promotions (discount_percentage, is_active)
    `)
    .eq('is_popular', true)
    .order('views', { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/neuf"
            className="inline-flex items-center gap-2 text-secondary hover:text-secondary-400 mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            Retour aux véhicules neufs
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
            Véhicules Populaires
          </h1>
          <p className="text-gray-500">
            Les modèles les plus consultés et appréciés par nos visiteurs
          </p>
        </div>

        {/* Results Count */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-card border border-gray-200">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-secondary">
              {vehicles?.length || 0}
            </span>{' '}
            véhicule{vehicles && vehicles.length > 1 ? 's' : ''} populaire
            {vehicles && vehicles.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Vehicle Grid */}
        {vehicles && vehicles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} showBadges />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
            <p className="text-gray-500">
              Aucun véhicule populaire disponible pour le moment.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
