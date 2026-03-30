import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { MessageSquare, Users, TrendingUp, Search, Plus } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Forum Automobile Maroc — Discussions & Conseils | Tomobile 360',
  description: 'Rejoignez la communauté automobile marocaine. Posez vos questions, partagez vos expériences et obtenez des conseils sur votre voiture.',
}
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatRelativeTime } from '@/lib/utils'

export const revalidate = 60

export default async function ForumPage() {
  const supabase = await createClient()

  // Fetch all categories with topic and post counts
  const { data: categories } = await supabase
    .from('forum_categories')
    .select('*')
    .order('name')

  // For each category, get topic count and latest topic
  const categoriesWithStats = await Promise.all(
    (categories || []).map(async (category) => {
      // Get topic count
      const { count: topicCount } = await supabase
        .from('forum_topics')
        .select('id', { count: 'exact', head: true })
        .eq('category_id', category.id)

      // Get post count (total posts in all topics in this category)
      const { data: topics } = await supabase
        .from('forum_topics')
        .select('id')
        .eq('category_id', category.id)

      let postCount = 0
      if (topics && topics.length > 0) {
        const topicIds = topics.map((t) => t.id)
        const { count } = await supabase
          .from('forum_posts')
          .select('id', { count: 'exact', head: true })
          .in('topic_id', topicIds)
        postCount = count || 0
      }

      // Get latest topic with author
      const { data: latestTopic } = await supabase
        .from('forum_topics')
        .select(`
          id,
          title,
          created_at,
          profiles:author_id (full_name, avatar_url)
        `)
        .eq('category_id', category.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      return {
        ...category,
        topicCount: topicCount || 0,
        postCount,
        latestTopic,
      }
    })
  )

  // Get overall forum stats
  const { count: totalTopics } = await supabase
    .from('forum_topics')
    .select('id', { count: 'exact', head: true })

  const { count: totalPosts } = await supabase
    .from('forum_posts')
    .select('id', { count: 'exact', head: true })

  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
            Échangez en confiance : La communauté auto marocaine !
          </h1>
          <p className="text-gray-600">
            Partagez vos avis, posez vos questions, découvrez les conseils de la communauté
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-card p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-700">
                  {totalTopics || 0}
                </p>
                <p className="text-sm text-gray-500">Sujets</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-card p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-700">
                  {totalPosts || 0}
                </p>
                <p className="text-sm text-gray-500">Messages</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-card p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-700">
                  {totalUsers || 0}
                </p>
                <p className="text-sm text-gray-500">Membres</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Create Topic */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher dans le forum..."
              className="pl-10 bg-white text-gray-900 border-gray-200 placeholder-gray-400 focus:ring-secondary/50"
            />
          </div>
          <Link href="/forum/nouveau">
            <Button className="shadow-glow-cyan hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 bg-secondary text-white hover:bg-secondary-400">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau sujet
            </Button>
          </Link>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          {categoriesWithStats.map((category) => (
            <Link
              key={category.id}
              href={`/forum/${category.slug}`}
              className="block bg-white rounded-lg shadow-card p-6 hover:shadow-elevated transition border border-gray-100 hover:border-secondary/20"
            >
              <div className="flex items-start gap-4">
                {/* Category Icon */}
                <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-7 w-7 text-secondary" />
                </div>

                {/* Category Info */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-slate-700 mb-1">
                    {category.name}
                  </h2>
                  <p className="text-gray-500 text-sm mb-3">
                    {category.description}
                  </p>

                  {/* Latest Topic */}
                  {category.latestTopic && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>Dernier sujet:</span>
                      <span className="font-medium text-secondary">
                        {category.latestTopic.title}
                      </span>
                      <span>•</span>
                      <span>
                        par {category.latestTopic.profiles?.full_name || 'Anonyme'}
                      </span>
                      <span>•</span>
                      <span>
                        {formatRelativeTime(category.latestTopic.created_at)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-secondary">
                      {category.topicCount}
                    </p>
                    <p className="text-xs text-gray-500">Sujets</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900">
                      {category.postCount}
                    </p>
                    <p className="text-xs text-gray-500">Messages</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {!categoriesWithStats || categoriesWithStats.length === 0 && (
          <div className="bg-white rounded-lg shadow-card p-12 text-center border border-gray-100">
            <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-500" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              Aucune catégorie disponible
            </h3>
            <p className="text-gray-600">
              Les catégories du forum seront bientôt disponibles
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
