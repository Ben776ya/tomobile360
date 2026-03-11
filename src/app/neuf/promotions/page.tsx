import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'

export const revalidate = 60

export default async function PromotionsPage() {
  const supabase = await createClient()

  const { data: promotions } = await supabase
    .from('promotions')
    .select(`
      *,
      vehicles_new:vehicle_id (
        *,
        brands:brand_id (name, logo_url),
        models:model_id (name)
      )
    `)
    .eq('is_active', true)
    .gte('valid_until', new Date().toISOString())
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/neuf"
            className="inline-flex items-center gap-2 text-secondary hover:text-secondary-400 mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            Retour aux véhicules neufs
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
            Promotions du Moment
          </h1>
          <p className="text-gray-500">
            Profitez des meilleures offres et remises sur nos véhicules neufs
          </p>
        </div>

        {/* Results Count */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-card border border-gray-200">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-secondary">
              {promotions?.length || 0}
            </span>{' '}
            promotion{promotions && promotions.length > 1 ? 's' : ''} active
            {promotions && promotions.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Promotions Grid */}
        {promotions && promotions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promotions.map((promo) => {
              const vehicle = promo.vehicles_new
              if (!vehicle) return null

              const mainImage = vehicle.images?.[0] || '/placeholder-car.jpg'
              const brandName = vehicle.brands?.name || 'Unknown'
              const modelName = vehicle.models?.name || 'Unknown'

              const originalPrice = vehicle.price_min || 0
              const discountAmount = promo.discount_percentage
                ? (originalPrice * promo.discount_percentage) / 100
                : promo.discount_amount || 0
              const finalPrice = originalPrice - discountAmount

              return (
                <Link
                  key={promo.id}
                  href={`/neuf/${brandName.toLowerCase()}/${modelName.toLowerCase()}/${vehicle.id}`}
                  className="group block bg-white rounded-lg shadow-card border border-gray-200 hover:border-secondary/20 hover:shadow-elevated transition-all duration-300 overflow-hidden"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                    <Image
                      src={mainImage}
                      alt={`${brandName} ${modelName}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Promotion Badge */}
                    <div className="absolute top-2 left-2">
                      <Badge variant="destructive" className="shadow-md text-base px-3 py-1">
                        {promo.discount_percentage
                          ? `-${promo.discount_percentage}%`
                          : `-${formatPrice(promo.discount_amount || 0)}`}
                      </Badge>
                    </div>

                    {/* Brand Logo */}
                    {vehicle.brands?.logo_url && (
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-md p-2 shadow-card border border-gray-200">
                        <Image
                          src={vehicle.brands.logo_url}
                          alt={brandName}
                          width={40}
                          height={40}
                          className="object-contain"
                        />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-primary mb-2 group-hover:text-secondary transition-colors">
                      {promo.title}
                    </h3>

                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                      {promo.description}
                    </p>

                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm text-gray-400 line-through">
                          {formatPrice(originalPrice)}
                        </p>
                        <p className="text-2xl font-bold text-secondary">
                          {formatPrice(finalPrice)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Valable jusqu&apos;au</p>
                        <p className="text-sm font-medium text-gray-700">
                          {new Date(promo.valid_until).toLocaleDateString('fr-MA', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-400">
                        {brandName} {modelName} {vehicle.year}
                      </p>
                    </div>
                  </div>

                  {/* Hover effect line */}
                  <div className="h-1 bg-gradient-to-r from-secondary to-secondary-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
            <p className="text-gray-500">
              Aucune promotion active pour le moment. Revenez bientôt!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
