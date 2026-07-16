import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/server'
import type { VehicleUsed, Video } from '@/lib/types'
import type { BlogListItem } from '@/lib/types/blog'

type HomeUsedListing = VehicleUsed & {
  brands?: { name: string; logo_url: string | null }
  models?: { name: string }
  profiles?: { full_name: string | null; avatar_url: string | null }
}

// Above-the-fold — eagerly imported so they're in the initial render.
import { HeroSection } from '@/components/home/HeroSection'
import { BrandCarousel } from '@/components/shared/BrandCarousel'
import { OccasionServicesSection } from '@/components/home/OccasionServicesSection'
import { FeatureGrid } from '@/components/home/FeatureGrid'
import { UsedListingCard } from '@/components/vehicles/UsedListingCard'
import { ServicesSection } from '@/components/home/ServicesSection'
import { PromoBanner } from '@/components/home/PromoBanner'
import { MobileCarousel } from '@/components/shared/MobileCarousel'

// Below-the-fold client components — code-split via dynamic import so their
// JS chunks aren't blocking initial hydration. SSR stays on so the markup
// still appears on first render (no CLS, no SEO regression).
const VideoSection = dynamic(
  () => import('@/components/home/VideoSection').then(m => m.VideoSection),
)
const NewsSection = dynamic(
  () => import('@/components/home/NewsSection').then(m => m.NewsSection),
)

export const revalidate = 60 // Revalidate every 60 seconds

// Explicit homepage metadata. The root layout's default title/OG already
// describe the homepage, but declaring it here (with an `absolute` title so the
// '%s | Tomobile 360' template doesn't double-brand it) decouples the homepage
// identity from the root defaults and gives it a self-referential og:url.
export const metadata: Metadata = {
  title: {
    absolute: 'Tomobile 360 — Prix, Fiches Techniques et Guide d\'Achat Auto au Maroc',
  },
  description:
    'Découvrez les prix et fiches techniques de toutes les voitures neuves au Maroc. Comparatifs, essais vidéo et guide d\'achat complet sur Tomobile 360.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Tomobile 360 — Prix et Fiches Techniques Auto au Maroc',
    description:
      'Découvrez les prix et fiches techniques de toutes les voitures neuves au Maroc. Comparatifs, essais vidéo et guide d\'achat complet.',
    url: '/',
    siteName: 'Tomobile 360',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
}

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch all data in parallel
  const [
    { data: brands },
    { data: models },
    { data: latestUsedListings },
    { data: recentBlogPosts },
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

    // Recent blog posts for ACTUS & ESSAIS
    supabase
      .from('blog_posts')
      .select('id, title, slug, subtitle, hero_image_url, category, published_at, views, featured, tags, author')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(4),

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
      <h1 className="sr-only">Tomobile 360 — Guide d&apos;Achat Automobile au Maroc</h1>
      {/* 1. Hero Section with Search Form */}
      <HeroSection brands={brands || []} models={models || []} />

      {/* 2 + 3. Joined band: FeatureGrid + Brand Carousel on subtle charcoal tint */}
      <div className="bg-[#565A5D]/10">
        {/* 2. Feature grid — comparateur, offres, top ventes, coups de cœur */}
        <FeatureGrid />

        {/* 3. Brand Carousel */}
        {allBrands && allBrands.length > 0 && (
          <BrandCarousel brands={allBrands} />
        )}
      </div>

      {/* 4. OCCASION Services Section */}
      <OccasionServicesSection />

      {/* 7. Services Section - "NOS OFFRES & SERVICES" */}
      <ServicesSection />

      {/* 8. Promotional Banner */}
      <PromoBanner />

      {/* 9. Video Section - "TOMOBILE 360 TV" */}
      {latestVideos && latestVideos.length > 0 && (
        <VideoSection videos={latestVideos as unknown as Video[]} />
      )}

      {/* 10. News Section - "ACTUS & ESSAIS" */}
      {recentBlogPosts && recentBlogPosts.length > 0 && (
        <NewsSection articles={recentBlogPosts as unknown as BlogListItem[]} />
      )}

      {/* 11. Used Listings Section */}
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
            <MobileCarousel desktopClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" autoPlayMs={4000}>
              {latestUsedListings.map((listing) => (
                <UsedListingCard key={listing.id} listing={listing as unknown as HomeUsedListing} />
              ))}
            </MobileCarousel>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
