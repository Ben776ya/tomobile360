import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, MessageSquare, Eye, ThumbsUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatRelativeTime } from '@/lib/utils'
import { ReplyForm } from '@/components/forum/ReplyForm'
import { TopicActions } from '@/components/forum/TopicActions'
import { PostActions } from '@/components/forum/PostActions'

export const revalidate = 30

interface PageProps {
  params: {
    id: string
  }
}

export default async function TopicDetailPage({ params }: PageProps) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

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
  await supabase
    .from('forum_topics')
    .update({ views: (topic.views || 0) + 1 })
    .eq('id', params.id)

  // Fetch replies
  const { data: replies } = await supabase
    .from('forum_posts')
    .select(`
      *,
      profiles:author_id (id, full_name, avatar_url, created_at)
    `)
    .eq('topic_id', params.id)
    .order('created_at', { ascending: true })

  // Check if user is admin
  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    isAdmin = profile?.is_admin || false
  }

  const isAuthor = !!(user && user.id === topic.author_id)
  const canEdit = isAuthor || isAdmin

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
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
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

              {/* Action Buttons */}
              {canEdit && (
                <div className="mt-4">
                  <TopicActions
                    topicId={topic.id}
                    isAuthor={isAuthor}
                    isAdmin={isAdmin}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Replies */}
        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-bold text-gray-900">
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
                    <div className="flex items-center gap-4 mt-3">
                      <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-secondary transition">
                        <ThumbsUp className="h-4 w-4" />
                        <span>J&apos;aime</span>
                      </button>
                      {user && (
                        <button className="text-sm text-gray-500 hover:text-secondary transition">
                          Répondre
                        </button>
                      )}
                      {user && (reply.author_id === user.id || isAdmin) && (
                        <PostActions
                          postId={reply.id}
                          isAuthor={reply.author_id === user.id}
                          isAdmin={isAdmin}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-card p-12 text-center border border-gray-100">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-500" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Aucune réponse pour le moment
              </h3>
              <p className="text-gray-600">
                Soyez le premier à répondre à ce sujet
              </p>
            </div>
          )}
        </div>

        {/* Reply Form */}
        {user && !topic.is_locked ? (
          <ReplyForm topicId={topic.id} />
        ) : !user ? (
          <div className="bg-white rounded-lg shadow-card p-6 text-center border border-gray-100">
            <p className="text-gray-600 mb-4">
              Vous devez être connecté pour répondre
            </p>
            <Link href="/login">
              <Button className="shadow-glow-cyan hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 bg-secondary text-white hover:bg-secondary-400">Se connecter</Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-card p-6 text-center border border-gray-100">
            <p className="text-gray-600">
              Ce sujet est verrouillé. Vous ne pouvez plus y répondre.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
