import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { cn, formatPrice } from '@/lib/utils'
import { Fuel, Gauge, Layers } from 'lucide-react'

export interface ModelGroup {
  brandId: string
  brandName: string
  brandLogo: string | null
  modelId: string
  modelName: string
  minPrice: number | null
  maxPrice: number | null
  mainImage: string
  versionCount: number
  fuelTypes: string[]
  transmissions: string[]
  hasNewRelease: boolean
  hasPopular: boolean
  hasPromo: boolean
  /** The vehicle ID to link to directly when there's only 1 version */
  singleVehicleId?: string
}

interface ModelCardProps {
  model: ModelGroup
}

export function ModelCard({ model }: ModelCardProps) {
  const priceDisplay = model.minPrice
    ? `À partir de ${formatPrice(model.minPrice)}`
    : 'Prix sur demande'

  // If 1 version → go straight to detail page; multiple → go to model versions page
  const href = model.singleVehicleId
    ? `/neuf/${model.brandName.toLowerCase()}/${model.modelName.toLowerCase()}/${model.singleVehicleId}`
    : `/neuf/${model.brandName.toLowerCase()}/${model.modelName.toLowerCase()}`

  return (
    <Link
      href={href}
      className={cn(
        'group block bg-white rounded-xl border border-gray-200 overflow-hidden',
        'transition-all duration-200',
        'hover:-translate-y-0.5 hover:shadow-card-hover hover:border-secondary/20'
      )}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <Image
          src={model.mainImage}
          alt={`${model.brandName} ${model.modelName}`}
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
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {model.hasPromo && (
            <Badge className="bg-secondary hover:bg-secondary text-white border-0 font-bold">
              PROMO
            </Badge>
          )}
          {model.hasNewRelease && (
            <Badge className="bg-green-500 hover:bg-green-500 text-white border-0 shadow-md">
              NOUVEAU
            </Badge>
          )}
          {model.hasPopular && (
            <Badge className="bg-primary hover:bg-primary text-white border-0 shadow-glow-indigo-sm">
              POPULAIRE
            </Badge>
          )}
        </div>

        {/* Brand Logo */}
        {model.brandLogo && (
          <div className="absolute bottom-3 left-3 bg-white rounded-lg p-2 border border-gray-200">
            <Image
              src={model.brandLogo}
              alt={model.brandName}
              width={36}
              height={36}
              className="object-contain opacity-70"
            />
          </div>
        )}

        {/* Version count badge */}
        {model.versionCount > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1">
            <Layers className="h-3 w-3" />
            {model.versionCount} versions
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4">
        <h3 className="font-bold text-primary mb-1 text-sm sm:text-base md:text-lg group-hover:text-secondary transition-colors line-clamp-1">
          {model.brandName} {model.modelName}
        </h3>
        {model.versionCount > 1 ? (
          <p className="text-sm text-gray-500 mb-3">
            {model.versionCount} versions disponibles
          </p>
        ) : (
          <p className="text-sm text-gray-500 mb-3 line-clamp-1">
            {model.minPrice && model.maxPrice && model.maxPrice > model.minPrice
              ? `${formatPrice(model.minPrice)} - ${formatPrice(model.maxPrice)}`
              : '\u00A0'}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
          {model.fuelTypes.length > 0 && (
            <div className="flex items-center gap-1">
              <Fuel className="h-3.5 w-3.5" />
              <span>{model.fuelTypes.join(', ')}</span>
            </div>
          )}
          {model.transmissions.length > 0 && (
            <div className="flex items-center gap-1">
              <Gauge className="h-3.5 w-3.5" />
              <span>{model.transmissions.join(', ')}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
