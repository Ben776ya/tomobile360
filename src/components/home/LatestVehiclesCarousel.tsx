'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Car, Mountain, Truck, ArrowRight, Zap } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { VehicleNew, CoupDeCoeurCategory } from '@/lib/types'

type VehicleWithRelations = VehicleNew & {
  brands?: { name: string; logo_url: string | null }
  models?: { name: string }
}

const CATEGORIES = [
  { value: 'voiture'  as CoupDeCoeurCategory, label: 'Citadine',  Icon: Car      },
  { value: 'suv'      as CoupDeCoeurCategory, label: 'SUV & 4×4', Icon: Mountain },
  { value: 'pickup'   as CoupDeCoeurCategory, label: 'Pick-up',   Icon: Truck    },
]

interface Props {
  vehicles: VehicleNew[]
}

function VehicleSpot({ vehicle, isEV = false, showFuelTag = false }: { vehicle: VehicleWithRelations | null; isEV?: boolean; showFuelTag?: boolean }) {
  if (!vehicle) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className={`w-full aspect-[4/3] rounded-2xl bg-gray-100 animate-pulse ${isEV ? 'ring-2 ring-indigo-200' : ''} ${showFuelTag && !isEV ? 'ring-2 ring-[#33B75D]/30' : ''}`} />
        <div className="h-4 w-2/3 rounded-full bg-gray-100 animate-pulse" />
      </div>
    )
  }

  const brandName = vehicle.brands?.name || ''
  const modelName = vehicle.models?.name || ''
  const mainImage = vehicle.images?.[0] || '/placeholder-car.jpg'
  const href = `/neuf/${brandName.toLowerCase()}/${modelName.toLowerCase()}/${vehicle.id}`

  return (
    <Link href={href} className="group flex flex-col items-center gap-4">
      {/* Rounded image — EV gets an indigo ring */}
      <div className={`relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-md
                      group-hover:shadow-xl transition-shadow duration-300
                      ${isEV ? 'ring-2 ring-[#6366F1]/50 shadow-[0_4px_20px_rgba(99,102,241,0.15)]' : ''}
                      ${showFuelTag && !isEV ? 'ring-2 ring-[#33B75D]/50 shadow-[0_4px_20px_rgba(51,183,93,0.15)]' : ''}`}>
        <Image
          src={mainImage}
          alt={`${brandName} ${modelName}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          sizes="(max-width: 768px) 90vw, 40vw"
        />
        {/* Subtle bottom gradient for readability */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent rounded-b-2xl" />

        {/* Price pill on image */}
        {vehicle.price_min && (
          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-primary text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
            {formatPrice(vehicle.price_min)}
          </div>
        )}
      </div>

      {/* Fuel tag — below the image, not on it */}
      {isEV && (
        <div className="flex items-center gap-1 bg-[#6366F1]/10 text-[#6366F1] text-[11px] font-bold px-3 py-1 rounded-full -mt-1">
          <Zap className="w-3 h-3 fill-[#6366F1]" />
          Électrique
        </div>
      )}
      {showFuelTag && !isEV && vehicle.fuel_type && (
        <div className="flex items-center gap-1 bg-[#33B75D]/10 text-[#33B75D] text-[11px] font-bold px-3 py-1 rounded-full -mt-1">
          {vehicle.fuel_type}
        </div>
      )}

      {/* Name below image */}
      <div className={`text-center ${isEV ? '' : 'mt-0'}`}>
        <p className="font-semibold text-slate-700 text-sm md:text-base group-hover:text-primary transition-colors duration-200">
          {brandName} {modelName}
        </p>
        {vehicle.version && (
          <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[180px]">{vehicle.version}</p>
        )}
      </div>
    </Link>
  )
}

export function CoupsDeCoeurSection({ vehicles }: Props) {
  const [activeCategory, setActiveCategory] = useState<CoupDeCoeurCategory>('voiture')

  const categoryVehicles = vehicles.filter(v => v.coup_de_coeur_category === activeCategory)
  const thermalPick = (categoryVehicles.find(v => v.fuel_type !== 'Electric') ?? null) as VehicleWithRelations | null
  const evPick      = (categoryVehicles.find(v => v.fuel_type === 'Electric')  ?? null) as VehicleWithRelations | null

  return (
    <section className="py-4 md:py-6">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-6 md:p-8">

          {/* Title — matches other sections */}
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-2">
              Nos Coups de Cœur
            </h2>
            <p className="text-gray-500">Notre sélection du meilleur véhicule par segment</p>
          </div>

          {/* Pill navbar — centered */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-1 bg-gray-100 rounded-full p-1">
              {CATEGORIES.map(({ value, label, Icon }) => {
                const isActive = activeCategory === value
                return (
                  <button
                    key={value}
                    onClick={() => setActiveCategory(value)}
                    className={`
                      flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-semibold
                      transition-all duration-200 whitespace-nowrap
                      ${isActive
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                      }
                    `}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Two cars side by side */}
          <div className="grid grid-cols-2 gap-12 md:gap-16 max-w-3xl mx-auto">
            <VehicleSpot vehicle={thermalPick} showFuelTag />
            <VehicleSpot vehicle={evPick} isEV />
          </div>

          {/* CTA */}
          <div className="text-center mt-8">
            <Link
              href="/coups-de-coeur"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-primary transition-colors duration-200"
            >
              Voir toute la sélection
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </div>
    </section>
  )
}
