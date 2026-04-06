import Link from 'next/link'
import Image from 'next/image'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
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

const categoryTextColors: Record<string, string> = {
  marche: 'text-emerald-400',
  nouveautes: 'text-secondary',
  pratique: 'text-orange-400',
  tendances: 'text-purple-400',
  interview: 'text-rose-400',
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
      className="group bg-white rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        {post.hero_image_url ? (
          <Image
            src={post.hero_image_url}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <Calendar className="h-10 w-10 text-gray-300" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${color}`}
          >
            {label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-primary text-[15px] leading-snug mb-2 line-clamp-2 group-hover:text-secondary transition-colors">
          {post.title}
        </h3>
        {post.subtitle && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
            {post.subtitle.length > 150
              ? post.subtitle.slice(0, 150) + '...'
              : post.subtitle}
          </p>
        )}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          {post.published_at && (
            <span className="flex items-center gap-1 text-[11px] text-gray-400">
              <Calendar className="h-3 w-3" />
              {formatDate(post.published_at)}
            </span>
          )}
          <span className="text-secondary font-bold text-[13px]">
            Lire &rarr;
          </span>
        </div>
      </div>
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

  const gridPosts = featured
    ? posts.filter((p) => p.id !== featured.id)
    : posts

  const featuredCategoryTextColor = featured
    ? categoryTextColors[featured.category] || 'text-gray-400'
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
        {/* Dark Gradient Header */}
        <div className="bg-gradient-to-br from-primary to-[#0a1628] rounded-2xl px-6 sm:px-8 py-10 sm:py-12 mb-8">
          <Breadcrumbs items={[{ name: 'Actualités' }]} />

          <h1 className="text-3xl sm:text-4xl font-bold text-white font-display mb-2 mt-4">
            L&apos;actu auto{' '}
            <span className="text-secondary">au Maroc</span>
          </h1>
          <p className="text-white/60 text-sm sm:text-base mb-6">
            Tendances, nouveautés et conseils pour les passionnés
          </p>

          <p className="text-white/40 text-xs leading-relaxed max-w-2xl mb-8">
            Suivez toute l&apos;actualité du monde automobile au Maroc et à
            l&apos;international. Essais détaillés des derniers modèles,
            analyses du marché marocain, comparatifs entre véhicules
            concurrents et guides d&apos;achat pour vous aider à faire le
            meilleur choix.
          </p>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.value}
                href={
                  cat.value === 'all' ? '/actu' : `/actu?category=${cat.value}`
                }
                className={`px-5 py-2.5 rounded-full text-sm font-semibold uppercase tracking-wide transition-all duration-200 ${
                  category === cat.value
                    ? 'bg-secondary text-white font-bold shadow-[0_4px_15px_rgba(0,110,254,0.4)]'
                    : 'bg-white/[0.08] text-white/70 border border-white/10 hover:bg-white/[0.15] hover:text-white'
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
            className="block rounded-2xl overflow-hidden mb-8 group transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)]"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 bg-gradient-to-r from-primary to-[#2a3a5c]">
              {/* Content */}
              <div className="p-8 sm:p-10 flex flex-col justify-center order-2 md:order-1">
                <span className="inline-block bg-secondary text-white text-[11px] font-bold tracking-widest px-4 py-1.5 rounded-full w-fit mb-4">
                  À LA UNE
                </span>
                <span
                  className={`text-xs font-semibold uppercase tracking-wider mb-2 ${featuredCategoryTextColor}`}
                >
                  {featuredLabel}
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight mb-3 group-hover:text-secondary/90 transition-colors line-clamp-3">
                  {featured.title}
                </h2>
                {featured.subtitle && (
                  <p className="text-white/60 text-sm leading-relaxed line-clamp-3 mb-5">
                    {featured.subtitle}
                  </p>
                )}
                <div className="flex items-center gap-4 mb-4">
                  {featured.published_at && (
                    <span className="text-white/50 text-xs flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(featured.published_at)}
                    </span>
                  )}
                </div>
                <span className="text-secondary font-bold text-sm group-hover:text-secondary-300 transition-colors inline-flex items-center gap-1">
                  Lire l&apos;article{' '}
                  <span className="text-lg group-hover:translate-x-1 transition-transform">
                    &rarr;
                  </span>
                </span>
              </div>

              {/* Image */}
              <div className="relative h-56 sm:h-64 md:h-auto md:min-h-[320px] overflow-hidden order-1 md:order-2">
                {featured.hero_image_url ? (
                  <>
                    <Image
                      src={featured.hero_image_url}
                      alt={featured.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/50 to-transparent md:block hidden" />
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#374a6d] to-[#2a3a5c]">
                    <Calendar className="h-16 w-16 text-white/10" />
                  </div>
                )}
              </div>
            </div>
          </Link>
        )}

        {/* Articles Grid */}
        {gridPosts.length > 0 ? (
          <div className="bg-gray-50 rounded-2xl p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {gridPosts.map((post) => (
                <ArticleCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-card p-12 text-center border border-gray-100">
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
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-secondary/10 hover:border-secondary transition-all duration-300 flex items-center gap-1 text-sm"
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
                      className={`px-4 py-2 rounded-xl text-sm transition-all duration-300 ${
                        p === page
                          ? 'bg-secondary text-white font-bold shadow-[0_0_12px_rgba(0,110,254,0.25)] ring-2 ring-secondary/30'
                          : 'bg-white border border-gray-200 text-gray-600 hover:bg-secondary/10 hover:border-secondary'
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
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-secondary/10 hover:border-secondary transition-all duration-300 flex items-center gap-1 text-sm"
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
