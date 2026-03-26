'use client'

import { useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Plus, X, ArrowRight } from 'lucide-react'
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

export function ComparateurSection() {
  const [isOpen, setIsOpen] = useState(false)
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
    <div className="mx-3 sm:mx-6 md:mx-10 rounded-2xl overflow-hidden">
    <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 45%, #60A5FA 100%)' }}>

      {/* Dot mesh overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Top-left glow orb */}
      <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(255,255,255,0.08)' }} />
      {/* Bottom-right glow orb */}
      <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(0,0,0,0.15)' }} />

      {/* Clickable header */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="relative z-10 w-full flex items-center px-6 md:px-10 py-5 group"
      >
        <div className="flex-1" />
        <h2 className="font-display text-2xl md:text-3xl font-bold text-white drop-shadow-sm">
          Comparateur de <span style={{ color: '#93C5FD' }}>Véhicules</span>
        </h2>
        <div className="flex-1 flex justify-end">
          <span
            className="text-sm font-bold text-white/60 group-hover:text-white transition-colors duration-200 border border-white/20 rounded-full px-3 py-0.5"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            {isOpen ? '−' : '+'}
          </span>
        </div>
      </button>

      <div className="relative z-10 container mx-auto px-4">
        {/* Collapsible content */}
        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            isOpen ? 'max-h-[2000px] opacity-100 pb-10 md:pb-14' : 'max-h-0 opacity-0'
          }`}
        >
          <p className="text-white/60 text-xs md:text-sm text-center mb-8">
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
                  <div className="w-full flex-1 rounded-2xl border border-white/20 backdrop-blur-md min-h-[190px] flex items-center justify-center transition-all duration-300"
                    style={{ background: 'rgba(255,255,255,0.12)' }}
                  >
                    {vehicleId ? (
                      <div className="w-full p-4">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
                            Véhicule {index + 1}
                          </span>
                          <button
                            onClick={() => handleRemove(index)}
                            className="text-white/30 hover:text-white transition-colors p-1 rounded-full hover:bg-white/15"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        {loading && !vehicle ? (
                          <div className="flex items-center justify-center py-8">
                            <p className="text-sm text-white/40 animate-pulse">Chargement...</p>
                          </div>
                        ) : vehicle ? (
                          <div className="space-y-3">
                            <div className="relative aspect-video rounded-xl overflow-hidden" style={{ background: 'rgba(0,0,0,0.2)' }}>
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
                                    className="object-contain brightness-0 invert"
                                  />
                                )}
                                <h3 className="font-bold text-white truncate text-sm">
                                  {vehicle.brands?.name} {vehicle.models?.name}
                                </h3>
                              </div>
                              <p className="text-xs text-white/45">{vehicle.year}</p>
                              <p className="text-sm font-semibold text-white/90">
                                {vehicle.price_min ? formatPrice(vehicle.price_min) : 'Sur demande'}
                              </p>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowSelector(true)}
                        className="flex flex-col items-center gap-3 py-8 px-6 w-full h-full text-white/40 hover:text-white transition-all duration-200 group/add"
                      >
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-dashed border-white/25 group-hover/add:border-white/60 transition-all duration-200"
                          style={{ background: 'rgba(255,255,255,0.06)' }}
                        >
                          <Plus className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-semibold tracking-wide">Ajouter</span>
                      </button>
                    )}
                  </div>

                  {/* VS badge — between slots, hidden after last */}
                  {index < 2 && (
                    <div className="hidden md:flex items-center justify-center flex-shrink-0">
                      <span
                        className="text-xs font-black text-white/50 px-2 py-1 rounded-full border border-white/20 tracking-widest"
                        style={{ background: 'rgba(255,255,255,0.08)' }}
                      >
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
            <div className="rounded-2xl overflow-hidden shadow-dark-elevated">
              <ComparisonTable vehicleIds={selectedIds} />
            </div>
          ) : (
            <div
              className="rounded-2xl border border-white/15 p-10 text-center backdrop-blur-sm"
              style={{ background: 'rgba(255,255,255,0.07)' }}
            >
              <p className="text-white/40 text-sm">
                Sélectionnez au moins 2 véhicules pour démarrer la comparaison
              </p>
            </div>
          )}

          {/* CTA */}
          <div className="text-center mt-7">
            <Link
              href="/neuf/comparer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/70 hover:text-white transition-colors duration-200"
            >
              Ouvrir le comparateur complet
              <ArrowRight className="w-4 h-4" />
            </Link>
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
    </div>
  )
}
