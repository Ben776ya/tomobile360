import Link from 'next/link'
import Image from 'next/image'
import { Video } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Play, Eye, Clock } from 'lucide-react'

interface VideoCardProps {
  video: Video
}

export function VideoCard({ video }: VideoCardProps) {
  const thumbnail = video.thumbnail_url || '/placeholder-video.jpg'

  return (
    <Link
      href={`/videos/${video.id}`}
      className="group block bg-white backdrop-blur-sm rounded-lg shadow-card border border-gray-100 hover:shadow-elevated hover:border-secondary/20 transition-all duration-300 overflow-hidden"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-gray-50">
        <Image
          src={thumbnail}
          alt={video.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
          <div className="w-16 h-16 rounded-full bg-secondary/90 flex items-center justify-center group-hover:scale-110 group-hover:shadow-glow-cyan transition-all shadow-lg">
            <Play className="h-8 w-8 text-white ml-1" fill="white" />
          </div>
        </div>

        {/* Duration Badge */}
        {video.duration && (
          <div className="absolute bottom-2 right-2">
            <Badge variant="default" className="bg-black/70 text-white shadow-md">
              <Clock className="h-3 w-3 mr-1" />
              {video.duration}
            </Badge>
          </div>
        )}

        {/* Category Badge */}
        {video.category && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="shadow-md">
              {video.category}
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-base font-bold text-slate-700 mb-2 line-clamp-2 group-hover:text-secondary transition-colors">
          {video.title}
        </h3>

        {video.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {video.description}
          </p>
        )}

        {/* Views */}
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Eye className="h-3 w-3" />
          <span>{video.views.toLocaleString()} vues</span>
        </div>
      </div>

      {/* Hover effect line */}
      <div className="h-1 bg-gradient-to-r from-primary via-secondary to-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 shadow-glow-cyan-sm" />
    </Link>
  )
}
