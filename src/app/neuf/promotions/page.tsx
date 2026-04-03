import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { VehicleCard } from '@/components/vehicles/VehicleCard'
import type { VehicleNew } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Promotions Voitures Neuves au Maroc',
  description: 'Profitez des meilleures promotions sur les voitures neuves au Maroc. Remises, offres spéciales et prix barrés chez les concessionnaires.',
  alternates: {
    canonical: 'https://tomobile360.ma/neuf/promotions',
  },
}

export const revalidate = 60

export default async function PromotionsPage() {
  const supabase = await createClient()

  const { data: vehicles } = await supabase
    .from('vehicles_new')
    .select(`
      *,
      brands:brand_id (name, logo_url),
      models:model_id (name),
      promotions (discount_percentage, is_active)
    `)
    .eq('is_featured_offer', true)
    .order('created_at', { ascending: false })

  const count = vehicles?.length || 0

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
            Offres Spéciales du Moment
          </h1>
          <p className="text-gray-500">
            Découvrez nos véhicules sélectionnés en offre spéciale
          </p>
        </div>

        {/* Results Count */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-card border border-gray-200">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-secondary">{count}</span>{' '}
            offre{count > 1 ? 's' : ''} spéciale{count > 1 ? 's' : ''}
          </p>
        </div>

        {/* Vehicles Grid */}
        {vehicles && vehicles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle as VehicleNew} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
            <p className="text-gray-500">
              Aucune offre spéciale disponible pour le moment.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
