import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { MessageSquare, Eye } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatRelativeTime } from '@/lib/utils'

export const revalidate = 30

interface PageProps {
  params: {
    id: string
  }
}

export default async function TopicDetailPage({ params }: PageProps) {
  const supabase = await createClient()

  // Fetch topic
  const { data: topic } = await supabase
    .from('forum_topics')
    .select(`
      *,
      profiles:author_id (id, full_name, avatar_url, created_at),
      forum_categories:category_id (name, slug)
    `)
    .eq('id', params.id)
    .single()

  if (!topic) {
    notFound()
  }

  // Increment view count
  void supabase.rpc('increment_forum_topic_views', { topic_id: topic.id })

  // Fetch replies
  const { data: replies } = await supabase
    .from('forum_posts')
    .select(`
      *,
      profiles:author_id (id, full_name, avatar_url, created_at)
    `)
    .eq('topic_id', params.id)
    .order('created_at', { ascending: true })

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/forum" className="text-secondary hover:text-secondary-400">
              Forum
            </Link>
            <span className="text-gray-500">/</span>
            <Link
              href={`/forum/${topic.forum_categories?.slug}`}
              className="text-secondary hover:text-secondary-400"
            >
              {topic.forum_categories?.name}
            </Link>
          </div>
        </div>

        {/* Topic Header */}
        <div className="bg-white rounded-lg shadow-card p-6 mb-6 border border-gray-100">
          <div className="flex items-start gap-4">
            {/* Author Avatar */}
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-50/50 flex-shrink-0">
              {topic.profiles?.avatar_url ? (
                <Image
                  src={topic.profiles.avatar_url}
                  alt={topic.profiles.full_name || 'User'}
                  width={64}
                  height={64}
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-secondary/10">
                  <span className="text-secondary font-bold text-xl">
                    {topic.profiles?.full_name?.charAt(0) || 'U'}
                  </span>
                </div>
              )}
            </div>

            {/* Topic Content */}
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-700 mb-3">
                {topic.title}
              </h1>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span>
                  par{' '}
                  <span className="font-medium text-secondary">
                    {topic.profiles?.full_name || 'Anonyme'}
                  </span>
                </span>
                <span>•</span>
                <span>{formatRelativeTime(topic.created_at)}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{topic.views || 0} vues</span>
                </div>
              </div>

              <div className="prose max-w-none">
                <p className="text-gray-600 whitespace-pre-line">
                  {topic.content}
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* Replies */}
        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-bold text-slate-700">
            Réponses ({replies?.length || 0})
          </h2>

          {replies && replies.length > 0 ? (
            replies.map((reply) => (
              <div
                key={reply.id}
                className="bg-white rounded-lg shadow-card p-6 border border-gray-100"
              >
                <div className="flex items-start gap-4">
                  {/* Reply Author Avatar */}
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-50/50 flex-shrink-0">
                    {reply.profiles?.avatar_url ? (
                      <Image
                        src={reply.profiles.avatar_url}
                        alt={reply.profiles.full_name || 'User'}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-secondary/10">
                        <span className="text-secondary font-semibold">
                          {reply.profiles?.full_name?.charAt(0) || 'U'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Reply Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-gray-900">
                        {reply.profiles?.full_name || 'Anonyme'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatRelativeTime(reply.created_at)}
                      </span>
                    </div>

                    <p className="text-gray-600 whitespace-pre-line">
                      {reply.content}
                    </p>

                    {/* Reply Actions */}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-card p-12 text-center border border-gray-100">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-500" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                Aucune réponse pour le moment
              </h3>
              <p className="text-gray-600">
                Soyez le premier à répondre à ce sujet
              </p>
            </div>
          )}
        </div>

        {/* Read-only notice */}
        <div className="bg-white rounded-lg shadow-card p-6 text-center border border-gray-100">
          <p className="text-gray-600">
            Le forum est actuellement en lecture seule.
          </p>
        </div>
      </div>
    </div>
  )
}
