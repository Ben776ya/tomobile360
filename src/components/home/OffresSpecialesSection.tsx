'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface OfferVehicle {
  id: string
  year: number
  price_min: number | null
  price_max: number | null
  images: string[] | null
  brands: { name: string; logo_url: string | null } | null
  models: { name: string } | null
  promotions?: { discount_percentage: number | null; discount_amount: number | null; is_active: boolean }[]
}

interface Props {
  vehicles: OfferVehicle[]
}

export function OffresSpecialesSection({ vehicles }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="mx-3 sm:mx-6 md:mx-10 rounded-2xl overflow-hidden">
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #059669 0%, #10B981 45%, #34D399 100%)' }}
      >
        {/* Dot mesh overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.10) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Glow orbs */}
        <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(0,0,0,0.20)' }} />

        {/* Clickable header */}
        <button
          onClick={() => setIsOpen(prev => !prev)}
          className="relative z-10 w-full flex items-center px-6 md:px-10 py-5 group"
        >
          <div className="flex-1" />
          <h2 className="font-display text-2xl md:text-3xl font-bold text-white drop-shadow-sm">
            Offres <span style={{ color: '#6EE7B7' }}>Spéciales</span>
          </h2>
          <div className="flex-1 flex justify-end">
            <span
              className="text-sm font-bold text-white/70 group-hover:text-white transition-colors duration-200 border border-white/30 rounded-full px-3 py-0.5"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            >
              {isOpen ? '−' : '+'}
            </span>
          </div>
        </button>

        <div className="relative z-10 px-6 md:px-10">
          {/* Collapsible content */}
          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              isOpen ? 'max-h-[1200px] opacity-100 pb-10 md:pb-12' : 'max-h-0 opacity-0'
            }`}
          >
            <p className="text-white/50 text-xs md:text-sm text-center mb-8">
              Les meilleures promotions sélectionnées par notre équipe
            </p>

            {vehicles.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {vehicles.map((vehicle) => {
                  const promo = vehicle.promotions?.find(p => p.is_active)
                  const discountLabel = promo?.discount_percentage
                    ? `-${promo.discount_percentage}%`
                    : promo?.discount_amount
                    ? `-${formatPrice(promo.discount_amount)}`
                    : null

                  return (
                    <Link
                      key={vehicle.id}
                      href={`/neuf/${vehicle.brands?.name?.toLowerCase()}/${vehicle.models?.name?.toLowerCase()}/${vehicle.id}`}
                      className="group block rounded-xl overflow-hidden border border-white/15 backdrop-blur-sm transition-all duration-200 hover:border-white/30 hover:scale-[1.02]"
                      style={{ background: 'rgba(255,255,255,0.09)' }}
                    >
                      {/* Image */}
                      <div className="relative aspect-video overflow-hidden" style={{ background: 'rgba(0,0,0,0.25)' }}>
                        <Image
                          src={vehicle.images?.[0] || '/placeholder-car.jpg'}
                          alt={`${vehicle.brands?.name} ${vehicle.models?.name}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {discountLabel && (
                          <span className="absolute top-2 right-2 bg-emerald-400 text-white text-xs font-black px-2 py-0.5 rounded-full shadow">
                            {discountLabel}
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-3 space-y-1">
                        <div className="flex items-center gap-1.5">
                          {vehicle.brands?.logo_url && (
                            <Image
                              src={vehicle.brands.logo_url}
                              alt={vehicle.brands.name}
                              width={16}
                              height={16}
                              className="object-contain brightness-0 invert"
                            />
                          )}
                          <p className="text-white font-semibold text-sm truncate">
                            {vehicle.brands?.name} {vehicle.models?.name}
                          </p>
                        </div>
                        <p className="text-white/45 text-xs">{vehicle.year}</p>
                        <p className="text-white font-bold text-sm">
                          {vehicle.price_min ? `À partir de ${formatPrice(vehicle.price_min)}` : 'Sur demande'}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div
                className="rounded-xl border border-white/10 p-10 text-center mb-8 backdrop-blur-sm"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                <p className="text-white/40 text-sm">Aucune offre spéciale disponible pour le moment</p>
              </div>
            )}

            <div className="text-center">
              <Link
                href="/neuf"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/80 hover:text-white transition-colors duration-200"
              >
                Voir tous les véhicules
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </section>

    </div>
  )
}
