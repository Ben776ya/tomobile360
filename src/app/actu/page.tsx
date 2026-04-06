import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'
import { JsonLd } from '@/components/seo/JsonLd'
import { formatDate } from '@/lib/utils'
import { getPublishedPosts, getFeaturedPost } from '@/lib/blog'
import type { BlogListItem } from '@/lib/types/blog'
import type { Metadata } from 'next'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Actualités Automobile Maroc 2026 — Nouveautés et Tendances',
  description:
    "Toute l'actualité automobile au Maroc : essais, nouveautés, tendances du marché et comparatifs. Restez informé avec Tomobile 360.",
  alternates: { canonical: 'https://tomobile360.ma/actu' },
  openGraph: {
    title: 'Actualités Automobile Maroc 2026 — Nouveautés et Tendances',
    description:
      "Toute l'actualité automobile au Maroc : essais, nouveautés, tendances du marché et comparatifs.",
    url: 'https://tomobile360.ma/actu',
    siteName: 'Tomobile 360',
    type: 'website',
  },
}

const ITEMS_PER_PAGE = 12

const CATEGORIES = [
  { value: 'all', label: 'Tout' },
  { value: 'marche', label: 'Marché' },
  { value: 'nouveautes', label: 'Nouveautés' },
  { value: 'pratique', label: 'Pratique' },
  { value: 'tendances', label: 'Tendances' },
  { value: 'interview', label: 'Interview' },
] as const

const categoryColors: Record<string, string> = {
  marche: 'bg-emerald-500 text-white',
  nouveautes: 'bg-secondary text-white',
  pratique: 'bg-orange-500 text-white',
  tendances: 'bg-purple-500 text-white',
  interview: 'bg-rose-500 text-white',
}

interface SearchParams {
  category?: string
  page?: string
}

function ArticleCard({ post }: { post: BlogListItem }) {
  const color = categoryColors[post.category] || 'bg-gray-500 text-white'
  const label =
    CATEGORIES.find((c) => c.value === post.category)?.label || post.category

  return (
    <Link
      href={`/actu/${post.slug}`}
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        {post.hero_image_url ? (
          <Image
            src={post.hero_image_url}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <Calendar className="h-10 w-10 text-gray-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="absolute top-3 left-3">
          <Badge className={`border-0 shadow-md text-xs ${color}`}>
            {label}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-primary text-base md:text-lg leading-snug mb-2 line-clamp-2 group-hover:text-secondary transition-colors">
          {post.title}
        </h3>
        {post.subtitle && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3 leading-relaxed">
            {post.subtitle.length > 150
              ? post.subtitle.slice(0, 150) + '...'
              : post.subtitle}
          </p>
        )}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-3">
            {post.published_at && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(post.published_at)}
              </span>
            )}
            {post.views > 0 && (
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {post.views.toLocaleString()}
              </span>
            )}
          </div>
          <span className="text-secondary font-semibold group-hover:translate-x-0.5 transition-transform">
            Lire &rarr;
          </span>
        </div>
      </div>

      {/* Bottom accent */}
      <div className="h-[2px] bg-gradient-to-r from-secondary via-secondary-400 to-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </Link>
  )
}

export default async function ActuPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const category = searchParams.category || 'all'
  const page = parseInt(searchParams.page || '1')
  const offset = (page - 1) * ITEMS_PER_PAGE

  const [{ posts, count }, featured] = await Promise.all([
    getPublishedPosts(
      category !== 'all' ? category : undefined,
      ITEMS_PER_PAGE,
      offset,
    ),
    page === 1 && category === 'all' ? getFeaturedPost() : Promise.resolve(null),
  ])

  const totalPages = Math.ceil(count / ITEMS_PER_PAGE)

  // Exclude featured from the grid if it appears in the list
  const gridPosts = featured
    ? posts.filter((p) => p.id !== featured.id)
    : posts

  const featuredColor = featured
    ? categoryColors[featured.category] || 'bg-gray-500 text-white'
    : ''
  const featuredLabel = featured
    ? CATEGORIES.find((c) => c.value === featured.category)?.label ||
      featured.category
    : ''

  return (
    <div className="min-h-screen bg-background">
      <JsonLd
        data={{
          '@type': 'CollectionPage',
          name: 'Actualités Automobile Maroc',
          description:
            "Toute l'actualité automobile au Maroc : essais, nouveautés, tendances du marché.",
          url: 'https://tomobile360.ma/actu',
          publisher: {
            '@type': 'Organization',
            name: 'Tomobile 360',
            logo: {
              '@type': 'ImageObject',
              url: 'https://tomobile360.ma/logo_tomobil360.png',
            },
          },
        }}
      />

      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={[{ name: 'Actualités' }]} />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-primary font-display mb-2">
            Explorez l&apos;actu auto : Tout ce que vous devez savoir !
          </h1>
          <p className="text-gray-500">
            Toute l&apos;actualité du monde de l&apos;automobile au Maroc et
            à l&apos;international
          </p>
        </div>

        {/* SEO Intro */}
        <div className="mb-6 bg-white rounded-xl border border-gray-100 p-6">
          <p className="text-gray-600 text-sm leading-relaxed">
            Suivez toute l&apos;actualité du monde automobile au Maroc et à
            l&apos;international. Essais détaillés des derniers modèles,
            analyses du marché marocain, comparatifs entre véhicules
            concurrents et guides d&apos;achat pour vous aider à faire le
            meilleur choix. L&apos;équipe Tomobile 360 décrypte pour vous les
            tendances, les lancements et les évolutions du secteur automobile.
          </p>
        </div>

        {/* Category Filter */}
        <div className="bg-white rounded-xl shadow-card p-4 mb-8 border border-gray-100">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.value}
                href={
                  cat.value === 'all' ? '/actu' : `/actu?category=${cat.value}`
                }
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  category === cat.value
                    ? 'bg-secondary text-white font-semibold shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Article — page 1, no category filter */}
        {featured && (
          <Link
            href={`/actu/${featured.slug}`}
            className="block bg-white rounded-2xl shadow-card overflow-hidden hover:shadow-card-hover transition-all duration-300 mb-8 border border-gray-100 hover:border-secondary/20 group"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              <div className="relative h-48 sm:h-64 md:h-80 bg-gray-100 overflow-hidden">
                {featured.hero_image_url ? (
                  <Image
                    src={featured.hero_image_url}
                    alt={featured.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
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
                <Badge
                  className={`w-fit mb-3 border-0 ${featuredColor}`}
                >
                  {featuredLabel}
                </Badge>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-primary mb-3 group-hover:text-secondary transition-colors line-clamp-3">
                  {featured.title}
                </h2>
                {featured.subtitle && (
                  <p className="text-gray-500 mb-4 line-clamp-3 text-sm">
                    {featured.subtitle}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  {featured.published_at && (
                    <div className="flex items-center gap-1 text-sm text-gray-400">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(featured.published_at)}</span>
                    </div>
                  )}
                  <span className="inline-flex items-center gap-1 text-secondary text-sm font-medium">
                    Lire l&apos;article &rarr;
                  </span>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Articles Grid */}
        {gridPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {gridPosts.map((post) => (
              <ArticleCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-card p-12 text-center border border-gray-100">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-primary mb-2">
              Aucun article disponible
            </h3>
            <p className="text-gray-500">
              Les articles seront bientôt disponibles dans cette catégorie.
            </p>
          </div>
        )}

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
              {(() => {
                const pages: number[] = []
                if (totalPages <= 7) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i)
                } else {
                  pages.push(1)
                  if (page > 3) pages.push(-1)
                  for (
                    let i = Math.max(2, page - 1);
                    i <= Math.min(totalPages - 1, page + 1);
                    i++
                  ) {
                    pages.push(i)
                  }
                  if (page < totalPages - 2) pages.push(-2)
                  pages.push(totalPages)
                }
                return pages.map((p, idx) => {
                  if (p < 0) {
                    return (
                      <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">
                        ...
                      </span>
                    )
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
        {count > 0 && (
          <div className="text-center mt-4 text-sm text-gray-400">
            Page {page} sur {totalPages} &middot; {count} article
            {count > 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  )
}
