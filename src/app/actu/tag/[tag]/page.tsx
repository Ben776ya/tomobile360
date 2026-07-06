import Link from 'next/link'
import { Calendar } from 'lucide-react'
import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'
import { ArticleCard } from '@/components/actu/ArticleCard'
import { Pagination } from '@/components/actu/Pagination'
import { getPostsByTag } from '@/lib/blog'

export const revalidate = 60

const ITEMS_PER_PAGE = 12

interface PageProps {
  params: { tag: string }
  searchParams: { page?: string }
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const tag = decodeURIComponent(params.tag)
  const page = parseInt(searchParams.page || '1')
  const base = `/actu/tag/${encodeURIComponent(tag)}`
  const canonical = page > 1 ? `${base}?page=${page}` : base
  const titleSuffix = page > 1 ? ` — Page ${page}` : ''
  const title = `${tag} — Actualités Tomobile 360${titleSuffix}`
  const description = `Tous les articles Tomobile 360 sur ${tag} : actualités, essais et tendances automobiles au Maroc.`
  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Tomobile 360',
      type: 'website',
    },
  }
}

export default async function TagArchivePage({
  params,
  searchParams,
}: PageProps) {
  const tag = decodeURIComponent(params.tag)
  const allPosts = await getPostsByTag(tag)

  const totalPages = Math.ceil(allPosts.length / ITEMS_PER_PAGE)
  const requestedPage = parseInt(searchParams.page || '1')
  const page = Math.min(Math.max(1, requestedPage || 1), Math.max(1, totalPages))
  const posts = allPosts.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Dark Gradient Header */}
        <div className="bg-gradient-to-br from-primary to-[#0a1628] rounded-2xl px-6 sm:px-8 py-10 sm:py-12 mb-8">
          <Breadcrumbs
            items={[{ name: 'Actualités', href: '/actu' }, { name: tag }]}
          />

          <p className="text-white/70 text-xs uppercase tracking-wider mt-4 mb-2">
            Tag
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white font-display mb-2">
            #{tag}
          </h1>
          <p className="text-white/85 text-sm sm:text-base">
            {allPosts.length} article{allPosts.length > 1 ? 's' : ''} lié
            {allPosts.length > 1 ? 's' : ''} à ce tag
          </p>
        </div>

        {/* Grid */}
        {posts.length > 0 ? (
          <div className="bg-gray-50 rounded-2xl p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {posts.map((post) => (
                <ArticleCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-card p-12 text-center border border-gray-100">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-semibold text-primary mb-2">
              Aucun article pour ce tag
            </h2>
            <p className="text-gray-500 mb-6">
              Aucun article publié ne correspond à «&nbsp;{tag}&nbsp;».
            </p>
            <Link
              href="/actu"
              className="text-secondary font-bold text-sm hover:underline"
            >
              &larr; Retour aux actualités
            </Link>
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          hrefFor={(p) => `/actu/tag/${encodeURIComponent(tag)}?page=${p}`}
        />

        {/* Results count */}
        {allPosts.length > 0 && totalPages > 1 && (
          <div className="text-center mt-4 text-sm text-gray-400">
            Page {page} sur {totalPages} &middot; {allPosts.length} article
            {allPosts.length > 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  )
}
