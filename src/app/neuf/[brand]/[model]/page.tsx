// src/app/neuf/[brand]/[model]/page.tsx
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, Calculator, ChevronRight } from 'lucide-react'
import { formatViewsLabel } from '@/lib/views'
import { createClient } from '@/lib/supabase/server'
import { slug } from '@/lib/slug'
import { JsonLd } from '@/components/seo/JsonLd'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import { VehicleSpecs, KeySpecsStrip } from '@/components/vehicles/VehicleSpecs'
import { ImageGallery } from '@/components/vehicles/ImageGallery'
import { ModelCard, type ModelGroup } from '@/components/vehicles/ModelCard'
import { buildModelGroups, type VehicleRowForGrouping } from '@/lib/vehicles/group-by-model'
import { rankSimilarModels } from '@/lib/vehicles/similar-vehicles'
import { isMeaningfulSpecValue } from '@/lib/vehicles/spec-value'
import { buildModelFaq } from '@/lib/vehicles/model-faq'
import { fuelLabel, transmissionLabel } from '@/lib/vehicles/display-labels'
import { fuelTypeToEnergyParam, type EnergyKind } from '@/lib/outils/cout-100km'
import { VideoCard } from '@/components/videos/VideoCard'
import { LazyVideoEmbed } from '@/components/videos/LazyVideoEmbed'
import { filterVideosForCar } from '@/lib/videos/match-video-to-car'
import { getMappedVideosForModel } from '@/lib/videos/video-model-map'
import { ArticleCard } from '@/components/articles/ArticleCard'
import { filterArticlesForBrand } from '@/lib/articles/match-article-to-brand'
import { ShareButton } from '@/components/shared/ShareButton'
import { ContactDealerDialog } from '@/components/shared/ContactDealerDialog'
import { TestDriveDialog } from '@/components/shared/TestDriveDialog'
import { TrackedLink } from '@/components/analytics/TrackedLink'
import type { Variant } from '@/lib/types'
import { BUSINESS_INFO } from '@/lib/business-info'

// Shape of a row from the `models` table joined with `brands`. Supabase's
// PostgREST may surface the join as a single object OR a single-element array
// depending on FK cardinality inference, so callers must defensively check.
type ModelBrandJoinRow = {
  id: string
  name: string
  category: string | null
  brands:
    | { id: string; name: string; logo_url: string | null; description: string | null; origin: string | null }
    | { id: string; name: string; logo_url: string | null; description: string | null; origin: string | null }[]
    | null
}

export const revalidate = 60


interface PageProps {
  params: { brand: string; model: string }
}

async function resolveModel(brandParam: string, modelParam: string) {
  const supabase = await createClient()

  const { data: models } = await supabase
    .from('models')
    .select('id, name, category, brands(id, name, logo_url, description, origin)')

  const target = ((models ?? []) as ModelBrandJoinRow[]).find(m => {
    const brandName = Array.isArray(m.brands) ? m.brands[0]?.name : m.brands?.name
    if (!brandName) return false
    return slug(brandName) === slug(brandParam) && slug(m.name) === slug(modelParam)
  })

  if (!target) return null

  const brand = Array.isArray(target.brands) ? target.brands[0] : target.brands

  const { data: vehicle } = await supabase
    .from('vehicles_new')
    .select(`
      id, brand_id, model_id, version, year,
      price_min, price_max, fuel_type, transmission,
      engine_size, cylinders, horsepower, torque,
      acceleration, top_speed,
      fuel_consumption_city, fuel_consumption_highway, fuel_consumption_combined,
      co2_emissions, dimensions, cargo_capacity, seating_capacity,
      features, safety_features, images,
      is_available, is_popular, is_new_release, is_coming_soon,
      doors, warranty_months, exterior_color, interior_color,
      euro_norm, vat_deductible, power_kw, mileage,
      variant_list,
      views, created_at, updated_at,
      promotions (discount_percentage, is_active, valid_until, title, description)
    `)
    .eq('model_id', target.id)
    .eq('is_available', true)
    .maybeSingle()

  if (!vehicle) return null

  const variants: Variant[] = Array.isArray(vehicle.variant_list) && vehicle.variant_list.length > 0
    ? (vehicle.variant_list as Variant[])
    : [{
        version: vehicle.version,
        price_min: vehicle.price_min,
        price_max: vehicle.price_max,
        horsepower: vehicle.horsepower,
        fuel_type: vehicle.fuel_type,
        transmission: vehicle.transmission,
      }]

  return {
    model: { id: target.id as string, name: target.name as string, category: target.category as string | null },
    brand: { id: brand?.id as string, name: brand?.name as string, logo_url: brand?.logo_url as string | null, description: brand?.description as string | null, origin: brand?.origin as string | null },
    vehicle: vehicle as any,
    variants,
  }
}

export async function generateMetadata({ params }: PageProps) {
  const resolved = await resolveModel(params.brand, params.model)
  if (!resolved) return { title: 'Modèle non trouvé' }

  const { brand, model, vehicle, variants } = resolved
  const variantPrices = variants.map(v => v.price_min).filter((p): p is number => p != null && p > 0)
  const minPrice = variantPrices.length > 0 ? Math.min(...variantPrices) : null
  const year = new Date().getFullYear()
  const canonicalUrl = `https://www.tomobile360.ma/neuf/${slug(brand.name)}/${slug(model.name)}`
  const title = `Prix ${brand.name} ${model.name} Maroc ${year} — Fiche Technique et Versions`
  const description = minPrice
    ? `Prix du ${brand.name} ${model.name} au Maroc en ${year} : à partir de ${formatPrice(minPrice)}, ${variants.length} version${variants.length > 1 ? 's' : ''}, fiche technique complète.`
    : `${brand.name} ${model.name} au Maroc en ${year} : ${variants.length} version${variants.length > 1 ? 's' : ''}, fiche technique complète et prix sur demande.`
  const ogImage = vehicle.images?.[0] || '/og-image.png'

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
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

export default async function ModelDetailPage({ params }: PageProps) {
  const resolved = await resolveModel(params.brand, params.model)
  if (!resolved) notFound()

  const { brand, model, vehicle, variants } = resolved

  const canonicalBrandSlug = slug(brand.name)
  const canonicalModelSlug = slug(model.name)
  if (params.brand !== canonicalBrandSlug || params.model !== canonicalModelSlug) {
    redirect(`/neuf/${canonicalBrandSlug}/${canonicalModelSlug}`)
  }

  const supabase = await createClient()
  const representative = vehicle
  const images = (representative.images as string[] | null) || []

  const { data: fiche } = await supabase
    .from('fiches_techniques')
    .select('id, model_id, specs, en_detail, source_url, created_at, updated_at')
    .eq('model_id', model.id)
    .single()

  void supabase.rpc('increment_vehicle_views', { vehicle_id: representative.id })

  // Build the reference profile of the opened car.
  const openedPrices = variants
    .map((v) => v.price_min)
    .filter((p): p is number => p != null)
  const anchorPrice = openedPrices.length > 0 ? Math.min(...openedPrices) : null
  const openedFuelTypes = Array.from(
    new Set(variants.map((v) => v.fuel_type).filter((f): f is string => !!f)),
  )

  // Same-category candidates only (hard filter); ranking handles price + boosts.
  let similarModelGroups: ModelGroup[] = []
  if (model.category) {
    const { data: similarRows } = await supabase
      .from('vehicles_new')
      .select(`
        id, images, price_min, price_max, is_new_release, is_popular, version, year, fuel_type, transmission, brand_id, model_id, variant_list,
        brands:brand_id (name, logo_url, origin),
        models:model_id!inner (name, category),
        promotions (discount_percentage, is_active)
      `)
      .neq('model_id', model.id)
      .eq('is_available', true)
      .eq('models.category', model.category)
      .order('price_min', { ascending: true, nullsFirst: false })

    const rows = (similarRows ?? []) as unknown as VehicleRowForGrouping[]
    const originByModel: Record<string, string | null> = {}
    for (const row of rows) {
      const b = Array.isArray(row.brands) ? row.brands[0] : row.brands
      originByModel[row.model_id] = b?.origin ?? null
    }

    similarModelGroups = rankSimilarModels(buildModelGroups(rows), originByModel, {
      anchorPrice,
      fuelTypes: openedFuelTypes,
      origin: brand.origin,
    })
  }

  // Videos related to this car: imported videos have no vehicle_id, so match by
  // title/description text (brand + model) against the published catalogue.
  const { data: allVideos } = await supabase
    .from('videos')
    .select('id, title, description, thumbnail_url, duration, views')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(200)
  const carVideos = filterVideosForCar(allVideos ?? [], brand.name, model.name, 4)

  // Curated (human-validated) videos featured as embedded players. Empty until
  // src/config/video-model-map.json is populated after validating the audit CSV.
  const mappedVideos = getMappedVideosForModel(model.id)

  // Articles related to the brand (brand-level): blog_posts have no brand link,
  // so match the brand name in title or tags against the published catalogue.
  const { data: allPosts } = await supabase
    .from('blog_posts')
    .select('id, title, slug, subtitle, category, tags, hero_image_url, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(200)
  const brandArticles = filterArticlesForBrand(allPosts ?? [], brand.name, 3)

  const prices = variants.map(v => v.price_min).filter((p): p is number => p != null)
  const maxPrices = variants.map(v => v.price_max ?? v.price_min).filter((p): p is number => p != null)
  const minPrice = prices.length > 0 ? Math.min(...prices) : null
  const maxPrice = maxPrices.length > 0 ? Math.max(...maxPrices) : null
  const totalViews = representative.views || 0
  const hasNewRelease = !!representative.is_new_release
  const hasPopular = !!representative.is_popular
  const fuelTypes = Array.from(new Set(variants.map(v => v.fuel_type).filter(Boolean)))
  const transmissions = Array.from(new Set(variants.map(v => v.transmission).filter(Boolean)))

  // Cost-per-100km calculator deep link — only surfaced for hybrid/electric
  // models (per brief). Prefer the greenest energy present; pass the combined
  // consumption for hybrids (electric kWh/100km isn't stored, so the calculator
  // falls back to its own default for those).
  const calcEnergy: EnergyKind | null = (() => {
    const kinds = fuelTypes.map((f) => fuelTypeToEnergyParam(f as string))
    if (kinds.includes('electrique')) return 'electrique'
    if (kinds.includes('hybride')) return 'hybride'
    return null
  })()
  const calcConso = representative.fuel_consumption_combined
  const calcHref = calcEnergy
    ? `/outils/cout-100km?energie=${calcEnergy}${calcEnergy === 'hybride' && calcConso ? `&conso=${calcConso}` : ''}`
    : null

  // Freshness signal shown near the title (explicit fr-MA locale, never a bare
  // toLocaleDateString whose output depends on the server locale).
  const updatedAtLabel = representative.updated_at
    ? new Date(representative.updated_at).toLocaleDateString('fr-MA', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  // FAQ — built from data only, then reused verbatim for the visible block AND
  // the FAQPage JSON-LD so the two can never disagree. Fiscal power is pulled
  // from the fiche only when a matching key holds a meaningful value.
  const ficheSpecsRecord = (fiche?.specs ?? {}) as Record<string, unknown>
  const fiscalPowerEntry = Object.entries(ficheSpecsRecord).find(([k]) => /fiscal/i.test(k))
  const fiscalPower = fiscalPowerEntry && isMeaningfulSpecValue(fiscalPowerEntry[1])
    ? String(fiscalPowerEntry[1])
    : null
  const faqItems = buildModelFaq({
    brandName: brand.name,
    modelName: model.name,
    minPrice,
    maxPrice,
    consumptionCombined: representative.fuel_consumption_combined ?? null,
    fiscalPower,
    transmissions: transmissions as string[],
    versionCount: variants.length,
  })

  type Promo = { discount_percentage: number | null; is_active?: boolean; valid_until?: string | null; title?: string | null }
  const activePromos: Promo[] = ((representative.promotions as Promo[] | null) ?? []).filter(p =>
    p.is_active !== false &&
    p.discount_percentage != null && p.discount_percentage > 0 &&
    (!p.valid_until || new Date(p.valid_until) >= new Date())
  )
  const bestPromo = activePromos.length > 0
    ? activePromos.reduce((a, b) => (b.discount_percentage! > a.discount_percentage! ? b : a))
    : null

  const priceDisplay = minPrice && maxPrice && maxPrice > minPrice
    ? `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`
    : minPrice
    ? `À partir de ${formatPrice(minPrice)}`
    : 'Prix sur demande'

  const finalPrice = bestPromo && minPrice
    ? minPrice - (minPrice * (bestPromo.discount_percentage || 0)) / 100
    : minPrice ?? 0

  const whatsappText = encodeURIComponent(
    `Bonjour, je suis intéressé(e) par la ${brand.name} ${model.name} sur Tomobile 360.`
  )
  const canonicalUrl = `https://www.tomobile360.ma/neuf/${canonicalBrandSlug}/${canonicalModelSlug}`

  const variantOffers = variants
    .filter(v => v.price_min != null && v.price_min > 0)
    .map(v => ({
      '@type': 'Offer' as const,
      ...(v.version ? { name: v.version } : {}),
      price: v.price_min,
      priceCurrency: 'MAD',
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization' as const, name: 'Tomobile 360' },
    }))

  // Wrap multi-variant pricing in an AggregateOffer so SERPs render a
  // price range (low–high) instead of a single Offer line.
  const offers = (() => {
    if (variantOffers.length === 0) return undefined
    if (variantOffers.length === 1) return variantOffers[0]
    const prices = variantOffers.map(o => o.price as number)
    return {
      '@type': 'AggregateOffer' as const,
      offerCount: variantOffers.length,
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      priceCurrency: 'MAD',
      offers: variantOffers,
    }
  })()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 lg:px-8 py-8 pb-20 lg:pb-8">
        <Breadcrumbs
          items={[
            { name: 'Voitures Neuves', href: '/neuf' },
            { name: brand.name },
            { name: `${brand.name} ${model.name}` },
          ]}
        />

        <JsonLd
          data={{
            '@type': 'Car',
            name: `${brand.name} ${model.name}`,
            brand: { '@type': 'Brand', name: brand.name },
            model: model.name,
            ...(representative.year ? { vehicleModelDate: representative.year.toString() } : {}),
            ...(fuelTypes.length > 0 ? { fuelType: fuelTypes.map(fuelLabel).join(', ') } : {}),
            ...(transmissions.length > 0 ? { vehicleTransmission: transmissions.map(transmissionLabel).join(', ') } : {}),
            ...(images.length > 0 ? { image: images[0] } : {}),
            url: canonicalUrl,
            ...(offers ? { offers } : {}),
          }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden p-4">
              <ImageGallery images={images} alt={`${brand.name} ${model.name}`} />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {brand.logo_url && (
                      <Image src={brand.logo_url} alt={brand.name} width={50} height={50} className="object-contain" />
                    )}
                    <div>
                      <h1 className="text-3xl font-bold text-primary">
                        {brand.name} {model.name}
                      </h1>
                      <p className="text-gray-400">
                        {variants.length} version{variants.length > 1 ? 's' : ''} disponible{variants.length > 1 ? 's' : ''}
                      </p>
                      {updatedAtLabel && (
                        <p className="text-xs text-gray-400 mt-0.5">Mis à jour le {updatedAtLabel}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    {hasNewRelease && <Badge variant="success">NOUVEAU</Badge>}
                    {hasPopular && <Badge variant="secondary">POPULAIRE</Badge>}
                    {model.category && <Badge variant="outline">{model.category}</Badge>}
                    {bestPromo && (
                      <Badge variant="destructive">
                        PROMOTION -{bestPromo.discount_percentage}%
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <ShareButton
                    url={`/neuf/${canonicalBrandSlug}/${canonicalModelSlug}`}
                    title={`${brand.name} ${model.name}`}
                    showText
                  />
                </div>
              </div>

              {/* Brand blurb — same description shown when browsing by marque */}
              {brand.description && (
                <p className="text-sm text-gray-500 leading-relaxed mt-4 pt-4 border-t border-gray-100">
                  {brand.description}
                </p>
              )}
            </div>

            {(representative.horsepower || representative.fuel_type || representative.transmission || representative.acceleration || representative.fuel_consumption_combined || representative.co2_emissions || fiche) && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <KeySpecsStrip vehicle={representative as any} fiche={fiche as any} />
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <VehicleSpecs vehicle={representative as any} fiche={fiche as any} />
            </div>

            {calcHref && (
              <Link
                href={calcHref}
                className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 transition-colors hover:bg-emerald-100/60"
              >
                <span className="flex items-center gap-3">
                  <Calculator className="h-5 w-5 shrink-0 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-900">
                    Combien coûte 100 km avec ce modèle ? Comparez essence, hybride et électrique.
                  </span>
                </span>
                <ChevronRight className="h-5 w-5 shrink-0 text-emerald-600" />
              </Link>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-card hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300">
                <h3 className="text-lg font-semibold text-primary mb-4">Prix</h3>

                {bestPromo && minPrice ? (
                  <div className="mb-4">
                    <p className="text-sm text-gray-400 line-through">{formatPrice(minPrice)}</p>
                    <p className="text-3xl font-bold text-secondary">{formatPrice(finalPrice)}</p>
                    <p className="text-sm text-green-600 mt-1">Économisez {formatPrice(minPrice - finalPrice)}</p>
                  </div>
                ) : (
                  <p className="text-3xl font-bold text-secondary mb-4">{priceDisplay}</p>
                )}

                {bestPromo && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    {bestPromo.title && <p className="text-sm font-semibold text-amber-700 mb-1">{bestPromo.title}</p>}
                    {bestPromo.valid_until && (
                      <p className="text-xs text-amber-600/80">
                        Valable jusqu&apos;au{' '}
                        {new Date(bestPromo.valid_until).toLocaleDateString('fr-MA', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  <TrackedLink
                    event="whatsapp_click"
                    eventParams={{ brand: brand.name, model: model.name, context: 'model_sidebar' }}
                    href={`https://wa.me/${BUSINESS_INFO.WHATSAPP_E164}?text=${whatsappText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-[#25D366] hover:bg-[#20BD5A] text-white font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Contacter via WhatsApp
                  </TrackedLink>
                  <ContactDealerDialog
                    vehicleName={`${brand.name} ${model.name}`}
                    dealerEmail={BUSINESS_INFO.EMAIL}
                    dealerPhone={BUSINESS_INFO.WHATSAPP_DISPLAY}
                  />
                  <TestDriveDialog
                    vehicleName={`${brand.name} ${model.name}`}
                    dealerPhone={BUSINESS_INFO.WHATSAPP_E164}
                  />
                  <Link href="/neuf/comparer" className="block">
                    <Button variant="outline" className="w-full shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                      Comparer ce véhicule
                    </Button>
                  </Link>
                </div>

                {formatViewsLabel(totalViews) && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-1.5 text-sm text-gray-400">
                      <Eye className="h-4 w-4" />
                      <span>Vu {totalViews.toLocaleString()} fois</span>
                    </div>
                  </div>
                )}
              </div>

              {variants.length > 1 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-card">
                  <h3 className="text-lg font-semibold text-primary mb-4">Versions disponibles</h3>
                  <ul className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 -mr-2">
                    {variants.map((v, i) => (
                      <li key={i} className="border-b border-gray-100 last:border-b-0 pb-3 last:pb-0">
                        <p className="text-sm font-semibold text-gray-800">
                          {v.version || `${brand.name} ${model.name}`}
                        </p>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 mt-1">
                          {v.fuel_type && <span>{fuelLabel(v.fuel_type)}</span>}
                          {v.transmission && <span>{transmissionLabel(v.transmission)}</span>}
                          {v.horsepower && <span>{v.horsepower} ch</span>}
                        </div>
                        {v.price_min && (
                          <p className="text-sm font-semibold text-secondary mt-1">{formatPrice(v.price_min)}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {faqItems.length > 0 && (
          <section className="mt-12" aria-labelledby="faq-heading">
            {/* FAQPage JSON-LD — an exact mirror of the visible block below,
                both driven by `faqItems` (single source of truth). */}
            <JsonLd
              data={{
                '@type': 'FAQPage',
                mainEntity: faqItems.map((f) => ({
                  '@type': 'Question',
                  name: f.question,
                  acceptedAnswer: { '@type': 'Answer', text: f.answer },
                })),
              }}
            />
            <h2 id="faq-heading" className="text-2xl font-bold text-primary mb-6">
              Questions fréquentes — {brand.name} {model.name}
            </h2>
            <div className="space-y-4">
              {faqItems.map((f, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="text-base font-semibold text-slate-700 mb-2">{f.question}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{f.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {similarModelGroups.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-primary mb-6">Véhicules Similaires</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarModelGroups.map((mg) => (
                <ModelCard key={mg.modelId} model={mg} />
              ))}
            </div>
          </div>
        )}

        {mappedVideos.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-primary mb-6">
              En vidéo — {brand.name} {model.name}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mappedVideos.map((v, i) => (
                <LazyVideoEmbed
                  key={i}
                  videoUrl={v.videoUrl}
                  title={v.title}
                  thumbnailUrl={v.thumbnailUrl}
                  duration={v.duration}
                  uploadDate={v.uploadDate}
                />
              ))}
            </div>
          </div>
        )}

        {carVideos.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-primary">
                Vidéos — {brand.name} {model.name}
              </h2>
              <Link href="/videos" className="text-sm text-secondary hover:underline whitespace-nowrap">
                Voir toutes les vidéos →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {carVideos.map((video) => (
                <VideoCard key={video.id} {...video} />
              ))}
            </div>
          </div>
        )}

        {brandArticles.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-primary">Articles — {brand.name}</h2>
              <Link href="/actu" className="text-sm text-secondary hover:underline whitespace-nowrap">
                Voir toutes les actualités →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {brandArticles.map((post) => (
                <ArticleCard key={post.id} {...post} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Mobile Contact Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-gray-200 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex gap-3 shadow-lg">
        <TrackedLink
          event="whatsapp_click"
          eventParams={{ brand: brand.name, model: model.name, context: 'model_sticky' }}
          href={`https://wa.me/${BUSINESS_INFO.WHATSAPP_E164}?text=${whatsappText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#25D366] text-white font-semibold rounded-xl text-sm"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          WhatsApp
        </TrackedLink>
        <a
          href={`tel:${BUSINESS_INFO.PHONE_TEL}`}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-secondary text-white font-semibold rounded-xl text-sm"
        >
          Appeler
        </a>
      </div>
    </div>
  )
}
