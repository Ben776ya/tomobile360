import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const BASE_URL = 'https://tomobile360.ma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  // Static pages — use fixed dates, not new Date(), to avoid misleading crawlers
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/neuf`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/occasion`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/actu`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/videos`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/forum`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.6 },
    { url: `${BASE_URL}/coups-de-coeur`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/neuf/nouveautes`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/neuf/populaires`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/neuf/promotions`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/neuf/comparer`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/occasion/estimation`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/services`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/services/credit`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/services/assurance`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/services/revision`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/services/controle`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/qui-sommes-nous`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/contact`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/conditions`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE_URL}/confidentialite`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE_URL}/mentions-legales`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE_URL}/cookies`, changeFrequency: 'yearly', priority: 0.1 },
  ]

  // Dynamic: article pages
  const { data: articles } = await supabase
    .from('articles')
    .select('slug, published_at')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(500)

  const articlePages: MetadataRoute.Sitemap = (articles || []).map((article) => ({
    url: `${BASE_URL}/actu/${article.slug}`,
    lastModified: article.published_at ? new Date(article.published_at) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  // Dynamic: new vehicle pages
  const { data: vehicles } = await supabase
    .from('vehicles_new')
    .select('id, brand_id, model_id, updated_at, brands:brand_id (name), models:model_id (name)')
    .limit(1000)

  const vehiclePages: MetadataRoute.Sitemap = (vehicles || []).map((v: any) => ({
    url: `${BASE_URL}/neuf/${(v.brands?.name || 'marque').toLowerCase()}/${(v.models?.name || 'modele').toLowerCase()}/${v.id}`,
    lastModified: v.updated_at ? new Date(v.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Dynamic: used vehicle listing pages (highest-intent pages)
  const { data: usedListings } = await supabase
    .from('vehicles_used')
    .select('id, updated_at')
    .eq('is_active', true)
    .eq('is_sold', false)
    .limit(2000)

  const usedVehiclePages: MetadataRoute.Sitemap = (usedListings || []).map((v) => ({
    url: `${BASE_URL}/occasion/${v.id}`,
    lastModified: v.updated_at ? new Date(v.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...staticPages, ...articlePages, ...vehiclePages, ...usedVehiclePages]
}
