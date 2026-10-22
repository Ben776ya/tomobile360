import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ModelCard } from '@/components/vehicles/ModelCard'
import { buildModelGroups } from '@/lib/vehicles/group-by-model'
import { ArrowRight, Car, Mountain, Truck, Zap } from 'lucide-react'
import type { CoupDeCoeurCategory } from '@/lib/types'
import { pageMetadata } from '@/lib/seo/page-metadata'

export const revalidate = 60

export const metadata = pageMetadata({
  title: 'Nos Coups de Coeur',
  description: 'Notre sélection des meilleurs véhicules par segment : Voiture, SUV, Pick-up et Électrique.',
  path: '/coups-de-coeur',
})

type CategoryConfig = {
  value: CoupDeCoeurCategory
  label: string
  Icon: React.ComponentType<{ className?: string }>
  color: string
  gradient: string
  description: string
  tagline: string
}

const CATEGORIES: CategoryConfig[] = [
  {
    value: 'voiture',
    label: 'Voiture',
    Icon: Car,
    color: '#3B82F6',
    gradient: 'from-blue-600 to-blue-400',
    description: 'Citadines, berlines et compactes',
    tagline: 'Le meilleur de la voiture du quotidien',
  },
  {
    value: 'suv',
    label: 'SUV',
    Icon: Mountain,
    color: '#0D9488',
    gradient: 'from-teal-600 to-teal-400',
    description: 'SUVs et crossovers toutes tailles',
    tagline: 'Polyvalence & Prestance',
  },
  {
    value: 'pickup',
    label: 'Pick-up',
    Icon: Truck,
    color: '#F97316',
    gradient: 'from-orange-600 to-orange-400',
    description: 'Pick-ups et utilitaires double cabine',
    tagline: 'Robustesse & Capacité',
  },
  {
    value: 'electrique',
    label: 'Électrique',
    Icon: Zap,
    color: '#6366F1',
    gradient: 'from-indigo-600 to-indigo-400',
    description: 'Véhicules électriques et hybrides rechargeables',
    tagline: 'Innovation & Avenir',
  },
]

interface SearchParams {
  categorie?: string
}

export default async function CoupsDeCoeurPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = await createClient()

  const { data: vehicles } = await supabase
    .from('vehicles_new')
    .select(`
      id, images, price_min, price_max, is_new_release, is_popular, is_coup_de_coeur, coup_de_coeur_category, version, year, fuel_type, transmission, horsepower, brand_id, model_id,
      brands:brand_id (name, logo_url),
      models:model_id (name),
      promotions (discount_percentage, is_active)
    `)
    .eq('is_coup_de_coeur', true)
    .eq('is_available', true)
    .order('price_min', { ascending: true, nullsFirst: false })

  // Only segments that have at least one pick get a tab: an empty segment is
  // hidden rather than announced as coming soon.
  const segments = CATEGORIES
    .map((cat) => ({
      cat,
      modelGroups: buildModelGroups(
        (vehicles ?? []).filter(v => v.coup_de_coeur_category === cat.value) as unknown as Parameters<typeof buildModelGroups>[0]
      ),
    }))
    .filter(s => s.modelGroups.length > 0)
  const active = segments.find(s => s.cat.value === searchParams.categorie) ?? segments[0]

  if (!active) {
    return (
      <div className="min-h-screen bg-[#F2F4F6]">
        <div className="container mx-auto px-4 py-16 sm:py-24 text-center">
          <h1 className="text-2xl sm:text-4xl font-bold text-primary mb-3 font-display">
            Nos Coups de Cœur
          </h1>
          <p className="text-gray-500 mb-6">
            Aucune sélection n&apos;est publiée pour le moment. Comparez les prix et les fiches
            techniques de tous les modèles neufs dans notre catalogue.
          </p>
          <Link
            href="/neuf"
            className="inline-flex items-center gap-2 px-8 py-3 bg-secondary text-white hover:bg-secondary-400 font-semibold rounded-xl transition-all duration-300 hover:shadow-lg"
          >
            Voir le catalogue des voitures neuves
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    )
  }

  const activeCat = active.cat
  const activeCategory = activeCat.value
  const modelGroups = active.modelGroups

  return (
    <div className="min-h-screen bg-[#F2F4F6]">

      {/* Hero Banner */}
      <div className={`bg-gradient-to-r ${activeCat.gradient} py-8 sm:py-14 px-4`}>
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/15 mb-5 shadow-lg">
            <activeCat.Icon className="w-8 h-8 text-white" />
          </div>
          <p className="text-white/70 text-xs sm:text-sm font-semibold tracking-widest uppercase mb-2">
            Nos Coups de Cœur
          </p>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-3 font-display">
            {activeCat.label}
          </h1>
          <p className="text-white/85 text-lg font-medium mb-1">{activeCat.tagline}</p>
          <p className="text-white/85 text-sm">{activeCat.description}</p>
        </div>
      </div>

      {/* Sticky Category Tabs */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto">
            {segments.map(({ cat }) => {
              const isActive = activeCategory === cat.value
              const Icon = cat.Icon
              return (
                <Link
                  key={cat.value}
                  href={`/coups-de-coeur?categorie=${cat.value}`}
                  className={`
                    flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 text-sm font-semibold whitespace-nowrap
                    border-b-[3px] transition-all duration-200 flex-shrink-0
                    ${isActive
                      ? 'border-current'
                      : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200'
                    }
                  `}
                  style={isActive ? { color: cat.color, borderColor: cat.color } : undefined}
                >
                  <Icon className="w-4 h-4" />
                  {cat.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="container mx-auto px-4 py-10">
        <p className="text-sm text-gray-400 mb-6 font-medium">
          <span className="font-bold" style={{ color: activeCat.color }}>
            {modelGroups.length}
          </span>{' '}
          véhicule{modelGroups.length > 1 ? 's' : ''} dans cette sélection
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {modelGroups.map((mg) => (
            <ModelCard key={mg.modelId} model={mg} />
          ))}
        </div>
      </div>

    </div>
  )
}
