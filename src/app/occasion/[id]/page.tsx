import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, MapPin, Calendar, Gauge, Phone, Mail, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatRelativeTime } from '@/lib/utils'
import { ImageGallery } from '@/components/vehicles/ImageGallery'
import { UsedListingCard } from '@/components/vehicles/UsedListingCard'
import { FavoriteButton } from '@/components/shared/FavoriteButton'
import { ShareButton } from '@/components/shared/ShareButton'
import { checkIsFavorite } from '@/lib/actions/favorites'

// Use dynamic rendering to ensure newly created listings are immediately available
export const dynamic = 'force-dynamic'

interface PageProps {
  params: {
    id: string
  }
}

export default async function UsedVehicleDetailPage({ params }: PageProps) {
  const supabase = await createClient()

  // Fetch listing details
  const { data: listing, error } = await supabase
    .from('vehicles_used')
    .select(`
      *,
      brands:brand_id (id, name, logo_url),
      models:model_id (id, name, category),
      profiles:user_id (full_name, avatar_url, phone, city)
    `)
    .eq('id', params.id)
    .single()

  if (error || !listing) {
    notFound()
  }

  if (!listing.is_active) {
    notFound()
  }

  // Check if favorited
  const isFavorite = await checkIsFavorite(params.id, 'used')

  // Increment view count
  await supabase
    .from('vehicles_used')
    .update({ views: (listing.views || 0) + 1 })
    .eq('id', params.id)

  // Fetch similar listings
  const { data: similarListings } = await supabase
    .from('vehicles_used')
    .select(`
      *,
      brands:brand_id (name, logo_url),
      models:model_id (name),
      profiles:user_id (full_name, avatar_url)
    `)
    .neq('id', params.id)
    .eq('is_active', true)
    .eq('is_sold', false)
    .or(`brand_id.eq.${listing.brand_id},city.eq.${listing.city}`)
    .limit(4)

  const brandName = listing.brands?.name || 'Unknown'
  const modelName = listing.models?.name || 'Unknown'
  const images = listing.images || []
  const seller = listing.profiles

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/occasion"
            className="inline-flex items-center gap-2 text-secondary hover:text-secondary-400"
          >
            <ChevronLeft className="h-4 w-4" />
            Retour aux annonces
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-card border border-gray-200 overflow-hidden">
              <ImageGallery images={images} alt={`${brandName} ${modelName}`} />
            </div>

            {/* Vehicle Info */}
            <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {listing.brands?.logo_url && (
                      <Image
                        src={listing.brands.logo_url}
                        alt={brandName}
                        width={50}
                        height={50}
                        className="object-contain"
                      />
                    )}
                    <div>
                      <h1 className="text-3xl font-bold text-primary">
                        {brandName} {modelName}
                      </h1>
                      <p className="text-gray-400">{listing.year}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {listing.is_featured && (
                      <Badge variant="warning">EN VEDETTE</Badge>
                    )}
                    <Badge variant={listing.seller_type === 'professional' ? 'secondary' : 'default'}>
                      {listing.seller_type === 'professional' ? 'PROFESSIONNEL' : 'PARTICULIER'}
                    </Badge>
                    {listing.models?.category && (
                      <Badge variant="outline">{listing.models.category}</Badge>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <FavoriteButton
                    vehicleId={listing.id}
                    vehicleType="used"
                    initialIsFavorite={isFavorite}
                  />
                  <ShareButton
                    url={`/occasion/${params.id}`}
                    title={`${brandName} ${modelName} ${listing.year}`}
                    showText
                  />
                </div>
              </div>

              {/* Key Specs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-gray-100 rounded-md">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Année</span>
                  </div>
                  <p className="font-semibold text-primary">{listing.year}</p>
                </div>
                <div className="p-4 bg-gray-100 rounded-md">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <Gauge className="h-4 w-4" />
                    <span className="text-sm">Kilométrage</span>
                  </div>
                  <p className="font-semibold text-primary">{listing.mileage.toLocaleString()} km</p>
                </div>
                <div className="p-4 bg-gray-100 rounded-md">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <span className="text-sm">Carburant</span>
                  </div>
                  <p className="font-semibold text-primary">{listing.fuel_type}</p>
                </div>
                <div className="p-4 bg-gray-100 rounded-md">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <span className="text-sm">Transmission</span>
                  </div>
                  <p className="font-semibold text-primary">{listing.transmission}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xl font-semibold text-primary mb-3">Description</h3>
                <p className="text-gray-500 whitespace-pre-line">
                  {listing.description}
                </p>
              </div>

              {/* Additional Info */}
              {listing.color && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-semibold text-primary mb-2">Informations supplémentaires</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-400">Couleur: </span>
                      <span className="font-medium text-gray-700">{listing.color}</span>
                    </div>
                    {listing.condition && (
                      <div>
                        <span className="text-sm text-gray-400">État: </span>
                        <span className="font-medium text-gray-700">{listing.condition}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Price Card */}
            <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-primary mb-4">Prix</h3>
              <p className="text-3xl font-bold text-secondary mb-4">
                {formatPrice(listing.price)}
              </p>

              {/* Seller Info */}
              <div className="mb-6 p-4 bg-gray-100 rounded-md border border-gray-200">
                <h4 className="font-semibold text-primary mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Vendeur
                </h4>
                <div className="space-y-2">
                  <p className="font-medium text-gray-700">{seller?.full_name || 'Vendeur'}</p>
                  {seller?.city && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <MapPin className="h-4 w-4" />
                      <span>{seller.city}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                {listing.contact_phone && (
                  <a
                    href={`tel:${listing.contact_phone}`}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-md hover:bg-gray-100 transition"
                  >
                    <Phone className="h-5 w-5 text-secondary" />
                    <div>
                      <p className="text-xs text-gray-400">Téléphone</p>
                      <p className="font-semibold text-primary">{listing.contact_phone}</p>
                    </div>
                  </a>
                )}
                {listing.contact_email && (
                  <a
                    href={`mailto:${listing.contact_email}`}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-md hover:bg-gray-100 transition"
                  >
                    <Mail className="h-5 w-5 text-secondary" />
                    <div>
                      <p className="text-xs text-gray-400">Email</p>
                      <p className="font-semibold text-sm text-primary break-all">{listing.contact_email}</p>
                    </div>
                  </a>
                )}
              </div>

              {/* Location & Stats */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <MapPin className="h-4 w-4" />
                  <span>{listing.city}</span>
                </div>
                <p className="text-sm text-gray-500">
                  <span className="font-semibold text-secondary">{listing.views || 0}</span> vues
                </p>
                <p className="text-xs text-gray-400">
                  Publiée {formatRelativeTime(listing.created_at)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Listings */}
        {similarListings && similarListings.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-primary mb-6">
              Annonces Similaires
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarListings.map((similar) => (
                <UsedListingCard key={similar.id} listing={similar} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
