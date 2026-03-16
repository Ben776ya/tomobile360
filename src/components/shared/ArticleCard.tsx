import Link from 'next/link'
import Image from 'next/image'
import { Article } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { Calendar, Play, ArrowRight, ExternalLink } from 'lucide-react'

interface ArticleCardProps {
  article: Article & {
    profiles?: { full_name: string | null }
  }
}

const categoryConfig: Record<string, { label: string; bg: string }> = {
  Morocco:       { label: 'MAROC',         bg: 'bg-blue-500' },
  International: { label: 'INTERNATIONAL', bg: 'bg-purple-500' },
  Market:        { label: 'MARCHÉ',        bg: 'bg-emerald-500' },
  Review:        { label: 'ESSAI',         bg: 'bg-orange-500' },
  News:          { label: 'ACTUALITÉ',     bg: 'bg-[#32B75C]' },
}

const isYouTube = (url: string | null | undefined) =>
  !!url && (url.includes('youtube.com') || url.includes('youtu.be'))

export function ArticleCard({ article }: ArticleCardProps) {
  const featuredImage = article.featured_image || '/placeholder-article.jpg'
  const excerpt = article.excerpt || ''
  const externalUrl = article.content?.startsWith('http') ? article.content : null
  const isVideo = isYouTube(externalUrl)
  const cat = categoryConfig[article.category || 'News'] || categoryConfig.News

  const cardContent = (
    <>
      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
        <Image
          src={featuredImage}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Bottom gradient for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Category tag */}
        {article.category && (
          <span className={`tag absolute top-3 left-3 ${cat.bg} text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-md`}>
            {cat.label}
          </span>
        )}

        {/* Video play indicator */}
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <Play className="w-5 h-5 text-[#32B75C] fill-[#32B75C] ml-0.5" />
            </div>
          </div>
        )}

        {/* External link icon */}
        {externalUrl && !isVideo && (
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-md">
              <ExternalLink className="h-3.5 w-3.5 text-gray-700" />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Date */}
        {article.published_at && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(article.published_at)}</span>
          </div>
        )}

        {/* Title */}
        <h3 className="font-bold text-slate-700 text-base leading-snug line-clamp-2 mb-2 group-hover:text-[#006EFE] transition-colors duration-200">
          {article.title}
        </h3>

        {/* Excerpt */}
        {excerpt && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed flex-1">
            {excerpt}
          </p>
        )}

        {/* Read link */}
        <div className="flex items-center gap-1 text-sm font-semibold text-[#006EFE] group-hover:gap-2 transition-all duration-200 mt-auto">
          {isVideo ? 'Voir la vidéo' : 'Lire l\'article'}
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="h-[2px] bg-gradient-to-r from-[#006EFE] to-[#0284FE] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </>
  )

  const className = "group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"

  if (externalUrl) {
    return (
      <a href={externalUrl} target="_blank" rel="noopener noreferrer" className={className}>
        {cardContent}
      </a>
    )
  }

  return (
    <Link href={`/actu/${article.slug}`} className={className}>
      {cardContent}
    </Link>
  )
}
