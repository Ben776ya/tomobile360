'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Car, Mountain, Truck, Zap, Fuel, Leaf, Droplets, Flame, ArrowRight } from 'lucide-react'
import type { VehicleNew, CoupDeCoeurCategory } from '@/lib/types'

type VehicleWithRelations = VehicleNew & {
  brands?: { name: string; logo_url: string | null }
  models?: { name: string }
}

const CATEGORIES = [
  { value: 'voiture' as CoupDeCoeurCategory, label: 'Citadine',  Icon: Car,      color: '#3B82F6' },
  { value: 'suv'     as CoupDeCoeurCategory, label: 'SUV & 4×4', Icon: Mountain, color: '#0D9488' },
  { value: 'pickup'  as CoupDeCoeurCategory, label: 'Pick-up',   Icon: Truck,    color: '#F97316' },
]

// Per fuel-type: icon, pill background, pill text colour, image ring colour
const FUEL_STYLES: Record<string, { Icon: React.ElementType; bg: string; text: string; ring: string; label: string }> = {
  Electric:  { Icon: Zap,      bg: 'rgba(99,102,241,0.20)',  text: '#a5b4fc', ring: 'rgba(99,102,241,0.45)',  label: 'Électrique' },
  Hybrid:    { Icon: Leaf,     bg: 'rgba(16,185,129,0.20)',  text: '#6ee7b7', ring: 'rgba(16,185,129,0.45)',  label: 'Hybride'    },
  PHEV:      { Icon: Leaf,     bg: 'rgba(16,185,129,0.20)',  text: '#6ee7b7', ring: 'rgba(16,185,129,0.45)',  label: 'PHEV'       },
  Diesel:    { Icon: Fuel,     bg: 'rgba(245,158,11,0.20)',  text: '#fcd34d', ring: 'rgba(245,158,11,0.45)',  label: 'Diesel'     },
  Essence:   { Icon: Droplets, bg: 'rgba(51,183,93,0.18)',   text: '#6ee7a0', ring: 'rgba(51,183,93,0.45)',   label: 'Essence'    },
  GPL:       { Icon: Flame,    bg: 'rgba(249,115,22,0.20)',  text: '#fdba74', ring: 'rgba(249,115,22,0.45)',  label: 'GPL'        },
  Gaz:       { Icon: Flame,    bg: 'rgba(249,115,22,0.20)',  text: '#fdba74', ring: 'rgba(249,115,22,0.45)',  label: 'Gaz'        },
}

const DEFAULT_FUEL = { Icon: Fuel, bg: 'rgba(156,163,175,0.20)', text: '#d1d5db', ring: 'rgba(156,163,175,0.40)', label: '' }

interface Props {
  vehicles: VehicleNew[]
}

function VehicleSpot({ vehicle, isEV = false }: { vehicle: VehicleWithRelations | null; isEV?: boolean }) {
  if (!vehicle) {
    return (
      <div className="flex items-center gap-5 bg-white/5 rounded-2xl p-6">
        <div className="w-[52%] shrink-0 aspect-[4/3] rounded-xl bg-white/8 animate-pulse" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-5 w-20 rounded-full bg-white/10 animate-pulse" />
          <div className="h-4 w-32 rounded-full bg-white/10 animate-pulse" />
          <div className="h-3 w-full rounded-full bg-white/10 animate-pulse" />
          <div className="h-3 w-4/5 rounded-full bg-white/10 animate-pulse" />
        </div>
      </div>
    )
  }

  const brandName  = vehicle.brands?.name || ''
  const modelName  = vehicle.models?.name || ''
  const mainImage  = vehicle.images?.[0] || '/placeholder-car.jpg'
  const href       = `/neuf/${brandName.toLowerCase()}/${modelName.toLowerCase()}/${vehicle.id}`
  const fuelKey    = isEV ? 'Electric' : (vehicle.fuel_type || '')
  const fuelStyle  = FUEL_STYLES[fuelKey] ?? { ...DEFAULT_FUEL, label: vehicle.fuel_type || '' }
  const FuelIcon   = fuelStyle.Icon
  const reason     = vehicle.coup_de_coeur_reason || 'Une voiture qui s\'impose par son équilibre remarquable entre confort, performances et technologies embarquées. Chaque détail a été pensé pour offrir une expérience de conduite supérieure à ce que propose le segment.'

  return (
    <Link
      href={href}
      className="group flex items-center gap-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-8 py-6 hover:bg-white/8 transition-all duration-300"
    >
      {/* Image with colored contour ring */}
      <div
        className="relative w-[52%] shrink-0 aspect-[4/3] rounded-xl overflow-hidden transition-transform duration-300 group-hover:scale-[1.02]"
        style={{ boxShadow: `0 0 0 2px ${fuelStyle.ring}, 0 4px 24px ${fuelStyle.ring}` }}
      >
        <Image
          src={mainImage}
          alt={`${brandName} ${modelName}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          sizes="(max-width: 768px) 45vw, 25vw"
        />
      </div>

      {/* Right — fuel pill, name, reason */}
      <div className="flex flex-col gap-4 flex-1 min-w-0">
        {/* Fuel indicator pill */}
        <div
          className="self-start flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full"
          style={{ backgroundColor: fuelStyle.bg, color: fuelStyle.text }}
        >
          <FuelIcon className="w-4 h-4" style={{ color: fuelStyle.text }} />
          {fuelStyle.label}
        </div>

        {/* Car name */}
        <p className="font-display font-bold text-white text-2xl leading-snug group-hover:text-white/90 transition-colors duration-200">
          {brandName} {modelName}
        </p>

        {/* Editorial reason */}
        <p className="text-white/60 text-base leading-relaxed">
          {reason}
        </p>
      </div>
    </Link>
  )
}

export function CoupsDeCoeurSection({ vehicles }: Props) {
  const [activeCategory, setActiveCategory] = useState<CoupDeCoeurCategory>('voiture')
  const [isOpen, setIsOpen] = useState(false)

  const activeCat       = CATEGORIES.find(c => c.value === activeCategory)!
  const categoryVehicles = vehicles.filter(v => v.coup_de_coeur_category === activeCategory)
  const thermalPick     = (categoryVehicles.find(v => v.fuel_type !== 'Electric') ?? null) as VehicleWithRelations | null
  const evPick          = (categoryVehicles.find(v => v.fuel_type === 'Electric')  ?? null) as VehicleWithRelations | null

  return (
    <div className="mx-3 sm:mx-6 md:mx-10 rounded-2xl overflow-hidden">
    <section className="relative bg-gradient-futuristic overflow-hidden">
      {/* Grid texture */}
      <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />

      {/* Per-category colour glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-48 rounded-full opacity-10 pointer-events-none blur-3xl transition-colors duration-500"
        style={{ backgroundColor: activeCat.color }}
      />

      {/* ── Clickable Header ────────────────────────────────── */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="relative z-10 w-full flex items-center px-6 md:px-10 py-5 group"
      >
        <div className="flex-1" />
        <h2 className="font-display text-2xl md:text-3xl font-bold text-white">
          Nos Coups de <span style={{ color: '#F5A623' }}>Cœur</span>
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
        {/* ── Collapsible content ──────────────────────────────── */}
        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            isOpen ? 'max-h-[1000px] opacity-100 pb-10 md:pb-14' : 'max-h-0 opacity-0'
          }`}
        >
          <p className="text-white/45 text-xs md:text-sm max-w-sm mx-auto text-center mb-7">
            Notre sélection du meilleur véhicule par segment.
          </p>

          {/* ── Category tabs ─────────────────────────────────── */}
          <div className="flex justify-center mb-7">
            <div className="inline-flex items-center gap-1 bg-white/8 backdrop-blur-sm border border-white/10 rounded-full p-1">
              {CATEGORIES.map(({ value, label, Icon, color }) => {
                const isActive = activeCategory === value
                return (
                  <button
                    key={value}
                    onClick={() => setActiveCategory(value)}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap"
                    style={
                      isActive
                        ? { backgroundColor: color, color: '#fff', boxShadow: `0 0 12px ${color}55` }
                        : { color: 'rgba(255,255,255,0.38)' }
                    }
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── Two vehicle spots ─────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <VehicleSpot vehicle={thermalPick} />
            <VehicleSpot vehicle={evPick} isEV />
          </div>

          {/* ── CTA ───────────────────────────────────────────── */}
          <div className="text-center mt-7">
            <Link
              href="/coups-de-coeur"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#006EFE] hover:text-[#3389fe] transition-colors duration-200"
            >
              Voir toute la sélection
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </section>
    </div>
  )
}
