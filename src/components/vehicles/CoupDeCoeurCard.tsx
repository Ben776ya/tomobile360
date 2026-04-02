import Link from 'next/link'
import Image from 'next/image'
import { VehicleNew, CoupDeCoeurCategory } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import { Fuel, Gauge, Zap, Calendar, Car, Mountain, Truck, ChevronRight } from 'lucide-react'

interface CoupDeCoeurCardProps {
  vehicle: VehicleNew & {
    brands?: { name: string; logo_url: string | null }
    models?: { name: string }
    promotions?: { discount_percentage: number | null; is_active?: boolean }[]
  }
  category: CoupDeCoeurCategory
  variant?: 'featured' | 'grid'
}

const STYLES = {
  voiture: {
    cardBorder: 'border-blue-200',
    contentBg: 'bg-blue-50',
    accentBorder: 'border-l-blue-500',
    titleHover: 'group-hover:text-blue-600',
    subtitleColor: 'text-blue-600',
    specIconColor: 'text-blue-400',
    priceBg: 'bg-blue-500',
    bottomGradient: 'from-blue-600 to-blue-400',
    specChipBg: 'bg-blue-100',
    badgeBg: 'bg-blue-500',
    ctaBg: 'bg-blue-500 hover:bg-blue-600',
    color: '#3B82F6',
    Icon: Car,
    label: 'Voiture',
  },
  suv: {
    cardBorder: 'border-teal-200',
    contentBg: 'bg-teal-50',
    accentBorder: 'border-l-teal-600',
    titleHover: 'group-hover:text-teal-600',
    subtitleColor: 'text-teal-700',
    specIconColor: 'text-teal-500',
    priceBg: 'bg-teal-600',
    bottomGradient: 'from-teal-600 to-teal-400',
    specChipBg: 'bg-teal-100',
    badgeBg: 'bg-teal-600',
    ctaBg: 'bg-teal-600 hover:bg-teal-700',
    color: '#0D9488',
    Icon: Mountain,
    label: 'SUV',
  },
  pickup: {
    cardBorder: 'border-orange-200',
    contentBg: 'bg-orange-50',
    accentBorder: 'border-l-orange-500',
    titleHover: 'group-hover:text-orange-600',
    subtitleColor: 'text-orange-700',
    specIconColor: 'text-orange-500',
    priceBg: 'bg-orange-500',
    bottomGradient: 'from-orange-600 to-orange-400',
    specChipBg: 'bg-orange-100',
    badgeBg: 'bg-orange-500',
    ctaBg: 'bg-orange-500 hover:bg-orange-600',
    color: '#F97316',
    Icon: Truck,
    label: 'Pick-up',
  },
  electrique: {
    cardBorder: 'border-indigo-200',
    contentBg: 'bg-indigo-50',
    accentBorder: 'border-l-indigo-500',
    titleHover: 'group-hover:text-indigo-600',
    subtitleColor: 'text-indigo-600',
    specIconColor: 'text-indigo-500',
    priceBg: 'bg-indigo-500',
    bottomGradient: 'from-indigo-600 to-indigo-400',
    specChipBg: 'bg-indigo-100',
    badgeBg: 'bg-indigo-500',
    ctaBg: 'bg-indigo-500 hover:bg-indigo-600',
    color: '#6366F1',
    Icon: Zap,
    label: 'Électrique',
  },
}

export function CoupDeCoeurCard({ vehicle, category, variant = 'grid' }: CoupDeCoeurCardProps) {
  const s = STYLES[category]
  const CategoryIcon = s.Icon
  const mainImage = vehicle.images?.[0] || '/placeholder-car.svg'
  const brandName = vehicle.brands?.name || 'Unknown'
  const modelName = vehicle.models?.name || 'Unknown'

  const priceDisplay = vehicle.price_min
    ? formatPrice(vehicle.price_min)
    : 'Prix sur demande'

  const href = `/neuf/${brandName.toLowerCase()}/${modelName.toLowerCase()}/${vehicle.id}`

  if (variant === 'featured') {
    return (
      <Link
        href={href}
        className={`group flex flex-col rounded-2xl border-2 ${s.cardBorder} overflow-hidden
                   shadow-card hover:shadow-card-hover hover:-translate-y-1
                   transition-all duration-300`}
      >
        {/* Image */}
        <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
          <Image
            src={mainImage}
            alt={`${brandName} ${modelName}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 672px"
          />

          {/* Award badge top-left */}
          <div className={`absolute top-3 left-3 ${s.badgeBg} text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5`}>
            <CategoryIcon className="w-3.5 h-3.5" />
            Coup de Cœur {s.label}
          </div>

          {/* Price badge top-right */}
          <div className="absolute top-3 right-3">
            <div className={`${s.priceBg} text-white font-bold text-sm px-3 py-1.5 rounded-lg shadow-md`}>
              {priceDisplay}
            </div>
          </div>

          {/* Brand logo bottom-left */}
          {vehicle.brands?.logo_url && (
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-md border border-gray-200">
              <Image
                src={vehicle.brands.logo_url}
                alt={brandName}
                width={40}
                height={40}
                className="object-contain opacity-70"
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className={`flex-1 p-5 ${s.contentBg} border-l-4 ${s.accentBorder}`}>
          <h3 className={`font-bold text-xl mb-1 transition-colors text-gray-900 ${s.titleHover}`}>
            {brandName} {modelName}
          </h3>
          <p className={`text-sm mb-4 ${s.subtitleColor}`}>
            {vehicle.version || ''}{vehicle.version && vehicle.year ? ' · ' : ''}{vehicle.year || ''}
          </p>

          {/* Spec chips */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 mb-5">
            {vehicle.year && (
              <div className={`flex items-center gap-1 ${s.specChipBg} px-2.5 py-1 rounded-full`}>
                <Calendar className={`h-3.5 w-3.5 ${s.specIconColor}`} />
                <span>{vehicle.year}</span>
              </div>
            )}
            {vehicle.fuel_type && (
              <div className={`flex items-center gap-1 ${s.specChipBg} px-2.5 py-1 rounded-full`}>
                <Fuel className={`h-3.5 w-3.5 ${s.specIconColor}`} />
                <span>{vehicle.fuel_type}</span>
              </div>
            )}
            {vehicle.transmission && (
              <div className={`flex items-center gap-1 ${s.specChipBg} px-2.5 py-1 rounded-full`}>
                <Gauge className={`h-3.5 w-3.5 ${s.specIconColor}`} />
                <span>{vehicle.transmission}</span>
              </div>
            )}
            {vehicle.horsepower && (
              <div className={`flex items-center gap-1 ${s.specChipBg} px-2.5 py-1 rounded-full`}>
                <Zap className={`h-3.5 w-3.5 ${s.specIconColor}`} />
                <span>{vehicle.horsepower} ch</span>
              </div>
            )}
          </div>

          {/* CTA button */}
          <div className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-white font-semibold text-sm ${s.ctaBg} transition-colors duration-200`}>
            Voir le véhicule
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </Link>
    )
  }

  // Grid variant (used on /coups-de-coeur page)
  return (
    <Link
      href={href}
      className={`group flex flex-col rounded-xl border ${s.cardBorder} overflow-hidden
                 shadow-card hover:shadow-card-hover hover:-translate-y-1
                 transition-all duration-300`}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <Image
          src={mainImage}
          alt={`${brandName} ${modelName}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
        {/* Price badge */}
        <div className="absolute top-3 right-3">
          <div className={`${s.priceBg} text-white font-bold text-sm px-3 py-1.5 rounded-lg shadow-md`}>
            {priceDisplay}
          </div>
        </div>

        {/* Brand logo */}
        {vehicle.brands?.logo_url && (
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-md border border-gray-200">
            <Image
              src={vehicle.brands.logo_url}
              alt={brandName}
              width={36}
              height={36}
              className="object-contain opacity-70"
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 p-4 ${s.contentBg}`}>
        <h3 className={`font-bold text-base md:text-lg mb-1 line-clamp-1 transition-colors text-gray-900 ${s.titleHover}`}>
          {brandName} {modelName}
        </h3>
        <p className={`text-sm mb-3 line-clamp-1 ${s.subtitleColor}`}>
          {vehicle.version || vehicle.year}
        </p>

        <div className={`flex flex-wrap items-center gap-3 text-xs text-gray-600`}>
          {vehicle.year && (
            <div className={`flex items-center gap-1 ${s.specChipBg} px-2 py-0.5 rounded-full`}>
              <Calendar className={`h-3.5 w-3.5 ${s.specIconColor}`} />
              <span>{vehicle.year}</span>
            </div>
          )}
          {vehicle.fuel_type && (
            <div className={`flex items-center gap-1 ${s.specChipBg} px-2 py-0.5 rounded-full`}>
              <Fuel className={`h-3.5 w-3.5 ${s.specIconColor}`} />
              <span>{vehicle.fuel_type}</span>
            </div>
          )}
          {vehicle.transmission && (
            <div className={`flex items-center gap-1 ${s.specChipBg} px-2 py-0.5 rounded-full`}>
              <Gauge className={`h-3.5 w-3.5 ${s.specIconColor}`} />
              <span>{vehicle.transmission}</span>
            </div>
          )}
          {vehicle.horsepower && (
            <div className={`flex items-center gap-1 ${s.specChipBg} px-2 py-0.5 rounded-full`}>
              <Zap className={`h-3.5 w-3.5 ${s.specIconColor}`} />
              <span>{vehicle.horsepower} ch</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom accent strip */}
      <div className={`h-1 bg-gradient-to-r ${s.bottomGradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
    </Link>
  )
}
