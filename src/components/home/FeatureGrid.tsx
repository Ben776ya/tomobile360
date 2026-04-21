'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, X, ArrowRight, Zap, Fuel, Car, Mountain, Truck, Heart } from 'lucide-react'
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

type FeatureCard = {
  key: 'comparateur' | 'offres' | 'coeur' | 'top'
  label: string
  sub: string
  cta: string
  hue: string
  hueSoft: string
  hueMid: string
  href: string | null
  image: string
  action: 'expand' | 'link'
}

const featureCards: FeatureCard[] = [
  {
    key: 'comparateur',
    label: 'Comparateur',
    sub: "Comparez jusqu'à 3 véhicules",
    cta: 'Ouvrir',
    hue: '#006EFE',
    hueSoft: '#E6F0FF',
    hueMid: '#CCE0FF',
    href: null,
    image: '/features/comparateur-voitures-neuves-maroc.png',
    action: 'expand',
  },
  {
    key: 'offres',
    label: 'Offres Spéciales',
    sub: 'Les meilleures promotions',
    cta: 'Voir',
    hue: '#F97316',
    hueSoft: '#FFF1E6',
    hueMid: '#FFD9B8',
    href: '/neuf/promotions',
    image: '/features/offres-speciales-automobiles-maroc.png',
    action: 'link',
  },
  {
    key: 'coeur',
    label: 'Coups de Cœur',
    sub: 'Notre sélection du moment',
    cta: 'Ouvrir',
    hue: '#F43F5E',
    hueSoft: '#FFE9ED',
    hueMid: '#FFCAD4',
    href: null,
    image: '/features/coups-de-coeur-selection-automobile-maroc.png',
    action: 'expand',
  },
  {
    key: 'top',
    label: 'Top Ventes',
    sub: 'Les plus populaires au Maroc',
    cta: 'Voir',
    hue: '#32B75C',
    hueSoft: '#E6F8EC',
    hueMid: '#BEEBCE',
    href: '/neuf/populaires',
    image: '/features/top-ventes-voitures-populaires-maroc.png',
    action: 'link',
  },
]

export function FeatureGrid() {
  /* ─── Comparateur state ─── */
  const [comparatorOpen, setComparatorOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [vehicleData, setVehicleData] = useState<Record<string, VehicleData>>({})
  const [showSelector, setShowSelector] = useState(false)
  const [loading, setLoading] = useState(false)
  const fetchedIdsRef = useRef<Set<string>>(new Set())

  /* ─── Hover state ─── */
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)

  /* ─── Coups de Coeur state ─── */
  const [cdcOpen, setCdcOpen] = useState(false)
  const [cdcCategory, setCdcCategory] = useState('voiture')
  const [cdcByCategory, setCdcByCategory] = useState<Record<string, CdcVehicle[]>>({})
  const [cdcLoading, setCdcLoading] = useState(false)

  /* ─── Reduced-motion detection ─── */
  const [reducedMotion, setReducedMotion] = useState(false)
  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mql.matches)
    const handler = () => setReducedMotion(mql.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

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

  return (
    <section className="relative -mt-6 sm:-mt-8 z-20 pt-0 pb-6">
      <div className="container mx-auto px-4">

        {/* ══════════════════════════════════════════
            V2 — Editorial Split Card Grid
            ══════════════════════════════════════════ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {featureCards.map((card) => {
            const isExpandCard = card.action === 'expand'
            const isActive = isExpandCard && (
              (card.key === 'comparateur' && comparatorOpen) ||
              (card.key === 'coeur' && cdcOpen)
            )
            const isHovered = hoveredKey === card.key
            const ctaText = isExpandCard
              ? (isActive ? 'Fermer' : card.cta)
              : card.cta

            /* Lift & zoom only when motion is allowed */
            const canAnimate = !reducedMotion
            const liftY = canAnimate && isHovered && !isActive ? -6 : 0
            const photoScale = canAnimate && isHovered ? 1.06 : 1
            const arrowX = canAnimate && isHovered ? 4 : 0

            const cardContent = (
              <>
                {/* ── Photo zone — 16 : 9 ── */}
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={card.image}
                    alt=""
                    fill
                    className="object-cover"
                    style={{
                      transform: `scale(${photoScale})`,
                      transition: 'transform 500ms cubic-bezier(.2,.7,.3,1)',
                    }}
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  {/* Accent color wash (12 % opacity, multiply) */}
                  <div
                    className="absolute inset-0 mix-blend-multiply pointer-events-none"
                    style={{ background: `${card.hue}1F` }}
                  />
                  {/* Bottom darkening gradient */}
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/15 to-transparent pointer-events-none" />
                </div>

                {/* ── Body zone ── */}
                <div
                  className="flex flex-col flex-1"
                  style={{ padding: '16px 18px 18px' }}
                >
                  <h3
                    className="font-display font-extrabold"
                    style={{
                      fontSize: '18px',
                      letterSpacing: '-0.015em',
                      lineHeight: 1.1,
                      color: '#1C2541',
                    }}
                  >
                    {card.label}
                  </h3>
                  <p
                    className="font-sans font-normal line-clamp-2"
                    style={{
                      fontSize: '12.5px',
                      marginTop: '4px',
                      color: '#6B7280',
                    }}
                  >
                    {card.sub}
                  </p>

                  {/* Footer row */}
                  <div
                    className="flex items-center justify-between"
                    style={{ marginTop: 'auto', paddingTop: '14px' }}
                  >
                    {/* CTA label */}
                    <span
                      className="font-sans font-bold"
                      style={{ fontSize: '12px', color: card.hue }}
                    >
                      {ctaText}
                    </span>

                    {/* Arrow circle */}
                    <span
                      className="flex items-center justify-center rounded-full select-none"
                      style={{
                        width: 28,
                        height: 28,
                        backgroundColor: isHovered ? card.hue : card.hueSoft,
                        color: isHovered ? '#fff' : card.hue,
                        fontSize: '14px',
                        fontWeight: 800,
                        transform: `translateX(${arrowX}px)`,
                        boxShadow: isHovered ? `0 4px 12px ${card.hue}40` : 'none',
                        transition: 'all 300ms cubic-bezier(.2,.7,.3,1)',
                      }}
                    >
                      &#8594;
                    </span>
                  </div>
                </div>
              </>
            )

            const cardStyle: React.CSSProperties = {
              borderRadius: '16px',
              border: '1px solid',
              borderColor: isHovered
                ? card.hueMid
                : isActive
                  ? `${card.hue}80`
                  : '#E2E8F0',
              boxShadow: isHovered
                ? '0 16px 36px rgba(13,18,32,.14)'
                : isActive
                  ? `0 0 20px ${card.hue}35, 0 0 50px ${card.hue}12`
                  : '0 2px 8px rgba(13,18,32,.05)',
              transform: `translateY(${liftY}px)`,
              transition: 'transform 350ms cubic-bezier(.2,.7,.3,1), box-shadow 350ms cubic-bezier(.2,.7,.3,1), border-color 350ms cubic-bezier(.2,.7,.3,1)',
              ...(isActive ? { '--tw-ring-color': `${card.hue}80` } as React.CSSProperties : {}),
            }

            const baseClass = `group relative flex flex-col overflow-hidden cursor-pointer bg-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none${
              isActive ? ' ring-2' : ''
            }`

            const hoverHandlers = {
              onMouseEnter: () => setHoveredKey(card.key),
              onMouseLeave: () => setHoveredKey(null),
            }

            if (isExpandCard) {
              const handleClick = () => {
                if (card.key === 'comparateur') {
                  setComparatorOpen(p => !p)
                  setCdcOpen(false)
                } else {
                  setCdcOpen(p => !p)
                  setComparatorOpen(false)
                }
              }
              return (
                <button
                  key={card.key}
                  onClick={handleClick}
                  className={baseClass}
                  style={cardStyle}
                  {...hoverHandlers}
                >
                  {cardContent}
                </button>
              )
            }

            return (
              <Link
                key={card.key}
                href={card.href!}
                className={baseClass}
                style={cardStyle}
                {...hoverHandlers}
              >
                {cardContent}
              </Link>
            )
          })}
        </div>

        {/* ══════════════════════════════════════════
            Comparateur expand panel
            ══════════════════════════════════════════ */}
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

        {/* ══════════════════════════════════════════
            Coups de Coeur expand panel
            ══════════════════════════════════════════ */}
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
