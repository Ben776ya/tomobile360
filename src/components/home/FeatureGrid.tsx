'use client'

import { useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Scale, Tag, TrendingUp, Heart, ChevronRight, Plus, X, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { VehicleSelector } from '@/components/vehicles/VehicleSelector'
import { ComparisonTable } from '@/components/vehicles/ComparisonTable'
import { formatPrice } from '@/lib/utils'

interface VehicleData {
  id: string
  year: number
  price_min: number | null
  images: string[] | null
  brands: { name: string; logo_url: string | null } | null
  models: { name: string } | null
}

const features = [
  {
    id: 'comparateur',
    icon: Scale,
    title: 'Comparateur',
    tagline: 'Comparez jusqu\'à 3 véhicules',
    action: 'expand' as const,
    href: null,
  },
  {
    id: 'offres',
    icon: Tag,
    title: 'Offres Spéciales',
    tagline: 'Les meilleures promotions',
    action: 'link' as const,
    href: '/neuf/promotions',
  },
  {
    id: 'top-ventes',
    icon: TrendingUp,
    title: 'Top Ventes',
    tagline: 'Les plus populaires au Maroc',
    action: 'link' as const,
    href: '/neuf?sort=popular',
  },
  {
    id: 'coups-de-coeur',
    icon: Heart,
    title: 'Coups de Cœur',
    tagline: 'Notre sélection du moment',
    action: 'link' as const,
    href: '/coups-de-coeur',
  },
]

export function FeatureGrid() {
  const [comparatorOpen, setComparatorOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [vehicleData, setVehicleData] = useState<Record<string, VehicleData>>({})
  const [showSelector, setShowSelector] = useState(false)
  const [loading, setLoading] = useState(false)
  const fetchedIdsRef = useRef<Set<string>>(new Set())

  const fetchVehicleData = useCallback(async (ids: string[]) => {
    const newIds = ids.filter(id => !fetchedIdsRef.current.has(id))
    if (newIds.length === 0) return
    newIds.forEach(id => fetchedIdsRef.current.add(id))
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('vehicles_new')
      .select('id, year, price_min, images, brands:brand_id (name, logo_url), models:model_id (name)')
      .in('id', newIds)
    if (data) {
      setVehicleData(prev => {
        const map = { ...prev }
        data.forEach((v: any) => { map[v.id] = v })
        return map
      })
    }
    setLoading(false)
  }, [])

  const handleAdd = (vehicleId: string) => {
    if (selectedIds.length >= 3) return
    const next = [...selectedIds, vehicleId]
    setSelectedIds(next)
    fetchVehicleData(next)
    setShowSelector(false)
  }

  const handleRemove = (index: number) => {
    setSelectedIds(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <section className="py-4">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature) => {
            const isExpandCard = feature.action === 'expand'
            const isActive = isExpandCard && comparatorOpen

            const cardContent = (
              <>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors duration-200 ${
                  isActive ? 'bg-[#006EFE] text-white' : 'bg-[#006EFE]/10 text-[#006EFE] group-hover:bg-[#006EFE] group-hover:text-white'
                }`}>
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className={`font-bold font-display text-base mb-1 transition-colors duration-200 ${
                  isActive ? 'text-[#006EFE]' : 'text-primary group-hover:text-[#006EFE]'
                }`}>
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 leading-snug">{feature.tagline}</p>
                <div className={`mt-4 flex items-center gap-1 text-sm font-medium transition-colors duration-200 ${
                  isActive ? 'text-[#006EFE]' : 'text-gray-400 group-hover:text-[#006EFE]'
                }`}>
                  <span>{isExpandCard ? (isActive ? 'Fermer' : 'Ouvrir') : 'Voir'}</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </>
            )

            const cardClass = `group p-5 bg-white rounded-2xl border transition-all duration-200 flex flex-col cursor-pointer ${
              isActive
                ? 'border-[#006EFE]/30 shadow-md'
                : 'border-gray-200 hover:border-[#006EFE]/20 hover:-translate-y-0.5 hover:shadow-md'
            }`

            if (isExpandCard) {
              return (
                <button
                  key={feature.id}
                  onClick={() => setComparatorOpen(prev => !prev)}
                  className={cardClass}
                >
                  {cardContent}
                </button>
              )
            }

            return (
              <Link key={feature.id} href={feature.href!} className={cardClass}>
                {cardContent}
              </Link>
            )
          })}
        </div>

        {/* Comparateur panel — expands below the grid */}
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
          comparatorOpen ? 'max-h-[2000px] opacity-100 mt-4' : 'max-h-0 opacity-0'
        }`}>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8">
            <p className="text-gray-500 text-sm text-center mb-8">
              Comparez jusqu&apos;à 3 véhicules côte à côte
            </p>

            {/* Vehicle slots with VS separators */}
            <div className="flex flex-col md:flex-row items-stretch gap-3 mb-8">
              {[0, 1, 2].map((index) => {
                const vehicleId = selectedIds[index]
                const vehicle = vehicleId ? vehicleData[vehicleId] : null

                return (
                  <div key={index} className="flex flex-col md:flex-row items-center gap-3 flex-1">
                    {/* Slot card */}
                    <div className="w-full flex-1 rounded-2xl border border-gray-200 bg-gray-50 min-h-[190px] flex items-center justify-center transition-all duration-300">
                      {vehicleId ? (
                        <div className="w-full p-4">
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                              Véhicule {index + 1}
                            </span>
                            <button
                              onClick={() => handleRemove(index)}
                              className="text-gray-300 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          {loading && !vehicle ? (
                            <div className="flex items-center justify-center py-8">
                              <p className="text-sm text-gray-400 animate-pulse">Chargement...</p>
                            </div>
                          ) : vehicle ? (
                            <div className="space-y-3">
                              <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
                                <Image
                                  src={vehicle.images?.[0] || '/placeholder-car.jpg'}
                                  alt={`${vehicle.brands?.name} ${vehicle.models?.name}`}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                  {vehicle.brands?.logo_url && (
                                    <Image
                                      src={vehicle.brands.logo_url}
                                      alt={vehicle.brands.name}
                                      width={18}
                                      height={18}
                                      className="object-contain"
                                    />
                                  )}
                                  <h3 className="font-bold text-primary truncate text-sm">
                                    {vehicle.brands?.name} {vehicle.models?.name}
                                  </h3>
                                </div>
                                <p className="text-xs text-gray-400">{vehicle.year}</p>
                                <p className="text-sm font-semibold text-[#006EFE]">
                                  {vehicle.price_min ? formatPrice(vehicle.price_min) : 'Sur demande'}
                                </p>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowSelector(true)}
                          className="flex flex-col items-center gap-3 py-8 px-6 w-full h-full text-gray-400 hover:text-[#006EFE] transition-all duration-200 group/add"
                        >
                          <div className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-dashed border-gray-200 group-hover/add:border-[#006EFE]/40 transition-all duration-200">
                            <Plus className="h-5 w-5" />
                          </div>
                          <span className="text-xs font-semibold tracking-wide">Ajouter</span>
                        </button>
                      )}
                    </div>

                    {/* VS badge — between slots, hidden after last */}
                    {index < 2 && (
                      <div className="hidden md:flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-black text-gray-400 px-2 py-1 rounded-full border border-gray-200 tracking-widest bg-gray-50">
                          VS
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Comparison table */}
            {selectedIds.length >= 2 ? (
              <div className="rounded-2xl overflow-hidden border border-gray-200">
                <ComparisonTable vehicleIds={selectedIds} />
              </div>
            ) : (
              <div className="rounded-2xl border border-gray-200 p-10 text-center bg-gray-50">
                <p className="text-gray-400 text-sm">
                  Sélectionnez au moins 2 véhicules pour démarrer la comparaison
                </p>
              </div>
            )}

            {/* CTA */}
            <div className="text-center mt-7">
              <Link
                href="/neuf/comparer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-[#006EFE] transition-colors duration-200"
              >
                Ouvrir le comparateur complet
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle selector modal */}
      {showSelector && (
        <VehicleSelector
          onSelect={handleAdd}
          onClose={() => setShowSelector(false)}
          excludeIds={selectedIds}
        />
      )}
    </section>
  )
}
