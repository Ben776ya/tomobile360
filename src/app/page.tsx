import { createClient } from '@/lib/supabase/server'

// Components
import { HeroSection } from '@/components/home/HeroSection'
import { BrandCarousel } from '@/components/shared/BrandCarousel'
import { OccasionServicesSection } from '@/components/home/OccasionServicesSection'
import { LatestVehiclesCarousel } from '@/components/home/LatestVehiclesCarousel'
import { UsedListingCard } from '@/components/vehicles/UsedListingCard'
import { ServicesSection } from '@/components/home/ServicesSection'
import { PromoBanner } from '@/components/home/PromoBanner'
import { VideoSection } from '@/components/home/VideoSection'
import { NewsSection } from '@/components/home/NewsSection'

export const revalidate = 60 // Revalidate every 60 seconds

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch all data in parallel
  const [
    { data: brands },
    { data: models },
    { data: latestNewVehicles },
    { data: latestUsedListings },
    { data: recentArticles },
    { data: latestVideos },
    { data: allBrands },
  ] = await Promise.all([
    // Brands for search
    supabase
      .from('brands')
      .select('id, name')
      .order('name'),

    // Models for search (for neuf mode)
    supabase
      .from('models')
      .select('id, name, brand_id')
      .order('name'),

    // Latest new vehicles (for "LES DERNIÈRES ANNONCES" section)
    supabase
      .from('vehicles_new')
      .select(`
        id, images, price_min, price_max, is_new_release, is_popular, version, year, fuel_type, transmission, horsepower, brand_id, model_id,
        brands:brand_id (name, logo_url),
        models:model_id (name),
        promotions (discount_percentage, is_active)
      `)
      .order('created_at', { ascending: false })
      .limit(8),

    // Latest used listings
    supabase
      .from('vehicles_used')
      .select(`
        id, images, price, is_featured, seller_type, year, mileage, fuel_type, city, views, created_at, brand_id, user_id,
        brands:brand_id (name, logo_url),
        models:model_id (name),
        profiles:user_id (full_name, avatar_url)
      `)
      .eq('is_active', true)
      .eq('is_sold', false)
      .order('created_at', { ascending: false })
      .limit(6),

    // Recent articles for ACTUS & ESSAIS
    supabase
      .from('articles')
      .select('id, title, slug, excerpt, featured_image, category, content, published_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(3),

    // Latest videos for TOMOBILE 360 TV
    supabase
      .from('videos')
      .select('id, title, thumbnail_url, duration, category, description, views')
      .order('created_at', { ascending: false })
      .limit(3),

    // All brands for carousel
    supabase
      .from('brands')
      .select('id, name, logo_url')
      .order('name'),
  ])

  return (
    <div className="min-h-screen bg-background">
      {/* 1. Hero Section with Search Form */}
      <HeroSection brands={brands || []} models={models || []} />

      {/* 2. Brand Carousel */}
      {allBrands && allBrands.length > 0 && (
        <BrandCarousel brands={allBrands} />
      )}

      {/* 3. Latest Listings Carousel - "NOS COUPS DE COEUR" */}
      {latestNewVehicles && latestNewVehicles.length > 0 && (
        <LatestVehiclesCarousel vehicles={latestNewVehicles} />
      )}

      {/* 4. OCCASION Services Section */}
      <OccasionServicesSection />

      {/* 5. Services Section - "NOS OFFRES & SERVICES" */}
      <ServicesSection />

      {/* 6. Promotional Banner */}
      <PromoBanner />

      {/* 7. Video Section - "TOMOBILE 360 TV" */}
      {latestVideos && latestVideos.length > 0 && (
        <VideoSection videos={latestVideos as any} />
      )}

      {/* 8. News Section - "ACTUS & ESSAIS" */}
      {recentArticles && recentArticles.length > 0 && (
        <NewsSection articles={recentArticles as any} />
      )}

      {/* 9. Used Listings Section */}
      {latestUsedListings && latestUsedListings.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-card">
            {/* Section Header */}
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-2">
                Trouvez votre voiture d&apos;occasion au meilleur prix
              </h2>
              <p className="text-gray-500">
                Voiture d&apos;occasion avec un petit budget — vérifiée et garantie
              </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestUsedListings.map((listing) => (
                <UsedListingCard key={listing.id} listing={listing as any} />
              ))}
            </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
