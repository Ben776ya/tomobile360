import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ModelCard } from '@/components/vehicles/ModelCard'
import { buildModelGroups } from '@/lib/vehicles/group-by-model'
import { pageMetadata } from '@/lib/seo/page-metadata'

export const metadata = pageMetadata({
  title: 'Promotions Voitures Neuves au Maroc',
  description: 'Profitez des meilleures promotions sur les voitures neuves au Maroc. Remises, offres spéciales et prix barrés chez les concessionnaires.',
  path: '/neuf/promotions',
})

export const revalidate = 60

export default async function PromotionsPage() {
  const supabase = await createClient()

  const { data: vehicles } = await supabase
    .from('vehicles_new')
    .select(`
      id, images, price_min, price_max, is_new_release, is_popular, version, year, fuel_type, transmission, brand_id, model_id,
      brands:brand_id (name, logo_url),
      models:model_id (name),
      promotions (discount_percentage, is_active)
    `)
    .eq('is_featured_offer', true)
    .eq('is_available', true)
    .order('price_min', { ascending: true, nullsFirst: false })

  const modelGroups = buildModelGroups((vehicles ?? []) as unknown as Parameters<typeof buildModelGroups>[0])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
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

        <div className="mb-6 bg-white p-4 rounded-lg shadow-card border border-gray-200">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-secondary">{modelGroups.length}</span>{' '}
            offre{modelGroups.length > 1 ? 's' : ''} spéciale{modelGroups.length > 1 ? 's' : ''}
          </p>
        </div>

        {modelGroups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modelGroups.map((mg) => (
              <ModelCard key={mg.modelId} model={mg} />
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
