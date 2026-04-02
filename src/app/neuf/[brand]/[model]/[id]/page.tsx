import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import { VehicleSpecs } from '@/components/vehicles/VehicleSpecs'
import { ImageGallery } from '@/components/vehicles/ImageGallery'
import { VehicleCard } from '@/components/vehicles/VehicleCard'
import { ShareButton } from '@/components/shared/ShareButton'
import { ContactDealerDialog } from '@/components/shared/ContactDealerDialog'
import { TestDriveDialog } from '@/components/shared/TestDriveDialog'

export const revalidate = 60

const TOMOBILE_PHONE = '212XXX000000' // TODO: Replace with real Tomobile 360 WhatsApp number
const TOMOBILE_PHONE_DISPLAY = '+212 XXX-000000' // TODO: Replace with real display number

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

  const canonicalUrl = `https://tomobile360.ma/neuf/${params.brand}/${params.model}/${params.id}`
  const title = `${vehicle.brands?.name} ${vehicle.models?.name} ${vehicle.year} - Tomobile 360`
  const description = `Découvrez le ${vehicle.brands?.name} ${vehicle.models?.name} ${vehicle.year}. Prix à partir de ${formatPrice(vehicle.price_min || 0)}`
  const ogImage = vehicle.images?.[0] || '/og-image.png'

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      images: [{ url: ogImage, width: 1200, height: 630 }],
      type: 'website' as const,
      siteName: 'Tomobile 360',
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description,
      images: [ogImage],
    },
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

  // Increment view count
  void supabase.rpc('increment_vehicle_views', { vehicle_id: vehicle.id })

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

  const whatsappText = encodeURIComponent(`Bonjour, je suis intéressé(e) par la ${brandName} ${modelName} sur Tomobile 360.`)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 pb-20 lg:pb-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-gray-500 mb-6 overflow-x-auto scrollbar-hide pb-1">
          <Link href="/" className="hover:text-[#006EFE] transition-colors">Accueil</Link>
          <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
          <Link href="/neuf" className="hover:text-[#006EFE] transition-colors">Voitures Neuves</Link>
          <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
          <Link href={`/neuf?brand=${vehicle.brand_id}`} className="hover:text-[#006EFE] transition-colors">
            {brandName}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-gray-800 font-medium">{modelName}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden p-4">
              <ImageGallery images={images} alt={`${brandName} ${modelName}`} />
            </div>

            {/* Vehicle Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
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

                  <div className="flex flex-wrap items-center gap-2 mb-4">
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
                    <div className="flex items-center gap-1.5 text-sm text-gray-400 ml-1">
                      <Eye className="h-4 w-4" />
                      <span>Vu {vehicle.views?.toLocaleString() || 0} fois</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
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
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-4">
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
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-sm font-semibold text-amber-700 mb-1">
                    {promotion.title}
                  </p>
                  <p className="text-xs text-amber-600/80">
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
                {/* WhatsApp CTA — primary contact */}
                <a
                  href={`https://wa.me/${TOMOBILE_PHONE}?text=${whatsappText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-[#25D366] hover:bg-[#20BD5A] text-white font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Contacter via WhatsApp
                </a>
                <ContactDealerDialog
                  vehicleName={`${brandName} ${modelName} ${vehicle.year}`}
                  dealerEmail="contact@tomobile360.ma"
                  dealerPhone={TOMOBILE_PHONE_DISPLAY}
                />
                <TestDriveDialog
                  vehicleName={`${brandName} ${modelName} ${vehicle.year}`}
                  dealerPhone={TOMOBILE_PHONE}
                />
                <Link href="/neuf/comparer" className="block">
                  <Button variant="outline" className="w-full shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                    Comparer ce véhicule
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-1.5 text-sm text-gray-400">
                  <Eye className="h-4 w-4" />
                  <span>Vu {vehicle.views?.toLocaleString() || 0} fois</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Car',
                  name: `${brandName} ${modelName}`,
                  brand: { '@type': 'Brand', name: brandName },
                  model: modelName,
                  vehicleModelDate: vehicle.year?.toString(),
                  fuelType: vehicle.fuel_type,
                  offers: {
                    '@type': 'AggregateOffer',
                    priceCurrency: 'MAD',
                    lowPrice: vehicle.price_min,
                    highPrice: vehicle.price_max || vehicle.price_min,
                    availability: vehicle.is_available
                      ? 'https://schema.org/InStock'
                      : 'https://schema.org/OutOfStock',
                  },
                },
                {
                  '@type': 'BreadcrumbList',
                  itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://tomobile360.ma' },
                    { '@type': 'ListItem', position: 2, name: 'Voitures Neuves', item: 'https://tomobile360.ma/neuf' },
                    { '@type': 'ListItem', position: 3, name: brandName, item: `https://tomobile360.ma/neuf?brand=${vehicle.brand_id}` },
                    { '@type': 'ListItem', position: 4, name: `${brandName} ${modelName}` },
                  ],
                },
              ],
            }),
          }}
        />

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

      {/* Sticky Mobile Contact Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-gray-200 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex gap-3 shadow-lg">
        <a
          href={`https://wa.me/${TOMOBILE_PHONE}?text=${whatsappText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#25D366] text-white font-semibold rounded-xl text-sm"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          WhatsApp
        </a>
        <a
          href={`tel:${TOMOBILE_PHONE_DISPLAY}`}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#006EFE] text-white font-semibold rounded-xl text-sm"
        >
          Appeler
        </a>
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
