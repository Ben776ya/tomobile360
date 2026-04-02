import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { ChevronRight, Fuel, Gauge, Zap, Calendar } from 'lucide-react'

export const revalidate = 60

interface PageProps {
  params: {
    brand: string
    model: string
  }
}

export async function generateMetadata({ params }: PageProps) {
  const brandSlug = decodeURIComponent(params.brand)
  const modelSlug = decodeURIComponent(params.model)

  return {
    title: `${brandSlug.charAt(0).toUpperCase() + brandSlug.slice(1)} ${modelSlug.charAt(0).toUpperCase() + modelSlug.slice(1)} - Versions | Tomobile 360`,
    description: `Comparez toutes les versions du ${brandSlug} ${modelSlug} disponibles au Maroc. Prix, équipements et fiches techniques.`,
  }
}

export default async function ModelVersionsPage({ params }: PageProps) {
  const supabase = await createClient()
  const brandSlug = decodeURIComponent(params.brand).toLowerCase()
  const modelSlug = decodeURIComponent(params.model).toLowerCase()

  // Resolve brand by name (case-insensitive via lowercase comparison)
  const { data: brands } = await supabase
    .from('brands')
    .select('id, name, logo_url')

  const brand = brands?.find(b => b.name.toLowerCase() === brandSlug)
  if (!brand) notFound()

  // Resolve model by name within that brand
  const { data: models } = await supabase
    .from('models')
    .select('id, name, category')
    .eq('brand_id', brand.id)

  const model = models?.find(m => m.name.toLowerCase() === modelSlug)
  if (!model) notFound()

  // Fetch all available vehicles for this brand+model
  const { data: vehicles } = await supabase
    .from('vehicles_new')
    .select(`
      id, version, year, price_min, price_max, fuel_type, transmission, horsepower, engine_size,
      images, is_new_release, is_popular,
      promotions (discount_percentage, is_active)
    `)
    .eq('brand_id', brand.id)
    .eq('model_id', model.id)
    .eq('is_available', true)
    .order('price_min', { ascending: true, nullsFirst: false })

  if (!vehicles || vehicles.length === 0) notFound()

  // If only 1 version, redirect to detail page
  if (vehicles.length === 1) {
    const { redirect } = await import('next/navigation')
    redirect(`/neuf/${brandSlug}/${modelSlug}/${vehicles[0].id}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
          <Link href="/neuf" className="hover:text-secondary transition-colors">
            Véhicules neufs
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link
            href={`/neuf?brand=${brand.id}`}
            className="hover:text-secondary transition-colors"
          >
            {brand.name}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-primary font-medium">{model.name}</span>
        </nav>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          {brand.logo_url && (
            <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
              <Image
                src={brand.logo_url}
                alt={brand.name}
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
          )}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary">
              {brand.name} {model.name}
            </h1>
            <p className="text-gray-500 mt-1">
              {vehicles.length} version{vehicles.length > 1 ? 's' : ''} disponible{vehicles.length > 1 ? 's' : ''}
              {model.category && (
                <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {model.category}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Versions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {vehicles.map((v) => {
            const mainImage = v.images?.[0] || '/placeholder-car.svg'
            const activePromo = (v.promotions as { discount_percentage: number | null; is_active?: boolean }[] | null)
              ?.find(p => p.discount_percentage && p.discount_percentage > 0 && p.is_active !== false)

            return (
              <Link
                key={v.id}
                href={`/neuf/${brandSlug}/${modelSlug}/${v.id}`}
                className="group block bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover hover:border-secondary/20"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  <Image
                    src={mainImage}
                    alt={`${brand.name} ${model.name} ${v.version || ''}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />

                  {/* Price */}
                  <div className="absolute top-3 right-3">
                    <div className="bg-secondary text-white font-semibold text-sm px-3 py-1.5 rounded-lg">
                      {v.price_min ? formatPrice(v.price_min) : 'Prix sur demande'}
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {activePromo && (
                      <Badge className="bg-secondary hover:bg-secondary text-white border-0 font-bold">
                        -{activePromo.discount_percentage}%
                      </Badge>
                    )}
                    {v.is_new_release && (
                      <Badge className="bg-green-500 hover:bg-green-500 text-white border-0 shadow-md">
                        NOUVEAU
                      </Badge>
                    )}
                    {v.is_popular && (
                      <Badge className="bg-primary hover:bg-primary text-white border-0 shadow-glow-indigo-sm">
                        POPULAIRE
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-primary text-base sm:text-lg group-hover:text-secondary transition-colors mb-1 line-clamp-1">
                    {v.version || `${brand.name} ${model.name}`}
                  </h3>

                  {/* Price range */}
                  {v.price_min && v.price_max && v.price_max > v.price_min ? (
                    <p className="text-sm text-gray-500 mb-3">
                      {formatPrice(v.price_min)} - {formatPrice(v.price_max)}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 mb-3">
                      {v.price_min ? `A partir de ${formatPrice(v.price_min)}` : '\u00A0'}
                    </p>
                  )}

                  {/* Specs */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                    {v.year && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{v.year}</span>
                      </div>
                    )}
                    {v.fuel_type && (
                      <div className="flex items-center gap-1">
                        <Fuel className="h-3.5 w-3.5" />
                        <span>{v.fuel_type}</span>
                      </div>
                    )}
                    {v.transmission && (
                      <div className="flex items-center gap-1">
                        <Gauge className="h-3.5 w-3.5" />
                        <span>{v.transmission}</span>
                      </div>
                    )}
                    {v.horsepower && (
                      <div className="flex items-center gap-1">
                        <Zap className="h-3.5 w-3.5" />
                        <span>{v.horsepower} ch</span>
                      </div>
                    )}
                    {v.engine_size && (
                      <div className="flex items-center gap-1">
                        <span>{v.engine_size}L</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Back link */}
        <div className="mt-8 text-center">
          <Link
            href="/neuf"
            className="inline-block px-6 py-3 bg-secondary hover:bg-secondary-400 text-white font-semibold rounded-xl shadow-gold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            Retour au catalogue
          </Link>
        </div>
      </div>
    </div>
  )
}
