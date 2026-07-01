import Link from 'next/link'
import Image from 'next/image'
import { Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { CATEGORY_LABELS, CATEGORY_PILL_COLORS } from '@/lib/blog/categories'

interface ArticleCardProps {
  slug: string
  title: string
  subtitle: string | null
  category: string
  hero_image_url: string | null
  published_at: string | null
}

/** Light-theme blog card for the car detail page's "Articles" section. */
export function ArticleCard({ slug, title, subtitle, category, hero_image_url, published_at }: ArticleCardProps) {
  const color = CATEGORY_PILL_COLORS[category] || 'bg-gray-500 text-white'
  const label = CATEGORY_LABELS[category] || category

  return (
    <Link
      href={`/actu/${slug}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        {hero_image_url ? (
          <Image
            src={hero_image_url}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <Calendar className="h-10 w-10 text-gray-300" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${color}`}>
            {label}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-primary text-[15px] leading-snug mb-2 line-clamp-2 group-hover:text-secondary transition-colors">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
            {subtitle.length > 150 ? subtitle.slice(0, 150) + '...' : subtitle}
          </p>
        )}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          {published_at && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Calendar className="h-3 w-3" />
              {formatDate(published_at)}
            </span>
          )}
          <span className="text-secondary font-bold text-[13px]">Lire &rarr;</span>
        </div>
      </div>
    </Link>
  )
}
