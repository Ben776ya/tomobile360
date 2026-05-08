'use client'

import { useState, useCallback, useRef, useEffect, ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Scale, Tag, TrendingUp, Heart, Sparkles, ArrowRight, Plus, X, Zap, Fuel, Car, Mountain, Truck } from 'lucide-react'
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

/* ─── Feature card data ─── */

type FeatureItem = {
  key: 'comparateur' | 'offres' | 'coeur' | 'top' | 'detailing'
  title: string
  subtitle: string
  imageSrc: string
  imageAlt: string
  icon: ReactNode
  cta: string
  href: string | null
  action: 'expand' | 'link'
}

const featureItems: FeatureItem[] = [
  {
    key: 'comparateur',
    title: 'Comparateur',
    subtitle: "Comparez jusqu'à 3 véhicules",
    imageSrc: '/features/comparateur-voitures-neuves-maroc.png',
    imageAlt: 'Comparateur de voitures neuves au Maroc',
    icon: <Scale />,
    cta: 'Ouvrir',
    href: null,
    action: 'expand',
  },
  {
    key: 'offres',
    title: 'Offres Spéciales',
    subtitle: 'Les meilleures promotions',
    imageSrc: '/features/offres-speciales-automobiles-maroc.png',
    imageAlt: 'Offres spéciales automobiles au Maroc',
    icon: <Tag />,
    cta: 'Découvrir',
    href: '/neuf/promotions',
    action: 'link',
  },
  {
    key: 'coeur',
    title: 'Coups de Cœur',
    subtitle: 'Notre sélection du moment',
    imageSrc: '/features/coups-de-coeur-selection-automobile-maroc.png',
    imageAlt: 'Sélection coups de cœur automobile',
    icon: <Heart />,
    cta: 'Ouvrir',
    href: null,
    action: 'expand',
  },
  {
    key: 'top',
    title: 'Top Ventes',
    subtitle: 'Les plus populaires au Maroc',
    imageSrc: '/features/top-ventes-voitures-populaires-maroc.png',
    imageAlt: 'Top ventes voitures populaires au Maroc',
    icon: <TrendingUp />,
    cta: 'Découvrir',
    href: '/neuf/populaires',
    action: 'link',
  },
  {
    key: 'detailing',
    title: 'Detailing',
    subtitle: 'Centres agréés, prise en ligne',
    imageSrc: '/features/detailing-services-automobile-maroc.png',
    imageAlt: 'Services de detailing automobile au Maroc',
    icon: <Sparkles />,
    cta: 'Découvrir',
    href: '/services/controle',
    action: 'link',
  },
]

/* ─── Reusable feature card ─── */

type FeatureCardProps = {
  title: string
  subtitle: string
  imageSrc: string
  imageAlt: string
  icon: ReactNode
  cta: string
  href: string | null
  action: 'expand' | 'link'
  isActive: boolean
  onClick?: () => void
}

function FeatureCard({
  title,
  subtitle,
  imageSrc,
  imageAlt,
  icon,
  cta,
  href,
  action,
  isActive,
  onClick,
}: FeatureCardProps) {
  const baseClass = `group mx-auto flex w-full max-w-[260px] flex-col items-center rounded-[22px] border bg-white px-[18px] pt-[22px] pb-[18px] text-slate-900 shadow-[0_4px_12px_rgba(0,0,0,0.25)] transition duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(0,0,0,0.45)] active:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-indigo-500 ${
    isActive
      ? 'border-indigo-400/60 shadow-[0_14px_30px_rgba(80,80,255,0.25)]'
      : 'border-gray-200 hover:border-gray-300'
  }`

  const inner = (
    <>
      <div className="relative h-[124px] w-[124px] shrink-0 overflow-hidden rounded-full bg-[#1f2a44]">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="124px"
          className="object-cover transition-transform duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.06]"
        />
        <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-[rgba(10,15,28,0.15)] to-[rgba(10,15,28,0.65)]" />
        <div className="absolute inset-0 z-10 flex items-center justify-center text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)] [&>svg]:h-11 [&>svg]:w-11 [&>svg]:stroke-[1.7]">
          {icon}
        </div>
      </div>

      <h3 className="mt-[18px] text-center text-[15px] font-bold tracking-[0.2px]">
        {title}
      </h3>
      <p className="mt-1 text-center text-[12.5px] text-slate-500">
        {subtitle}
      </p>

      <span className="mt-auto inline-flex items-center gap-1 pt-[14px] text-[12.5px] font-medium text-slate-700">
        {cta}
        <ArrowRight
          aria-hidden="true"
          className="h-3.5 w-3.5 transition-transform duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:translate-x-1"
        />
      </span>
    </>
  )

  if (action === 'expand') {
    return (
      <button type="button" onClick={onClick} className={baseClass}>
        {inner}
      </button>
    )
  }

  return (
    <Link href={href!} className={baseClass}>
      {inner}
    </Link>
  )
}

export function FeatureGrid() {
  /* ─── Comparateur state ─── */
  const [comparatorOpen, setComparatorOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [vehicleData, setVehicleData] = useState<Record<string, VehicleData>>({})
  const [showSelector, setShowSelector] = useState(false)
  const [loading, setLoading] = useState(false)
  const fetchedIdsRef = useRef<Set<string>>(new Set())

  /* ─── Coups de Coeur state ─── */
  const [cdcOpen, setCdcOpen] = useState(false)
  const [cdcCategory, setCdcCategory] = useState('voiture')
  const [cdcByCategory, setCdcByCategory] = useState<Record<string, CdcVehicle[]>>({})
  const [cdcLoading, setCdcLoading] = useState(false)

  /* ─── Comparateur fetch ─── */
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

  /* ─── CDC fetch ─── */
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

  const handleExpandClick = (key: 'comparateur' | 'coeur') => {
    if (key === 'comparateur') {
      setComparatorOpen(p => !p)
      setCdcOpen(false)
    } else {
      setCdcOpen(p => !p)
      setComparatorOpen(false)
    }
  }

  return (
    <section className="py-2">
      <div className="container mx-auto px-4">
        <div className="px-2 md:px-4 py-3 relative">

        {/* ── Card grid ── */}
        <div className="mx-auto grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-5">
          {featureItems.map((item) => {
            const isExpand = item.action === 'expand'
            const isActive = isExpand && (
              (item.key === 'comparateur' && comparatorOpen) ||
              (item.key === 'coeur' && cdcOpen)
            )
            const ctaText = isExpand
              ? (isActive ? 'Fermer' : item.cta)
              : item.cta

            return (
              <FeatureCard
                key={item.key}
                title={item.title}
                subtitle={item.subtitle}
                imageSrc={item.imageSrc}
                imageAlt={item.imageAlt}
                icon={item.icon}
                cta={ctaText}
                href={item.href}
                action={item.action}
                isActive={isActive}
                onClick={isExpand ? () => handleExpandClick(item.key as 'comparateur' | 'coeur') : undefined}
              />
            )
          })}
        </div>

        {/* ── Comparateur expand panel ── */}
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
                              <div className="h-5 w-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                            </div>
                          ) : vehicle ? (
                            <div className="space-y-3">
                              <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
                                <Image src={vehicle.images?.[0] || '/placeholder-car.svg'} alt={`${vehicle.brands?.name} ${vehicle.models?.name}`} fill className="object-cover" sizes="(max-width: 768px) 100vw, 300px" />
                              </div>
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                  {vehicle.brands?.logo_url && <Image src={vehicle.brands.logo_url} alt={vehicle.brands.name} width={18} height={18} className="object-contain" />}
                                  <h3 className="font-bold text-primary truncate text-sm">{vehicle.brands?.name} {vehicle.models?.name}</h3>
                                </div>
                                <p className="text-xs text-gray-400">{vehicle.year}</p>
                                <p className="text-sm font-semibold text-secondary">{vehicle.price_min ? formatPrice(vehicle.price_min) : 'Sur demande'}</p>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <button onClick={() => setShowSelector(true)} className="flex flex-col items-center gap-3 py-8 px-6 w-full h-full text-gray-400 hover:text-secondary transition-all duration-200 group/add">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-dashed border-gray-200 group-hover/add:border-secondary/40 transition-all duration-200">
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
              <Link href="/neuf/comparer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary hover:text-secondary-600 transition-colors duration-200">
                Ouvrir le comparateur complet
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* ── Coups de Coeur expand panel ── */}
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
                <div className="h-5 w-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
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
                        {/* Left: image */}
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
                          <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-r from-transparent to-white/20" />
                        </div>

                        {/* Right: text */}
                        <div className="flex-1 px-3 sm:px-5 py-4 sm:py-5 flex flex-col justify-between">
                          {vehicle ? (
                            <>
                              <div>
                                <h4 className="font-bold text-primary text-base leading-snug mb-1">
                                  {vehicle.brands?.name} {vehicle.models?.name}
                                </h4>
                                {vehicle.version && (
                                  <p className="text-xs text-gray-400 mb-3">
                                    {vehicle.version}{vehicle.year ? ` · ${vehicle.year}` : ''}
                                  </p>
                                )}

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

                                <p className="text-sm text-gray-500 leading-relaxed line-clamp-4">
                                  {vehicle.coup_de_coeur_reason || 'Un véhicule soigneusement sélectionné pour son rapport qualité-prix, ses équipements et son agrément de conduite.'}
                                </p>
                              </div>

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
