import Link from 'next/link'
import Image from 'next/image'
import { VehicleUsed } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { cn, formatPrice, formatRelativeTime } from '@/lib/utils'
import { MapPin, Calendar, Gauge, Eye, Fuel } from 'lucide-react'

interface UsedListingCardProps {
  listing: VehicleUsed & {
    brands?: { name: string; logo_url: string | null }
    models?: { name: string }
    profiles?: { full_name: string | null }
  }
}

export function UsedListingCard({ listing }: UsedListingCardProps) {
  const mainImage = listing.images?.[0] || '/placeholder-car.jpg'
  const brandName = listing.brands?.name || 'Unknown'
  const modelName = listing.models?.name || 'Unknown'

  return (
    <Link
      href={`/occasion/${listing.id}`}
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
          alt={`${brandName} ${modelName} ${listing.year}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />

        {/* Price Badge */}
        <div className="absolute top-3 right-3">
          <div className="bg-secondary text-white font-semibold text-sm px-3 py-1.5 rounded-lg">
            {formatPrice(listing.price)}
          </div>
        </div>

        {/* Status Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {listing.is_featured && (
            <Badge className="bg-orange-500 hover:bg-orange-500 text-white border-0 shadow-md">
              EN VEDETTE
            </Badge>
          )}
          <Badge
            className={`shadow-md border-0 ${
              listing.seller_type === 'professional'
                ? 'bg-primary hover:bg-primary text-white shadow-glow-indigo-sm'
                : 'bg-gray-100 hover:bg-gray-100 text-gray-700 border border-gray-200'
            }`}
          >
            {listing.seller_type === 'professional' ? 'PRO' : 'PARTICULIER'}
          </Badge>
        </div>

        {/* Brand Logo */}
        {listing.brands?.logo_url && (
          <div className="absolute bottom-3 left-3 bg-white rounded-lg p-2 border border-gray-200">
            <Image
              src={listing.brands.logo_url}
              alt={brandName}
              width={36}
              height={36}
              className="object-contain opacity-70"
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-primary mb-2 text-base md:text-lg group-hover:text-secondary transition-colors line-clamp-1">
          {brandName} {modelName} {listing.year}
        </h3>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{listing.year}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Gauge className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{listing.mileage.toLocaleString()} km</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Fuel className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{listing.fuel_type || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{listing.city}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Eye className="h-3.5 w-3.5" />
            <span>{listing.views} vues</span>
          </div>
          <span className="text-xs text-gray-400">
            {formatRelativeTime(listing.created_at)}
          </span>
        </div>
      </div>
    </Link>
  )
}
