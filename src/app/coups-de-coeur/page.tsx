import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CoupDeCoeurCard } from '@/components/vehicles/CoupDeCoeurCard'
import { Car, Mountain, Truck, Zap } from 'lucide-react'
import type { CoupDeCoeurCategory } from '@/lib/types'

export const revalidate = 60

export const metadata = {
  title: 'Nos Coups de Cœur | Tomobile 360',
  description: 'Notre sélection des meilleurs véhicules par segment : Voiture, SUV, Pick-up et Électrique.',
}

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

const VALID_CATEGORIES = CATEGORIES.map(c => c.value)

interface SearchParams {
  categorie?: string
}

export default async function CoupsDeCoeurPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = await createClient()

  const rawCategory = searchParams.categorie
  const activeCategory: CoupDeCoeurCategory =
    rawCategory && VALID_CATEGORIES.includes(rawCategory as CoupDeCoeurCategory)
      ? (rawCategory as CoupDeCoeurCategory)
      : 'voiture'

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
    .eq('coup_de_coeur_category', activeCategory)
    .order('created_at', { ascending: false })

  const activeCat = CATEGORIES.find(c => c.value === activeCategory)!

  return (
    <div className="min-h-screen bg-[#F2F4F6]">

      {/* Hero Banner */}
      <div className={`bg-gradient-to-r ${activeCat.gradient} py-8 sm:py-14 px-4`}>
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm mb-5 shadow-lg">
            <activeCat.Icon className="w-8 h-8 text-white" />
          </div>
          <p className="text-white/70 text-xs sm:text-sm font-semibold tracking-widest uppercase mb-2">
            Nos Coups de Cœur
          </p>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-3 font-display">
            {activeCat.label}
          </h1>
          <p className="text-white/85 text-lg font-medium mb-1">{activeCat.tagline}</p>
          <p className="text-white/60 text-sm">{activeCat.description}</p>
        </div>
      </div>

      {/* Sticky Category Tabs */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto">
            {CATEGORIES.map((cat) => {
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
        {vehicles && vehicles.length > 0 ? (
          <>
            <p className="text-sm text-gray-400 mb-6 font-medium">
              <span className="font-bold" style={{ color: activeCat.color }}>
                {vehicles.length}
              </span>{' '}
              véhicule{vehicles.length > 1 ? 's' : ''} dans cette sélection
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {vehicles.map((vehicle) => (
                <CoupDeCoeurCard key={vehicle.id} vehicle={vehicle as any} category={activeCategory} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-24">
            <div
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 opacity-20"
              style={{ backgroundColor: activeCat.color }}
            >
              <activeCat.Icon className="w-10 h-10 text-white" />
            </div>
            <p className="text-gray-400 text-lg font-medium mb-1">
              Notre sélection <span className="font-bold">{activeCat.label}</span> arrive bientôt.
            </p>
            <p className="text-gray-300 text-sm">Revenez nous voir prochainement.</p>
          </div>
        )}
      </div>

    </div>
  )
}
