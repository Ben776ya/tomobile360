import Link from 'next/link'
import Image from 'next/image'
import { Article } from '@/lib/types'
import { cn, formatDate } from '@/lib/utils'
import { Calendar, Play, ArrowRight, ExternalLink } from 'lucide-react'

interface ArticleCardProps {
  article: Article & {
    profiles?: { full_name: string | null }
  }
}

const categoryConfig: Record<string, { label: string; bg: string }> = {
  morocco:       { label: 'MAROC',         bg: 'bg-blue-500' },
  international: { label: 'INTERNATIONAL', bg: 'bg-purple-500' },
  market:        { label: 'MARCHÉ',        bg: 'bg-emerald-500' },
  review:        { label: 'ESSAI',         bg: 'bg-orange-500' },
  news:          { label: 'ACTUALITÉ',     bg: 'bg-green-500' },
}

const isYouTube = (url: string | null | undefined) =>
  !!url && (url.includes('youtube.com') || url.includes('youtu.be'))

export function ArticleCard({ article }: ArticleCardProps) {
  const featuredImage = article.featured_image || '/placeholder-article.jpg'
  const excerpt = article.excerpt || ''
  const externalUrl = article.content?.startsWith('http') ? article.content : null
  const isVideo = isYouTube(externalUrl)
  const cat = categoryConfig[article.category || 'news'] || categoryConfig.news

  const cardClassName = cn(
    'group flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden',
    'transition-all duration-200',
    'hover:-translate-y-0.5 hover:shadow-card-hover hover:border-secondary/20'
  )

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

        {/* Category tag */}
        {article.category && (
          <span className={`absolute top-3 left-3 ${cat.bg} text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-md`}>
            {cat.label}
          </span>
        )}

        {/* Video play indicator */}
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <Play className="w-5 h-5 text-[#006EFE] fill-[#006EFE] ml-0.5" />
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
    </>
  )

  if (externalUrl) {
    return (
      <a href={externalUrl} target="_blank" rel="noopener noreferrer" className={cardClassName}>
        {cardContent}
      </a>
    )
  }

  return (
    <Link href={`/actu/${article.slug}`} className={cardClassName}>
      {cardContent}
    </Link>
  )
}
