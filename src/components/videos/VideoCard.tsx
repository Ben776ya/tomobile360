import Link from 'next/link'
import Image from 'next/image'
import { Play, Eye } from 'lucide-react'

interface VideoCardProps {
  id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  duration: string | null
  views: number | null
}

/**
 * Light-theme video card used on the car detail page's "Vidéos" section.
 * Mirrors the card on `/videos`, adapted to the detail page's card convention
 * (`rounded-xl border border-gray-200`). Links to the video detail page.
 */
export function VideoCard({ id, title, description, thumbnail_url, duration, views }: VideoCardProps) {
  return (
    <Link
      href={`/videos/${id}`}
      className="bg-white rounded-xl shadow-card overflow-hidden hover:shadow-elevated hover:-translate-y-1 transition-all duration-300 group border border-gray-200 hover:border-secondary/20"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-50/50 overflow-hidden">
        {thumbnail_url ? (
          <Image
            src={thumbnail_url}
            alt={title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="h-16 w-16 text-gray-500" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
            <Play className="h-8 w-8 text-white fill-white ml-1" />
          </div>
        </div>
        {duration && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
            {duration}
          </div>
        )}
      </div>

      {/* Video Info */}
      <div className="p-3 sm:p-4">
        <h3 className="font-bold text-slate-700 mb-2 line-clamp-2 group-hover:text-secondary transition-colors duration-300">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{description}</p>
        )}
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Eye className="h-3 w-3" />
          <span>{(views || 0).toLocaleString()} vues</span>
        </div>
      </div>
    </Link>
  )
}
