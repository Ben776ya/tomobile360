import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, MapPin, Calendar, Gauge, Phone, Mail, User, Eye, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatRelativeTime } from '@/lib/utils'
import { ImageGallery } from '@/components/vehicles/ImageGallery'
import { UsedListingCard } from '@/components/vehicles/UsedListingCard'
import { ShareButton } from '@/components/shared/ShareButton'

// Use dynamic rendering to ensure newly created listings are immediately available
export const dynamic = 'force-dynamic'

interface PageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: PageProps) {
  const supabase = await createClient()
  const { data: listing } = await supabase
    .from('vehicles_used')
    .select(`
      price, year, city, fuel_type, mileage, images,
      brands:brand_id (name),
      models:model_id (name)
    `)
    .eq('id', params.id)
    .single()

  if (!listing) return { title: 'Annonce non trouvée | Tomobile 360' }

  const brandName = (listing.brands as any)?.name || ''
  const modelName = (listing.models as any)?.name || ''
  const price = listing.price
    ? `${Math.round(listing.price).toLocaleString('fr-MA')} DH`
    : ''

  const canonicalUrl = `https://tomobile360.ma/occasion/${params.id}`
  const ogImage = (listing as any).images?.[0] || '/og-image.png'

  return {
    title: `${brandName} ${modelName} ${listing.year} — ${price} | Occasion Maroc`,
    description: `${brandName} ${modelName} ${listing.year}, ${listing.mileage?.toLocaleString('fr-MA')} km, ${listing.fuel_type}, ${listing.city}. Achetez votre voiture d'occasion au Maroc sur Tomobile 360.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${brandName} ${modelName} ${listing.year} — ${price}`,
      description: `${listing.city} · ${listing.mileage?.toLocaleString('fr-MA')} km · ${listing.fuel_type}`,
      url: canonicalUrl,
      images: [{ url: ogImage, width: 1200, height: 630 }],
      type: 'website' as const,
      siteName: 'Tomobile 360',
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: `${brandName} ${modelName} ${listing.year} — ${price}`,
      description: `${listing.city} · ${listing.mileage?.toLocaleString('fr-MA')} km · ${listing.fuel_type}`,
      images: [ogImage],
    },
  }
}

export default async function UsedVehicleDetailPage({ params }: PageProps) {
  const supabase = await createClient()

  const [{ data: listing, error }] = await Promise.all([
    supabase.from('vehicles_used')
      .select(`
        *,
        brands:brand_id (id, name, logo_url),
        models:model_id (id, name, category),
        profiles:user_id (full_name, avatar_url, phone, city)
      `)
      .eq('id', params.id)
      .single()
  ])

  // notFound guard between Wave A and Wave B (per D-08)
  if (error || !listing) {
    notFound()
  }

  if (!listing.is_active) {
    notFound()
  }


  // Fire-and-forget atomic view increment (per D-04, D-05) — NOT in Promise.all
  void supabase.rpc('increment_used_vehicle_views', { vehicle_id: listing.id })

  // Fetch similar listings
  const { data: similarListings } = await supabase.from('vehicles_used')
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

  const whatsappPhone = listing.contact_phone
    ? listing.contact_phone.replace(/\D/g, '').replace(/^0/, '212')
    : ''
  const whatsappText = encodeURIComponent(
    `Bonjour, je suis interesse(e) par votre annonce ${brandName} ${modelName} ${listing.year} sur Tomobile 360.`
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 pb-20 lg:pb-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-[#006EFE] transition-colors">Accueil</Link>
          <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
          <Link href="/occasion" className="hover:text-[#006EFE] transition-colors">Occasion</Link>
          <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
          <Link href={`/occasion?brand=${listing.brand_id}`} className="hover:text-[#006EFE] transition-colors">
            {brandName}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-gray-800 font-medium">{modelName}</span>
        </nav>

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
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-gray-400">{listing.year}</p>
                        <div className="flex items-center gap-1 text-sm text-gray-400">
                          <Eye className="h-4 w-4" />
                          <span>Vu {(listing.views || 0).toLocaleString()} fois</span>
                        </div>
                      </div>
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

              {/* WhatsApp CTA and Contact Info */}
              <a
                href={`https://wa.me/${whatsappPhone}?text=${whatsappText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl text-white font-semibold text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98] mb-3"
                style={{ backgroundColor: '#25D366' }}
              >
                <MessageCircle className="h-5 w-5" />
                Contacter sur WhatsApp
              </a>

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

      {/* Sticky mobile contact bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 truncate">{brandName} {modelName} {listing.year}</p>
          <p className="font-bold text-secondary text-sm">{formatPrice(listing.price)}</p>
        </div>
        {listing.contact_phone && (
          <a
            href={`tel:${listing.contact_phone}`}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm whitespace-nowrap"
          >
            <Phone className="h-4 w-4" />
            Appeler
          </a>
        )}
        <a
          href={`https://wa.me/${whatsappPhone}?text=${whatsappText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white font-semibold text-sm whitespace-nowrap"
          style={{ backgroundColor: '#25D366' }}
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </a>
      </div>
    </div>
  )
}
