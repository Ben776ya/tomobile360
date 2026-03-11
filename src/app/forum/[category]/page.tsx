import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, Pin, Lock, MessageSquare, Eye, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatRelativeTime } from '@/lib/utils'

export const revalidate = 60

interface PageProps {
  params: {
    category: string
  }
  searchParams: {
    sort?: string
    page?: string
  }
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const supabase = await createClient()
  const page = parseInt(searchParams.page || '1')
  const itemsPerPage = 20
  const sort = searchParams.sort || 'recent'

  // Fetch category
  const { data: category } = await supabase
    .from('forum_categories')
    .select('*')
    .eq('slug', params.category)
    .single()

  if (!category) {
    notFound()
  }

  // Build sort order
  let orderColumn = 'created_at'
  let orderAscending = false

  if (sort === 'popular') {
    orderColumn = 'views'
  } else if (sort === 'unanswered') {
    orderColumn = 'created_at'
  }

  // Fetch topics with pagination
  const { data: topics, count } = await supabase
    .from('forum_topics')
    .select(`
      *,
      profiles:author_id (full_name, avatar_url),
      forum_posts (id)
    `, { count: 'exact' })
    .eq('category_id', category.id)
    .order('is_pinned', { ascending: false })
    .order(orderColumn, { ascending: orderAscending })
    .range((page - 1) * itemsPerPage, page * itemsPerPage - 1)

  const totalPages = Math.ceil((count || 0) / itemsPerPage)

  // Get reply count for each topic
  const topicsWithStats = (topics || []).map((topic) => ({
    ...topic,
    replyCount: topic.forum_posts?.length || 0,
  }))

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/forum"
            className="inline-flex items-center gap-2 text-secondary hover:text-secondary-400"
          >
            <ChevronLeft className="h-4 w-4" />
            Retour au forum
          </Link>
        </div>

        {/* Category Header */}
        <div className="bg-white rounded-lg shadow-card p-6 mb-8 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {category.name}
              </h1>
              <p className="text-gray-600">{category.description}</p>
            </div>
            <Link href="/forum/nouveau">
              <Button className="shadow-glow-cyan hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 bg-secondary text-white hover:bg-secondary-400">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau sujet
              </Button>
            </Link>
          </div>

          {/* Sort Options */}
          <div className="flex gap-2 mt-6">
            <Link
              href={`/forum/${params.category}?sort=recent`}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                sort === 'recent'
                  ? 'bg-secondary text-white shadow-glow-cyan'
                  : 'bg-gray-50/50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Récents
            </Link>
            <Link
              href={`/forum/${params.category}?sort=popular`}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                sort === 'popular'
                  ? 'bg-secondary text-white shadow-glow-cyan'
                  : 'bg-gray-50/50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Populaires
            </Link>
            <Link
              href={`/forum/${params.category}?sort=unanswered`}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                sort === 'unanswered'
                  ? 'bg-secondary text-white shadow-glow-cyan'
                  : 'bg-gray-50/50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Sans réponse
            </Link>
          </div>
        </div>

        {/* Topics List */}
        <div className="space-y-4">
          {topicsWithStats.map((topic) => (
            <Link
              key={topic.id}
              href={`/forum/topic/${topic.id}`}
              className="block bg-white rounded-lg shadow-card p-6 hover:shadow-elevated transition border border-gray-100 hover:border-secondary/20"
            >
              <div className="flex items-start gap-4">
                {/* Author Avatar */}
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-50/50 flex-shrink-0">
                  {topic.profiles?.avatar_url ? (
                    <Image
                      src={topic.profiles.avatar_url}
                      alt={topic.profiles.full_name || 'User'}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary/10">
                      <span className="text-secondary font-semibold">
                        {topic.profiles?.full_name?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Topic Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {topic.is_pinned && (
                      <Pin className="h-4 w-4 text-secondary" />
                    )}
                    {topic.is_locked && (
                      <Lock className="h-4 w-4 text-gray-500" />
                    )}
                    <h2 className="text-lg font-bold text-gray-900 truncate">
                      {topic.title}
                    </h2>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {topic.content}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>
                      par <span className="font-medium text-gray-700">{topic.profiles?.full_name || 'Anonyme'}</span>
                    </span>
                    <span>•</span>
                    <span>{formatRelativeTime(topic.created_at)}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex flex-col items-center gap-3 flex-shrink-0">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-semibold text-gray-700">{topic.replyCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{topic.views || 0}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {topicsWithStats.length === 0 && (
          <div className="bg-white rounded-lg shadow-card p-12 text-center border border-gray-100">
            <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-500" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun sujet pour le moment
            </h3>
            <p className="text-gray-600 mb-6">
              Soyez le premier à démarrer une discussion dans cette catégorie
            </p>
            <Link href="/forum/nouveau">
              <Button className="shadow-glow-cyan hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 bg-secondary text-white hover:bg-secondary-400">
                <Plus className="h-4 w-4 mr-2" />
                Créer un sujet
              </Button>
            </Link>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {page > 1 && (
              <Link
                href={`/forum/${params.category}?page=${page - 1}${sort ? `&sort=${sort}` : ''}`}
              >
                <Button variant="outline" className="shadow-card hover:shadow-elevated transition-all duration-300 border-gray-200 text-gray-600 hover:text-secondary hover:border-secondary/20">Précédent</Button>
              </Link>
            )}
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/forum/${params.category}?page=${p}${sort ? `&sort=${sort}` : ''}`}
                >
                  <Button
                    variant={p === page ? 'default' : 'outline'}
                    size="sm"
                    className={p === page ? 'shadow-glow-cyan ring-2 ring-secondary/30 bg-secondary text-white' : 'shadow-card hover:shadow-elevated hover:bg-secondary/20 hover:border-secondary hover:text-secondary transition-all duration-300 border-gray-200 text-gray-600'}
                  >
                    {p}
                  </Button>
                </Link>
              ))}
            </div>
            {page < totalPages && (
              <Link
                href={`/forum/${params.category}?page=${page + 1}${sort ? `&sort=${sort}` : ''}`}
              >
                <Button variant="outline" className="shadow-card hover:shadow-elevated transition-all duration-300 border-gray-200 text-gray-600 hover:text-secondary hover:border-secondary/20">Suivant</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
