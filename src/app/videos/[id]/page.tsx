import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, Calendar } from 'lucide-react'
import { JsonLd } from '@/components/seo/JsonLd'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { formatRelativeTime } from '@/lib/utils'
import { LinkifyText } from '@/components/shared/LinkifyText'
import { VideoShareButton } from '@/components/videos/VideoShareButton'

export const revalidate = 30

interface PageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: PageProps) {
  const supabase = await createClient()
  const { data: video } = await supabase
    .from('videos')
    .select('title, description, thumbnail_url')
    .eq('id', params.id)
    .eq('is_published', true)
    .single()

  if (!video) return { title: 'Vidéo non trouvée | Tomobile 360' }

  return {
    title: `${video.title} | Tomobile 360 TV`,
    description: video.description?.substring(0, 155) || 'Regardez les meilleures vidéos automobile du Maroc sur Tomobile 360 TV.',
    alternates: {
      canonical: `https://tomobile360.ma/videos/${params.id}`,
    },
    openGraph: {
      title: video.title,
      description: video.description?.substring(0, 155),
      images: video.thumbnail_url
        ? [{ url: video.thumbnail_url }]
        : [{ url: '/og-image.png' }],
      type: 'video.other' as const,
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: video.title,
      images: video.thumbnail_url ? [video.thumbnail_url] : ['/og-image.png'],
    },
  }
}

export default async function VideoDetailPage({ params }: PageProps) {
  const supabase = await createClient()

  // Fetch video
  const { data: video } = await supabase
    .from('videos')
    .select('*')
    .eq('id', params.id)
    .eq('is_published', true)
    .single()

  if (!video) {
    notFound()
  }

  // Increment view count
  void supabase.rpc('increment_video_views', { video_id: video.id })

  // Fetch related videos (same category)
  const { data: relatedVideos } = await supabase
    .from('videos')
    .select('*')
    .eq('is_published', true)
    .eq('category', video.category)
    .neq('id', params.id)
    .order('views', { ascending: false })
    .limit(3)

  // Extract video ID from URL (supports YouTube and Vimeo)
  const getVideoEmbedUrl = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtu.be')
        ? url.split('youtu.be/')[1]?.split('?')[0]
        : new URL(url).searchParams.get('v')
      return `https://www.youtube.com/embed/${videoId}`
    }
    if (url.includes('vimeo.com')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0]
      return `https://player.vimeo.com/video/${videoId}`
    }
    return url
  }

  const embedUrl = getVideoEmbedUrl((video as any).embed_url || (video as any).video_url || '')

  const categoryLabels: { [key: string]: string } = {
    review: 'Essai',
    comparison: 'Comparatif',
    news: 'Actualité',
    guide: 'Guide',
    event: 'Événement',
  }

  return (
    <div className="min-h-screen bg-background">
      <JsonLd
        data={{
          '@type': 'VideoObject',
          name: video.title,
          description: video.description?.substring(0, 200) || '',
          thumbnailUrl: video.thumbnail_url || 'https://tomobile360.ma/og-image.png',
          uploadDate: video.created_at,
          ...(video.duration ? { duration: video.duration } : {}),
          ...(embedUrl ? { embedUrl } : {}),
        }}
      />
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { name: 'Vidéos', href: '/videos' },
            { name: video.title },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <div className="bg-white rounded-lg shadow-card overflow-hidden border border-gray-100">
              <div className="aspect-video bg-black">
                <iframe
                  src={embedUrl}
                  title={video.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Video Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {video.category && (
                        <Badge variant="secondary">
                          {categoryLabels[video.category] || video.category}
                        </Badge>
                      )}
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-700 mb-3">
                      {video.title}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{(video.views || 0).toLocaleString()} vues</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatRelativeTime(video.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <VideoShareButton videoId={params.id} title={video.title} />
                  </div>
                </div>

                {/* Description */}
                <div className="border-t border-gray-200 pt-4">
                  <h2 className="text-lg font-semibold text-slate-700 mb-3">Description</h2>
                  <p className="text-gray-600 whitespace-pre-line">
                    <LinkifyText text={video.description || ''} />
                  </p>
                </div>

                {/* Related Vehicle */}
                {video.vehicle_id && (
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h3 className="text-lg font-semibold text-slate-700 mb-3">
                      Véhicule présenté
                    </h3>
                    <Link
                      href={`/neuf/${video.vehicle_id}`}
                      className="inline-flex items-center gap-2 text-secondary hover:text-secondary-400 hover:underline transition-all duration-300"
                    >
                      Voir la fiche technique
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Related Videos */}
            {relatedVideos && relatedVideos.length > 0 && (
              <div className="bg-white rounded-lg shadow-card p-6 border border-gray-100">
                <h2 className="text-lg font-bold text-slate-700 mb-4">Vidéos similaires</h2>
                <div className="space-y-4">
                  {relatedVideos.map((related) => (
                    <Link
                      key={related.id}
                      href={`/videos/${related.id}`}
                      className="block group hover:bg-gray-100 p-2 rounded-lg -mx-2 transition-all duration-300"
                    >
                      <div className="flex gap-3">
                        <div className="relative w-32 aspect-video bg-gray-50/50 rounded overflow-hidden flex-shrink-0 group-hover:ring-2 group-hover:ring-secondary/50 transition-all duration-300">
                          {related.thumbnail_url ? (
                            <Image
                              src={related.thumbnail_url}
                              alt={related.title}
                              fill
                              className="object-cover"
                              sizes="128px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Eye className="h-6 w-6 text-gray-500" />
                            </div>
                          )}
                          {related.duration && (
                            <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                              {related.duration}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm text-gray-700 line-clamp-2 group-hover:text-secondary transition-colors duration-300">
                            {related.title}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <span>{(related.views || 0).toLocaleString()} vues</span>
                            <span>•</span>
                            <span>{formatRelativeTime(related.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
