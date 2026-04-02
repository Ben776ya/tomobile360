'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Scale, Tag, TrendingUp, Heart, ChevronRight, Plus, X, ArrowRight, Zap, Fuel, Car, Mountain, Truck } from 'lucide-react'
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

interface CdcVehicle {
  id: string
  fuel_type: string
  horsepower: number | null
  price_min: number | null
  images: string[] | null
  version: string | null
  year: number | null
  coup_de_coeur_reason: string | null
  brands: { name: string } | null
  models: { name: string } | null
}

const CDC_CATEGORIES = [
  { id: 'voiture', label: 'Citadine', Icon: Car },
  { id: 'suv', label: 'SUV & 4x4', Icon: Mountain },
  { id: 'pickup', label: 'Pick-up', Icon: Truck },
]

const FUEL_ELECTRIC = ['Electric']
const FUEL_LABELS: Record<string, string> = {
  Essence: 'Essence',
  Diesel: 'Diesel',
  Hybrid: 'Hybride',
  PHEV: 'Hybride P.',
  Electric: 'Électrique',
}

const features = [
  {
    id: 'comparateur',
    icon: Scale,
    title: 'Comparateur',
    tagline: 'Comparez jusqu\'à 3 véhicules',
    action: 'expand' as const,
    href: null,
    color: '#006EFE',
  },
  {
    id: 'offres',
    icon: Tag,
    title: 'Offres Spéciales',
    tagline: 'Les meilleures promotions',
    action: 'link' as const,
    href: '/neuf/promotions',
    color: '#10B981',
  },
  {
    id: 'top-ventes',
    icon: TrendingUp,
    title: 'Top Ventes',
    tagline: 'Les plus populaires au Maroc',
    action: 'link' as const,
    href: '/neuf/populaires',
    color: '#8B5CF6',
  },
  {
    id: 'coups-de-coeur',
    icon: Heart,
    title: 'Coups de Cœur',
    tagline: 'Notre sélection du moment',
    action: 'expand' as const,
    href: null,
    color: '#F43F5E',
  },
]

export function FeatureGrid() {
  // — Comparateur state —
  const [comparatorOpen, setComparatorOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [vehicleData, setVehicleData] = useState<Record<string, VehicleData>>({})
  const [showSelector, setShowSelector] = useState(false)
  const [loading, setLoading] = useState(false)
  const fetchedIdsRef = useRef<Set<string>>(new Set())

  // — Coups de Cœur state —
  const [cdcOpen, setCdcOpen] = useState(false)
  const [cdcCategory, setCdcCategory] = useState('voiture')
  const [cdcByCategory, setCdcByCategory] = useState<Record<string, CdcVehicle[]>>({})
  const [cdcLoading, setCdcLoading] = useState(false)

  // Comparateur fetch
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

  // CDC fetch
  const fetchCdcVehicles = useCallback(async (category: string) => {
    if (cdcByCategory[category]) return
    setCdcLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('vehicles_new')
      .select('id, fuel_type, horsepower, price_min, images, version, year, coup_de_coeur_reason, brands:brand_id (name), models:model_id (name)')
      .eq('is_coup_de_coeur', true)
      .eq('coup_de_coeur_category', category)
      .limit(10)
    if (data) {
      setCdcByCategory(prev => ({ ...prev, [category]: data as unknown as CdcVehicle[] }))
    }
    setCdcLoading(false)
  }, [cdcByCategory])

  useEffect(() => {
    if (cdcOpen) fetchCdcVehicles(cdcCategory)
  }, [cdcOpen, cdcCategory, fetchCdcVehicles])

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
    <section className="relative -mt-6 sm:-mt-8 z-20 pt-0 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
          {features.map((feature) => {
            const isExpandCard = feature.action === 'expand'
            const isActive = isExpandCard && (
              (feature.id === 'comparateur' && comparatorOpen) ||
              (feature.id === 'coups-de-coeur' && cdcOpen)
            )
            const c = feature.color

            const cardContent = (
              <>
                <div
                  data-icon
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all duration-200"
                  style={{
                    backgroundColor: isActive ? c : `${c}18`,
                    color: isActive ? '#fff' : c,
                  }}
                >
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold font-display text-base mb-1 text-primary transition-colors duration-200">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 leading-snug">{feature.tagline}</p>
                <div
                  data-cta
                  className="mt-4 flex items-center gap-1 text-sm font-medium transition-colors duration-200"
                  style={{ color: isActive ? c : '#9ca3af' }}
                >
                  <span>{isExpandCard ? (isActive ? 'Fermer' : 'Ouvrir') : 'Voir'}</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </>
            )

            const cardClass = `group p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col cursor-pointer ${
              isActive ? 'border-opacity-30 shadow-md' : 'border-gray-200 hover:-translate-y-0.5 hover:shadow-md'
            }`

            const cardStyle = {
              background: isActive
                ? `linear-gradient(160deg, ${c}12 0%, #ffffff 55%)`
                : `linear-gradient(160deg, ${c}0a 0%, #ffffff 50%)`,
              borderColor: isActive ? `${c}50` : undefined,
            }

            if (isExpandCard) {
              const handleClick = () => {
                if (feature.id === 'comparateur') {
                  setComparatorOpen(p => !p)
                  setCdcOpen(false)
                } else {
                  setCdcOpen(p => !p)
                  setComparatorOpen(false)
                }
              }
              return (
                <button
                  key={feature.id}
                  onClick={handleClick}
                  className={cardClass}
                  style={cardStyle}
                  onMouseEnter={e => {
                    const el = e.currentTarget
                    el.style.background = `linear-gradient(160deg, ${c}18 0%, #ffffff 55%)`
                    el.style.borderColor = `${c}40`
                    const icon = el.querySelector<HTMLElement>('[data-icon]')
                    if (icon) { icon.style.backgroundColor = c; icon.style.color = '#fff' }
                    const cta = el.querySelector<HTMLElement>('[data-cta]')
                    if (cta) cta.style.color = c
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget
                    el.style.background = isActive
                      ? `linear-gradient(160deg, ${c}12 0%, #ffffff 55%)`
                      : `linear-gradient(160deg, ${c}0a 0%, #ffffff 50%)`
                    el.style.borderColor = isActive ? `${c}50` : ''
                    const icon = el.querySelector<HTMLElement>('[data-icon]')
                    if (icon) {
                      icon.style.backgroundColor = isActive ? c : `${c}18`
                      icon.style.color = isActive ? '#fff' : c
                    }
                    const cta = el.querySelector<HTMLElement>('[data-cta]')
                    if (cta) cta.style.color = isActive ? c : '#9ca3af'
                  }}
                >
                  {cardContent}
                </button>
              )
            }

            return (
              <Link
                key={feature.id}
                href={feature.href!}
                className={cardClass}
                style={cardStyle}
                onMouseEnter={e => {
                  const el = e.currentTarget
                  el.style.background = `linear-gradient(160deg, ${c}18 0%, #ffffff 55%)`
                  el.style.borderColor = `${c}40`
                  const icon = el.querySelector<HTMLElement>('[data-icon]')
                  if (icon) { icon.style.backgroundColor = c; icon.style.color = '#fff' }
                  const cta = el.querySelector<HTMLElement>('[data-cta]')
                  if (cta) cta.style.color = c
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget
                  el.style.background = `linear-gradient(160deg, ${c}0a 0%, #ffffff 50%)`
                  el.style.borderColor = ''
                  const icon = el.querySelector<HTMLElement>('[data-icon]')
                  if (icon) { icon.style.backgroundColor = `${c}18`; icon.style.color = c }
                  const cta = el.querySelector<HTMLElement>('[data-cta]')
                  if (cta) cta.style.color = '#9ca3af'
                }}
              >
                {cardContent}
              </Link>
            )
          })}
        </div>

        {/* ── Comparateur panel ── */}
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
          comparatorOpen ? 'max-h-[2000px] opacity-100 mt-4' : 'max-h-0 opacity-0'
        }`}>
          <div className="rounded-2xl border p-4 sm:p-6 lg:p-8" style={{ background: 'linear-gradient(180deg, #006EFE0d 0%, #ffffff 28%)', borderColor: '#006EFE30' }}>
            <p className="text-sm text-center mb-8 font-medium" style={{ color: '#006EFE99' }}>
              Comparez jusqu&apos;à 3 véhicules côte à côte
            </p>

            <div className="flex flex-col md:flex-row items-stretch gap-3 mb-8">
              {[0, 1, 2].map((index) => {
                const vehicleId = selectedIds[index]
                const vehicle = vehicleId ? vehicleData[vehicleId] : null
                return (
                  <div key={index} className="flex flex-col md:flex-row items-center gap-3 flex-1">
                    <div className="w-full flex-1 rounded-2xl min-h-[190px] flex items-center justify-center transition-all duration-300" style={{ border: '1px solid #006EFE20', background: '#006EFE05' }}>
                      {vehicleId ? (
                        <div className="w-full p-4">
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Véhicule {index + 1}</span>
                            <button onClick={() => handleRemove(index)} className="text-gray-300 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
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
                                <Image src={vehicle.images?.[0] || '/placeholder-car.svg'} alt={`${vehicle.brands?.name} ${vehicle.models?.name}`} fill className="object-cover" />
                              </div>
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                  {vehicle.brands?.logo_url && <Image src={vehicle.brands.logo_url} alt={vehicle.brands.name} width={18} height={18} className="object-contain" />}
                                  <h3 className="font-bold text-primary truncate text-sm">{vehicle.brands?.name} {vehicle.models?.name}</h3>
                                </div>
                                <p className="text-xs text-gray-400">{vehicle.year}</p>
                                <p className="text-sm font-semibold text-[#006EFE]">{vehicle.price_min ? formatPrice(vehicle.price_min) : 'Sur demande'}</p>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <button onClick={() => setShowSelector(true)} className="flex flex-col items-center gap-3 py-8 px-6 w-full h-full text-gray-400 hover:text-[#006EFE] transition-all duration-200 group/add">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-dashed border-gray-200 group-hover/add:border-[#006EFE]/40 transition-all duration-200">
                            <Plus className="h-5 w-5" />
                          </div>
                          <span className="text-xs font-semibold tracking-wide">Ajouter</span>
                        </button>
                      )}
                    </div>
                    {index < 2 && (
                      <div className="hidden md:flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-black px-2 py-1 rounded-full tracking-widest" style={{ color: '#006EFE80', border: '1px solid #006EFE25', background: '#006EFE08' }}>VS</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {selectedIds.length >= 2 ? (
              <div className="rounded-2xl overflow-hidden border border-gray-200">
                <ComparisonTable vehicleIds={selectedIds} />
              </div>
            ) : (
              <div className="rounded-2xl p-10 text-center" style={{ border: '1px solid #006EFE20', background: '#006EFE05' }}>
                <p className="text-sm" style={{ color: '#006EFE70' }}>Sélectionnez au moins 2 véhicules pour démarrer la comparaison</p>
              </div>
            )}

            <div className="text-center mt-7">
              <Link href="/neuf/comparer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#006EFE] hover:text-[#005BD4] transition-colors duration-200">
                Ouvrir le comparateur complet
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* ── Coups de Cœur panel ── */}
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
          cdcOpen ? 'max-h-[1200px] opacity-100 mt-4' : 'max-h-0 opacity-0'
        }`}>
          <div className="rounded-2xl border p-4 sm:p-6 lg:p-8" style={{ background: 'linear-gradient(180deg, #F43F5E0d 0%, #ffffff 30%)', borderColor: '#F43F5E30' }}>

            {/* Header + tabs row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <p className="text-sm font-medium" style={{ color: '#F43F5E99' }}>Notre sélection du moment</p>
              <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: '#F43F5E0a', border: '1px solid #F43F5E18' }}>
                {CDC_CATEGORIES.map(cat => {
                  const CatIcon = cat.Icon
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setCdcCategory(cat.id)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
                      style={cdcCategory === cat.id
                        ? { background: '#F43F5E', color: '#fff' }
                        : { color: '#F43F5E99' }
                      }
                    >
                      <CatIcon className="w-3 h-3" />
                      {cat.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Car cards */}
            {cdcLoading ? (
              <div className="flex items-center justify-center py-16">
                <p className="text-sm animate-pulse" style={{ color: '#F43F5E60' }}>Chargement...</p>
              </div>
            ) : (() => {
              const vehicles = cdcByCategory[cdcCategory] || []
              const carburant = vehicles.find(v => !FUEL_ELECTRIC.includes(v.fuel_type))
              const electric = vehicles.find(v => FUEL_ELECTRIC.includes(v.fuel_type))

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {([
                    { vehicle: carburant, isElectric: false },
                    { vehicle: electric, isElectric: true },
                  ] as const).map(({ vehicle, isElectric }) => {
                    const fuelLabel = vehicle ? (FUEL_LABELS[vehicle.fuel_type] ?? vehicle.fuel_type) : (isElectric ? 'Électrique' : '—')
                    const fuelStyle = isElectric
                      ? { bg: '#6366F112', color: '#6366F1', border: '#6366F130', Icon: Zap }
                      : vehicle?.fuel_type === 'Hybrid' || vehicle?.fuel_type === 'PHEV'
                        ? { bg: '#10B98112', color: '#059669', border: '#10B98130', Icon: Fuel }
                        : { bg: '#F59E0B12', color: '#D97706', border: '#F59E0B30', Icon: Fuel }

                    return (
                      <div
                        key={isElectric ? 'electric' : 'carburant'}
                        className="rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow duration-300 flex"
                        style={{ minHeight: 220 }}
                      >
                        {/* Left: image — takes 55% */}
                        <div className="relative flex-shrink-0 overflow-hidden bg-gray-100 w-[45%] sm:w-[55%]">
                          {vehicle?.images?.[0] ? (
                            <Image
                              src={vehicle.images[0]}
                              alt={`${vehicle.brands?.name} ${vehicle.models?.name}`}
                              fill
                              className="object-cover transition-transform duration-500 hover:scale-105"
                              sizes="(max-width: 768px) 55vw, 30vw"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center" style={{ background: '#F43F5E06' }}>
                              <Heart className="w-12 h-12" style={{ color: '#F43F5E20' }} />
                            </div>
                          )}
                          {/* Right-side gradient into text area */}
                          <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-r from-transparent to-white/20" />
                        </div>

                        {/* Right: text — takes 45% */}
                        <div className="flex-1 px-3 sm:px-5 py-4 sm:py-5 flex flex-col justify-between">
                          {vehicle ? (
                            <>
                              <div>
                                {/* Name */}
                                <h4 className="font-bold text-primary text-base leading-snug mb-1">
                                  {vehicle.brands?.name} {vehicle.models?.name}
                                </h4>
                                {vehicle.version && (
                                  <p className="text-xs text-gray-400 mb-3">
                                    {vehicle.version}{vehicle.year ? ` · ${vehicle.year}` : ''}
                                  </p>
                                )}

                                {/* Fuel tag + horsepower */}
                                <div className="flex items-center gap-2 mb-3">
                                  <span
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                                    style={{ background: fuelStyle.bg, color: fuelStyle.color, border: `1px solid ${fuelStyle.border}` }}
                                  >
                                    <fuelStyle.Icon className="w-3 h-3" />
                                    {fuelLabel}
                                  </span>
                                  {vehicle.horsepower && (
                                    <span className="text-xs text-gray-400 font-medium">{vehicle.horsepower} ch</span>
                                  )}
                                </div>

                                {/* Editorial text */}
                                <p className="text-sm text-gray-500 leading-relaxed line-clamp-4">
                                  {vehicle.coup_de_coeur_reason || 'Un véhicule soigneusement sélectionné pour son rapport qualité-prix, ses équipements et son agrément de conduite.'}
                                </p>
                              </div>

                              {/* Price */}
                              {vehicle.price_min && (
                                <p className="mt-4 text-sm font-bold" style={{ color: '#F43F5E' }}>
                                  À partir de {vehicle.price_min.toLocaleString('fr-MA')} DH
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="text-xs text-center py-4 text-gray-300 self-center w-full">
                              {isElectric ? 'Aucun modèle électrique disponible' : 'Aucun modèle disponible'}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })()}

            {/* CTA */}
            <div className="text-center mt-6">
              <Link
                href="/coups-de-coeur"
                className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors duration-200"
                style={{ color: '#F43F5E' }}
              >
                Voir toute la sélection
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
