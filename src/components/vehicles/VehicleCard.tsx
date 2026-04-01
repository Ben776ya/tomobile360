import Link from 'next/link'
import Image from 'next/image'
import { VehicleNew } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { cn, formatPrice } from '@/lib/utils'
import { Fuel, Gauge, Zap, Calendar } from 'lucide-react'

interface VehicleCardProps {
  vehicle: VehicleNew & {
    brands?: { name: string; logo_url: string | null }
    models?: { name: string }
    promotions?: { discount_percentage: number | null; is_active?: boolean }[]
  }
  showBadges?: boolean
}

export function VehicleCard({ vehicle, showBadges = true }: VehicleCardProps) {
  const activePromo = vehicle.promotions?.find(p => p.discount_percentage && p.discount_percentage > 0 && p.is_active !== false)
  const mainImage = vehicle.images?.[0] || '/placeholder-car.jpg'
  const brandName = vehicle.brands?.name || 'Unknown'
  const modelName = vehicle.models?.name || 'Unknown'

  const priceDisplay = vehicle.price_min && vehicle.price_max
    ? `${formatPrice(vehicle.price_min)}`
    : vehicle.price_min
    ? `${formatPrice(vehicle.price_min)}`
    : 'Prix sur demande'

  return (
    <Link
      href={`/neuf/${brandName.toLowerCase()}/${modelName.toLowerCase()}/${vehicle.id}`}
      className={cn(
        'group block bg-white rounded-xl border border-gray-200 overflow-hidden',
        'transition-all duration-200',
        'hover:-translate-y-0.5 hover:shadow-card-hover hover:border-secondary/20'
      )}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <Image
          src={mainImage}
          alt={`${brandName} ${modelName}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />

        {/* Price Badge */}
        <div className="absolute top-3 right-3">
          <div className="bg-secondary text-white font-semibold text-sm px-3 py-1.5 rounded-lg">
            {priceDisplay}
          </div>
        </div>

        {/* Status Badges */}
        {showBadges && (
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {activePromo && (
              <Badge className="bg-secondary hover:bg-secondary text-white border-0 font-bold">
                -{activePromo.discount_percentage}%
              </Badge>
            )}
            {vehicle.is_new_release && (
              <Badge className="bg-green-500 hover:bg-green-500 text-white border-0 shadow-md">
                NOUVEAU
              </Badge>
            )}
            {vehicle.is_popular && (
              <Badge className="bg-primary hover:bg-primary text-white border-0 shadow-glow-indigo-sm">
                POPULAIRE
              </Badge>
            )}
          </div>
        )}

        {/* Brand Logo */}
        {vehicle.brands?.logo_url && (
          <div className="absolute bottom-3 left-3 bg-white rounded-lg p-2 border border-gray-200">
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
      <div className="p-3 sm:p-4">
        <h3 className="font-bold text-primary mb-1 text-sm sm:text-base md:text-lg group-hover:text-secondary transition-colors line-clamp-1">
          {brandName} {modelName}
        </h3>
        <p className="text-sm text-gray-500 mb-3 line-clamp-1">
          {vehicle.version || vehicle.year}
        </p>
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
          {vehicle.year && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{vehicle.year}</span>
            </div>
          )}
          {vehicle.fuel_type && (
            <div className="flex items-center gap-1">
              <Fuel className="h-3.5 w-3.5" />
              <span>{vehicle.fuel_type}</span>
            </div>
          )}
          {vehicle.transmission && (
            <div className="flex items-center gap-1">
              <Gauge className="h-3.5 w-3.5" />
              <span>{vehicle.transmission}</span>
            </div>
          )}
          {vehicle.horsepower && (
            <div className="flex items-center gap-1">
              <Zap className="h-3.5 w-3.5" />
              <span>{vehicle.horsepower} ch</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
