import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import { VehicleSpecs } from '@/components/vehicles/VehicleSpecs'
import { ImageGallery } from '@/components/vehicles/ImageGallery'
import { VehicleCard } from '@/components/vehicles/VehicleCard'
import { FavoriteButton } from '@/components/shared/FavoriteButton'
import { ShareButton } from '@/components/shared/ShareButton'
import { ContactDealerDialog } from '@/components/shared/ContactDealerDialog'
import { TestDriveDialog } from '@/components/shared/TestDriveDialog'
import { checkIsFavorite } from '@/lib/actions/favorites'

export const revalidate = 60

interface PageProps {
  params: {
    id: string
    brand: string
    model: string
  }
}

export async function generateMetadata({ params }: PageProps) {
  const supabase = await createClient()

  const { data: vehicle } = await supabase
    .from('vehicles_new')
    .select(`
      *,
      brands:brand_id (name),
      models:model_id (name)
    `)
    .eq('id', params.id)
    .single()

  if (!vehicle) {
    return {
      title: 'Véhicule non trouvé',
    }
  }

  return {
    title: `${vehicle.brands?.name} ${vehicle.models?.name} ${vehicle.year} - Tomobile 360`,
    description: `Découvrez le ${vehicle.brands?.name} ${vehicle.models?.name} ${vehicle.year}. Prix à partir de ${formatPrice(vehicle.price_min || 0)}`,
  }
}

export default async function VehicleDetailPage({ params }: PageProps) {
  const supabase = await createClient()

  // Fetch vehicle details
  const { data: vehicle } = await supabase
    .from('vehicles_new')
    .select(`
      *,
      brands:brand_id (id, name, logo_url),
      models:model_id (id, name, category)
    `)
    .eq('id', params.id)
    .single()

  if (!vehicle) {
    notFound()
  }

  // Check if favorited
  const isFavorite = await checkIsFavorite(params.id, 'new')

  // Increment view count
  await supabase
    .from('vehicles_new')
    .update({ views: (vehicle.views || 0) + 1 })
    .eq('id', params.id)

  // Fetch similar vehicles (same brand or category)
  const { data: similarVehicles } = await supabase
    .from('vehicles_new')
    .select(`
      *,
      brands:brand_id (name, logo_url),
      models:model_id (name)
    `)
    .neq('id', params.id)
    .or(`brand_id.eq.${vehicle.brand_id},model_id.in.(${await getSameCategoryModels(supabase, vehicle.models?.category)})`)
    .limit(4)

  // Check for active promotions
  const { data: promotion } = await supabase
    .from('promotions')
    .select('*')
    .eq('vehicle_id', params.id)
    .eq('is_active', true)
    .gte('valid_until', new Date().toISOString())
    .single()

  const brandName = vehicle.brands?.name || 'Unknown'
  const modelName = vehicle.models?.name || 'Unknown'
  const images = vehicle.images || []

  const priceDisplay = vehicle.price_min && vehicle.price_max
    ? `${formatPrice(vehicle.price_min)} - ${formatPrice(vehicle.price_max)}`
    : vehicle.price_min
    ? `À partir de ${formatPrice(vehicle.price_min)}`
    : 'Prix sur demande'

  // Calculate discounted price if promotion exists
  let finalPrice = vehicle.price_min || 0
  if (promotion) {
    const discountAmount = promotion.discount_percentage
      ? (finalPrice * promotion.discount_percentage) / 100
      : promotion.discount_amount || 0
    finalPrice = finalPrice - discountAmount
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/neuf"
            className="inline-flex items-center gap-2 text-secondary hover:text-secondary-400"
          >
            <ChevronLeft className="h-4 w-4" />
            Retour aux véhicules neufs
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
                    {vehicle.brands?.logo_url && (
                      <Image
                        src={vehicle.brands.logo_url}
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
                      <p className="text-gray-400">{vehicle.year}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {vehicle.is_new_release && (
                      <Badge variant="success">NOUVEAU</Badge>
                    )}
                    {vehicle.is_popular && (
                      <Badge variant="secondary">POPULAIRE</Badge>
                    )}
                    {vehicle.models?.category && (
                      <Badge variant="outline">{vehicle.models.category}</Badge>
                    )}
                    {promotion && (
                      <Badge variant="destructive">
                        PROMOTION -{promotion.discount_percentage}%
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <FavoriteButton
                    vehicleId={vehicle.id}
                    vehicleType="new"
                    initialIsFavorite={isFavorite}
                  />
                  <ShareButton
                    url={`/neuf/${params.brand}/${params.model}/${params.id}`}
                    title={`${brandName} ${modelName} ${vehicle.year}`}
                    showText
                  />
                </div>
              </div>

              {/* Version */}
              {vehicle.version && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-primary mb-2">Version</h3>
                  <p className="text-gray-500">{vehicle.version}</p>
                </div>
              )}

              {/* Specifications */}
              <VehicleSpecs vehicle={vehicle} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Price Card */}
            <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-primary mb-4">Prix</h3>

              {promotion ? (
                <div className="mb-4">
                  <p className="text-sm text-gray-400 line-through">
                    {formatPrice(vehicle.price_min || 0)}
                  </p>
                  <p className="text-3xl font-bold text-secondary">
                    {formatPrice(finalPrice)}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    Économisez {formatPrice((vehicle.price_min || 0) - finalPrice)}
                  </p>
                </div>
              ) : (
                <p className="text-3xl font-bold text-secondary mb-4">
                  {priceDisplay}
                </p>
              )}

              {promotion && (
                <div className="mb-4 p-3 bg-[#78350f]/20 border border-[#FFC358]/30 rounded-md">
                  <p className="text-sm font-semibold text-[#FFC358] mb-1">
                    {promotion.title}
                  </p>
                  <p className="text-xs text-[#FFC358]/80">
                    Valable jusqu&apos;au{' '}
                    {new Date(promotion.valid_until).toLocaleDateString('fr-MA', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <ContactDealerDialog
                  vehicleName={`${brandName} ${modelName} ${vehicle.year}`}
                  dealerEmail="contact@tomobile360.ma"
                  dealerPhone="+212 5XX XXX XXX"
                />
                <TestDriveDialog
                  vehicleName={`${brandName} ${modelName} ${vehicle.year}`}
                />
                <Link href="/neuf/comparer" className="block">
                  <Button variant="outline" className="w-full shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                    Comparer ce véhicule
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  <span className="font-semibold text-secondary">
                    {vehicle.views || 0}
                  </span>{' '}
                  vues
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Vehicles */}
        {similarVehicles && similarVehicles.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-primary mb-6">
              Véhicules Similaires
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarVehicles.map((similar) => (
                <VehicleCard key={similar.id} vehicle={similar} showBadges />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

async function getSameCategoryModels(
  supabase: any,
  category?: string | null
): Promise<string> {
  if (!category) return ''

  const { data: models } = await supabase
    .from('models')
    .select('id')
    .eq('category', category)
    .limit(10)

  return models?.map((m: any) => m.id).join(',') || ''
}
