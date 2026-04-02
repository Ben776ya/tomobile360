import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Play, Eye, Clock } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

export const revalidate = 60

export const metadata = {
  title: 'Vidéos Automobiles | Tomobile 360 TV',
  description: 'Regardez nos essais, comparatifs et actualités automobiles en vidéo. La chaîne YouTube automobile du Maroc.',
}

interface SearchParams {
  category?: string
  page?: string
}

export default async function VideosPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = await createClient()
  const category = searchParams.category || 'all'
  const page = parseInt(searchParams.page || '1')
  const itemsPerPage = 12

  // Build query
  let query = supabase
    .from('videos')
    .select('id, title, thumbnail_url, duration, description, views, created_at, category', { count: 'exact' })
    .eq('is_published', true)

  if (category !== 'all') {
    query = query.eq('category', category)
  }

  const { data: videos, count } = await query
    .order('created_at', { ascending: false })
    .range((page - 1) * itemsPerPage, page * itemsPerPage - 1)

  const totalPages = Math.ceil((count || 0) / itemsPerPage)

  // Get unique categories
  const categories = [
    { value: 'all', label: 'Toutes les vidéos' },
    { value: 'review', label: 'Essais' },
    { value: 'comparison', label: 'Comparatifs' },
    { value: 'news', label: 'Actualités' },
    { value: 'guide', label: 'Guides' },
    { value: 'event', label: 'Événements' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2">
            Regardez nos vidéos : L&apos;auto comme vous ne l&apos;avez jamais vue !
          </h1>
          <p className="text-gray-600">
            Essais, comparatifs, actualités et guides en vidéo
          </p>
        </div>

        {/* Category Filter */}
        <div className="bg-white rounded-lg shadow-card p-4 mb-8 border border-gray-100">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Link
                key={cat.value}
                href={`/videos?category=${cat.value}`}
                className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  category === cat.value
                    ? 'bg-secondary text-white shadow-glow-cyan ring-2 ring-secondary/30 scale-105'
                    : 'bg-gray-50/50 text-gray-600 hover:bg-secondary/10 hover:text-secondary hover:scale-105'
                }`}
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Videos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {videos && videos.length > 0 ? (
            videos.map((video) => (
              <Link
                key={video.id}
                href={`/videos/${video.id}`}
                className="bg-white rounded-lg shadow-card overflow-hidden hover:shadow-elevated hover:-translate-y-1 transition-all duration-300 group border border-gray-100 hover:border-secondary/20"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gray-50/50 overflow-hidden">
                  {video.thumbnail_url ? (
                    <Image
                      src={video.thumbnail_url}
                      alt={video.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="h-16 w-16 text-gray-500" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center shadow-glow-cyan transform group-hover:scale-110 transition-transform duration-300">
                      <Play className="h-8 w-8 text-white fill-white ml-1" />
                    </div>
                  </div>
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>
                  )}
                </div>

                {/* Video Info */}
                <div className="p-3 sm:p-4">
                  <h3 className="font-bold text-slate-700 mb-2 line-clamp-2 group-hover:text-secondary transition-colors duration-300">
                    {video.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {video.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>{(video.views || 0).toLocaleString()} vues</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatRelativeTime(video.created_at)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full bg-white rounded-lg shadow-card p-12 text-center border border-gray-100">
              <Play className="h-16 w-16 mx-auto mb-4 text-gray-500" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                Aucune vidéo disponible
              </h3>
              <p className="text-gray-600">
                Les vidéos seront bientôt disponibles
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {page > 1 && (
              <Link
                href={`/videos?page=${page - 1}${
                  category !== 'all' ? `&category=${category}` : ''
                }`}
                className="px-4 py-2 border border-gray-200 rounded-md hover:bg-secondary/20 hover:border-secondary hover:shadow-elevated transition-all duration-300 text-gray-600"
              >
                Précédent
              </Link>
            )}
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/videos?page=${p}${
                    category !== 'all' ? `&category=${category}` : ''
                  }`}
                  className={`px-4 py-2 rounded-md transition-all duration-300 ${
                    p === page
                      ? 'bg-secondary text-white font-semibold shadow-glow-cyan ring-2 ring-secondary/50'
                      : 'border border-gray-200 hover:bg-secondary/20 hover:border-secondary hover:shadow-elevated text-gray-600'
                  }`}
                >
                  {p}
                </Link>
              ))}
            </div>
            {page < totalPages && (
              <Link
                href={`/videos?page=${page + 1}${
                  category !== 'all' ? `&category=${category}` : ''
                }`}
                className="px-4 py-2 border border-gray-200 rounded-md hover:bg-secondary/20 hover:border-secondary hover:shadow-elevated transition-all duration-300 text-gray-600"
              >
                Suivant
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
