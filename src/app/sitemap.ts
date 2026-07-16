import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { slug } from '@/lib/slug'
import { normalizeTags } from '@/lib/blog/tags'

const BASE_URL = 'https://www.tomobile360.ma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  // Static pages — use fixed dates, not new Date(), to avoid misleading crawlers
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/neuf`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/occasion`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/actu`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/videos`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/forum`, changeFrequency: 'daily', priority: 0.6 },
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
    { url: `${BASE_URL}/services/revision/detailing`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/services/revision/dabapneu`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/services/controle`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/services/securite-routiere`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/magazine`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/qui-sommes-nous`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/contact`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/conditions`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE_URL}/confidentialite`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE_URL}/mentions-legales`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE_URL}/cookies`, changeFrequency: 'yearly', priority: 0.1 },
  ]

  // Dynamic: blog post pages
  const { data: blogPosts } = await supabase
    .from('blog_posts')
    .select('slug, published_at, updated_at, tags')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(500)

  const articlePages: MetadataRoute.Sitemap = (blogPosts || []).map((post) => ({
    url: `${BASE_URL}/actu/${post.slug}`,
    lastModified: post.updated_at ? new Date(post.updated_at) : post.published_at ? new Date(post.published_at) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  // Dynamic: blog tag-archive pages (/actu/tag/[tag]). Enumerate distinct
  // normalized tags across published posts, deduped case-insensitively so a
  // tag written in mixed casing yields a single URL (matches the case-
  // insensitive filter used by the tag page). URL uses the raw tag string,
  // encoded — the page reads params.tag via decodeURIComponent.
  const seenTagKeys = new Set<string>()
  const tagPages: MetadataRoute.Sitemap = []
  for (const post of blogPosts || []) {
    for (const tag of normalizeTags(post.tags as string[] | null)) {
      const key = tag.toLowerCase()
      if (seenTagKeys.has(key)) continue
      seenTagKeys.add(key)
      tagPages.push({
        url: `${BASE_URL}/actu/tag/${encodeURIComponent(tag)}`,
        changeFrequency: 'weekly' as const,
        priority: 0.4,
      })
    }
  }

  // Dynamic: model-level new vehicle pages (one URL per model)
  // Only models with at least one available vehicle.
  const { data: availableVehicles } = await supabase
    .from('vehicles_new')
    .select('model_id, updated_at')
    .eq('is_available', true)

  const lastModifiedByModel = new Map<string, Date>()
  for (const v of availableVehicles || []) {
    const t = v.updated_at ? new Date(v.updated_at) : new Date()
    const prev = lastModifiedByModel.get(v.model_id)
    if (!prev || t > prev) lastModifiedByModel.set(v.model_id, t)
  }

  const { data: models } = await supabase
    .from('models')
    .select('id, name, brands:brand_id (name)')

  const vehiclePages: MetadataRoute.Sitemap = (models || [])
    .filter((m: any) => lastModifiedByModel.has(m.id))
    .map((m: any) => {
      const brandName = Array.isArray(m.brands) ? m.brands[0]?.name : m.brands?.name
      return {
        url: `${BASE_URL}/neuf/${slug(brandName || 'marque')}/${slug(m.name || 'modele')}`,
        lastModified: lastModifiedByModel.get(m.id)!,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }
    })

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

  return [...staticPages, ...articlePages, ...tagPages, ...vehiclePages, ...usedVehiclePages]
}
