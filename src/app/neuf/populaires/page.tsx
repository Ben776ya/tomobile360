import Link from 'next/link'
import { ArrowRight, ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ModelCard } from '@/components/vehicles/ModelCard'
import { buildModelGroups } from '@/lib/vehicles/group-by-model'
import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo/page-metadata'
import { hasSelection } from '@/lib/seo/selection-pages'

export async function generateMetadata(): Promise<Metadata> {
  const metadata = pageMetadata({
    title: 'Modèles Populaires : la Sélection de la Rédaction',
    description: 'Les modèles neufs populaires sélectionnés par la rédaction Tomobile 360 : prix au Maroc, fiches techniques et comparatifs.',
    path: '/neuf/populaires',
  })
  // Empty state while no vehicle is selected: keep it out of search results.
  const supabase = await createClient()
  return (await hasSelection(supabase, 'is_popular')) ? metadata : { ...metadata, robots: { index: false } }
}

export const revalidate = 60

export default async function PopularVehiclesPage() {
  const supabase = await createClient()

  const { data: vehicles } = await supabase
    .from('vehicles_new')
    .select(`
      id, images, price_min, price_max, is_new_release, is_popular, version, year, fuel_type, transmission, brand_id, model_id,
      brands:brand_id (name, logo_url),
      models:model_id (name),
      promotions (discount_percentage, is_active)
    `)
    .eq('is_popular', true)
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
            Modèles Populaires
          </h1>
          <p className="text-gray-500">
            Une sélection de modèles établie par la rédaction Tomobile 360
          </p>
        </div>

        {modelGroups.length > 0 && (
          <div className="mb-6 bg-white p-4 rounded-lg shadow-card border border-gray-200">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-secondary">
                {modelGroups.length}
              </span>{' '}
              véhicule{modelGroups.length > 1 ? 's' : ''} populaire{modelGroups.length > 1 ? 's' : ''}
            </p>
          </div>
        )}

        {modelGroups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {modelGroups.map((mg) => (
              <ModelCard key={mg.modelId} model={mg} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
            <p className="text-lg font-semibold text-primary mb-2">
              Aucun modèle dans cette sélection pour le moment.
            </p>
            <p className="text-gray-500 mb-6">
              Comparez les prix et les fiches techniques de tous les modèles neufs dans notre catalogue.
            </p>
            <Link
              href="/neuf"
              className="inline-flex items-center gap-2 px-8 py-3 bg-secondary text-white hover:bg-secondary-400 font-semibold rounded-xl transition-all duration-300 hover:shadow-lg"
            >
              Voir le catalogue des voitures neuves
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
