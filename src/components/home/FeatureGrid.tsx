'use client'

import { useState, useCallback, useRef, useEffect, ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Plus, X, Zap, Fuel, Car, Mountain, Truck, Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { VehicleSelector } from '@/components/vehicles/VehicleSelector'
import { ComparisonTable } from '@/components/vehicles/ComparisonTable'
import { formatPrice } from '@/lib/utils'
import { MobileCarousel } from '@/components/shared/MobileCarousel'

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
  model_id: string
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

type FeatureKey = 'comparateur' | 'offres' | 'coeur' | 'top' | 'ev'

type FeatureItem = {
  key: FeatureKey
  title: string
  subtitle: string
  imageSrc: string
  imageAlt: string
  href: string | null
  action: 'expand' | 'link'
}

const featureItems: FeatureItem[] = [
  {
    key: 'comparateur',
    title: 'Comparateur',
    subtitle: "Jusqu'à 3 véhicules",
    imageSrc: '/features/comparateur-voitures-neuves-maroc.png',
    imageAlt: 'Comparateur de voitures neuves au Maroc',
    href: null,
    action: 'expand',
  },
  {
    key: 'ev',
    title: 'Voitures chinoises',
    subtitle: 'Laquelle choisir?',
    imageSrc: '/blog/kia-maroc-siam-2026-stand-meknes-modeles-electriques-hero.webp',
    imageAlt: 'Voitures EV et PHEV au Maroc',
    href: '/neuf?origin=chinese',
    action: 'link',
  },
  {
    key: 'offres',
    title: 'Offres Spéciales',
    subtitle: 'Promotions du moment',
    imageSrc: '/features/offres-speciales-automobiles-maroc.png',
    imageAlt: 'Offres spéciales automobiles au Maroc',
    href: '/neuf/promotions',
    action: 'link',
  },
  {
    key: 'coeur',
    title: 'Coups de Cœur',
    subtitle: 'Notre sélection',
    imageSrc: '/features/coups-de-coeur-selection-automobile-maroc.png',
    imageAlt: 'Sélection coups de cœur automobile',
    href: null,
    action: 'expand',
  },
  {
    key: 'top',
    title: 'Top Ventes',
    subtitle: 'Les plus populaires',
    imageSrc: '/features/top-ventes-voitures-populaires-maroc.png',
    imageAlt: 'Top ventes voitures populaires au Maroc',
    href: '/neuf/populaires',
    action: 'link',
  },
]

const STICKER_LABELS: Record<FeatureKey, string> = {
  comparateur: 'Comparer',
  offres: 'Découvrir',
  coeur: 'Explorer',
  top: 'Voir',
  ev: 'Voir',
}

const ICON_PATHS: Record<FeatureKey, ReactNode> = {
  comparateur: (
    <>
      <path d="M6 4v16M18 4v16" />
      <path d="M2 9l4-5 4 5M14 15l4 5 4-5" />
    </>
  ),
  offres: (
    <>
      <path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <circle cx="7" cy="7" r="1.5" />
    </>
  ),
  coeur: (
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  ),
  top: (
    <>
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M14 7h7v7" />
    </>
  ),
  ev: (
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  ),
}

const STICKER_ICON_STROKE: Record<FeatureKey, string> = {
  comparateur: '#006EFE',
  offres: '#F97316',
  coeur: '#F43F5E',
  top: '#A16207',
  ev: '#15803D',
}

/* ─── Reusable feature card ─── */

type FeatureCardProps = {
  featureKey: FeatureKey
  title: string
  subtitle: string
  imageSrc: string
  imageAlt: string
  href: string | null
  action: 'expand' | 'link'
  onClick?: () => void
}

function FeatureCard({
  featureKey,
  title,
  subtitle,
  imageSrc,
  imageAlt,
  href,
  action,
  onClick,
}: FeatureCardProps) {
  const className = `vp-tile f-${featureKey}`
  const stickerLabel = STICKER_LABELS[featureKey]
  const stickerStroke = STICKER_ICON_STROKE[featureKey]
  const iconPaths = ICON_PATHS[featureKey]

  const inner = (
    <>
      <div className="vp-block">
        <div className="vp-halftone" />
        <div className="vp-spot" />
        <div className="vp-echo">
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            {iconPaths}
          </svg>
        </div>
        <div className="vp-sticker">
          <span className="vp-sticker-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke={stickerStroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
              {iconPaths}
            </svg>
          </span>
          {stickerLabel}
        </div>
      </div>
      <div className="vp-cutout">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="(min-width: 1024px) 145px, (min-width: 640px) 220px, 50vw"
          className="object-cover"
        />
      </div>
      <div className="vp-footer">
        <div className="vp-title">
          {title}
          <span className="vp-underline" />
        </div>
        <div className="vp-sub">{subtitle}</div>
      </div>
    </>
  )

  if (action === 'expand') {
    return (
      <button type="button" onClick={onClick} className={className}>
        {inner}
      </button>
    )
  }

  return (
    <Link href={href!} className={className}>
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
      .select('id, model_id, fuel_type, horsepower, price_min, images, version, year, coup_de_coeur_reason, brands:brand_id (name), models:model_id (name)')
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

        {/* ── Card grid (desktop) / infinite carousel (mobile) ── */}
        <MobileCarousel
          desktopClassName="mx-auto grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-5"
          autoPlayMs={5000}
        >
          {featureItems.map((item) => {
            const isExpand = item.action === 'expand'
            return (
              <FeatureCard
                key={item.key}
                featureKey={item.key}
                title={item.title}
                subtitle={item.subtitle}
                imageSrc={item.imageSrc}
                imageAlt={item.imageAlt}
                href={item.href}
                action={item.action}
                onClick={isExpand ? () => handleExpandClick(item.key as 'comparateur' | 'coeur') : undefined}
              />
            )
          })}
        </MobileCarousel>

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
              const seenModels = new Set<string>()
              const dedupedByModel = vehicles.filter(v => {
                if (seenModels.has(v.model_id)) return false
                seenModels.add(v.model_id)
                return true
              })
              const carburant = dedupedByModel.find(v => !FUEL_ELECTRIC.includes(v.fuel_type))
              const electric = dedupedByModel.find(v => FUEL_ELECTRIC.includes(v.fuel_type))

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
