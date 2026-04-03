import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Calendar, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

export const revalidate = 60

export const metadata = {
  title: 'Actualités Automobile Maroc 2026 — Nouveautés et Tendances',
  description: 'Toute l\'actualité automobile au Maroc : essais, nouveautés, tendances du marché et comparatifs. Restez informé avec Tomobile 360.',
  alternates: {
    canonical: 'https://tomobile360.ma/actu',
  },
}

interface SearchParams {
  category?: string
  page?: string
}

const ITEMS_PER_PAGE = 18

const categoryLabels: Record<string, string> = {
  morocco: 'Maroc',
  international: 'International',
  market: 'Marché',
  review: 'Essai',
  news: 'Actualité',
}

const categoryColors: Record<string, string> = {
  morocco: 'bg-blue-500 text-white',
  international: 'bg-purple-500 text-white',
  market: 'bg-green-500 text-white',
  review: 'bg-orange-500 text-white',
  news: 'bg-[#006EFE] text-white',
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = await createClient()
  const category = searchParams.category || 'all'
  const page = parseInt(searchParams.page || '1')

  // Build query
  let query = supabase
    .from('articles')
    .select('id, title, slug, excerpt, featured_image, category, tags, published_at, content', { count: 'exact' })
    .eq('is_published', true)

  if (category !== 'all') {
    query = query.eq('category', category)
  }

  const { data: articles, count } = await query
    .order('published_at', { ascending: false })
    .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1)

  const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE)

  // Featured article (most recent, only on page 1 with no category filter)
  let featuredArticle = null
  if (page === 1 && category === 'all' && articles && articles.length > 0) {
    featuredArticle = articles[0]
  }

  const displayArticles = featuredArticle ? articles?.slice(1) : articles

  // Categories for filter
  const categories = [
    { value: 'all', label: 'Tout' },
    { value: 'morocco', label: 'Maroc' },
    { value: 'international', label: 'International' },
    { value: 'market', label: 'Marché' },
    { value: 'review', label: 'Essais' },
    { value: 'news', label: 'Actualités' },
  ]

  // Helper to get external URL from article
  const getExternalUrl = (article: { content: string }) => {
    return article.content?.startsWith('http') ? article.content : '#'
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-primary font-display mb-2">
            Explorez l&apos;actu auto : Tout ce que vous devez savoir !
          </h1>
          <p className="text-gray-500">
            Toute l&apos;actualité du monde de l&apos;automobile au Maroc et à l&apos;international
          </p>
        </div>

        {/* SEO Intro Text */}
        <div className="mb-6 bg-white rounded-xl border border-gray-100 p-6">
          <p className="text-gray-600 text-sm leading-relaxed">
            Suivez toute l&apos;actualité du monde automobile au Maroc et à l&apos;international.
            Essais détaillés des derniers modèles, analyses du marché marocain, comparatifs entre véhicules concurrents
            et guides d&apos;achat pour vous aider à faire le meilleur choix. L&apos;équipe Tomobile 360 décrypte
            pour vous les tendances, les lancements et les évolutions du secteur automobile.
          </p>
        </div>

        {/* Category Filter */}
        <div className="bg-white rounded-xl shadow-card p-4 mb-8 border border-gray-100">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Link
                key={cat.value}
                href={cat.value === 'all' ? '/actu' : `/actu?category=${cat.value}`}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  category === cat.value
                    ? 'bg-[#006EFE] text-white font-semibold'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Article (page 1 only) */}
        {featuredArticle && (
          <a
            href={getExternalUrl(featuredArticle)}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white rounded-xl shadow-card overflow-hidden hover:shadow-card-hover transition-all duration-300 mb-8 border border-gray-100 hover:border-secondary/20 group"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              <div className="relative h-48 sm:h-64 md:h-80 bg-gray-100 overflow-hidden">
                {featuredArticle.featured_image ? (
                  <Image
                    src={featuredArticle.featured_image}
                    alt={featuredArticle.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Calendar className="h-16 w-16 text-gray-300" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-secondary text-white border-0 shadow-gold font-bold">
                    À LA UNE
                  </Badge>
                </div>
              </div>
              <div className="p-4 sm:p-6 md:p-8 flex flex-col justify-center">
                {featuredArticle.category && (
                  <Badge className={`w-fit mb-3 border-0 ${categoryColors[featuredArticle.category] || 'bg-gray-500 text-white'}`}>
                    {categoryLabels[featuredArticle.category] || featuredArticle.category}
                  </Badge>
                )}
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-primary mb-3 group-hover:text-secondary transition-colors line-clamp-3">
                  {featuredArticle.title}
                </h2>
                <p className="text-gray-500 mb-4 line-clamp-3 text-sm">
                  {featuredArticle.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(featuredArticle.published_at)}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-secondary text-sm font-medium">
                    Lire sur Challenge.ma
                    <ExternalLink className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </div>
          </a>
        )}

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayArticles && displayArticles.length > 0 ? (
            displayArticles.map((article) => (
              <a
                key={article.id}
                href={getExternalUrl(article)}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white rounded-xl border border-gray-100 overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1 hover:border-secondary/20 transition-all duration-300"
              >
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                  {article.featured_image ? (
                    <Image
                      src={article.featured_image}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Calendar className="h-10 w-10 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  {article.category && (
                    <div className="absolute top-3 left-3">
                      <Badge className={`border-0 shadow-md text-xs ${categoryColors[article.category] || 'bg-gray-500 text-white'}`}>
                        {categoryLabels[article.category] || article.category}
                      </Badge>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-md">
                      <ExternalLink className="h-3.5 w-3.5 text-secondary" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-primary text-sm md:text-base mb-2 line-clamp-2 group-hover:text-secondary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                    {article.excerpt}
                  </p>
                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {article.tags.slice(0, 3).map((tag: string) => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 bg-gray-50 text-gray-500 rounded-full border border-gray-100">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(article.published_at)}</span>
                    </div>
                    <span className="text-secondary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      Lire
                      <ExternalLink className="h-3 w-3" />
                    </span>
                  </div>
                </div>

                {/* Bottom accent */}
                <div className="h-1 bg-gradient-to-r from-primary via-secondary to-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </a>
            ))
          ) : (
            <div className="col-span-full bg-white rounded-xl shadow-card p-12 text-center border border-gray-100">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-primary mb-2">
                Aucun article disponible
              </h3>
              <p className="text-gray-500">
                Les articles seront bientôt disponibles dans cette catégorie
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-10">
            {page > 1 && (
              <Link
                href={`/actu?page=${page - 1}${category !== 'all' ? `&category=${category}` : ''}`}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-card hover:bg-secondary/10 hover:border-secondary hover:shadow-gold transition-all duration-300 text-gray-600 flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Précédent
              </Link>
            )}

            <div className="flex items-center gap-1">
              {/* Show smart pagination: first, ..., current-1, current, current+1, ..., last */}
              {(() => {
                const pages: number[] = []
                if (totalPages <= 7) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i)
                } else {
                  pages.push(1)
                  if (page > 3) pages.push(-1) // ellipsis
                  for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
                    pages.push(i)
                  }
                  if (page < totalPages - 2) pages.push(-2) // ellipsis
                  pages.push(totalPages)
                }

                return pages.map((p, idx) => {
                  if (p < 0) {
                    return <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">...</span>
                  }
                  return (
                    <Link
                      key={p}
                      href={`/actu?page=${p}${category !== 'all' ? `&category=${category}` : ''}`}
                      className={`px-3.5 py-2 rounded-lg text-sm transition-all duration-300 ${
                        p === page
                          ? 'bg-secondary text-white font-bold shadow-gold ring-2 ring-secondary/30'
                          : 'bg-white border border-gray-200 text-gray-600 hover:bg-secondary/10 hover:border-secondary hover:shadow-gold'
                      }`}
                    >
                      {p}
                    </Link>
                  )
                })
              })()}
            </div>

            {page < totalPages && (
              <Link
                href={`/actu?page=${page + 1}${category !== 'all' ? `&category=${category}` : ''}`}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-card hover:bg-secondary/10 hover:border-secondary hover:shadow-gold transition-all duration-300 text-gray-600 flex items-center gap-1"
              >
                Suivant
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        )}

        {/* Results count */}
        {count !== null && count > 0 && (
          <div className="text-center mt-4 text-sm text-gray-400">
            Page {page} sur {totalPages} &middot; {count} article{count > 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  )
}
