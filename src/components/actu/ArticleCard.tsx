import Link from 'next/link'
import Image from 'next/image'
import { Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { BlogListItem } from '@/lib/types/blog'
import { CATEGORY_LABELS, CATEGORY_PILL_COLORS } from '@/lib/blog/categories'

export function ArticleCard({ post }: { post: BlogListItem }) {
  const color = CATEGORY_PILL_COLORS[post.category] || 'bg-gray-500 text-white'
  const label = CATEGORY_LABELS[post.category] || post.category

  return (
    <Link
      href={`/actu/${post.slug}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        {post.hero_image_url ? (
          <Image
            src={post.hero_image_url}
            alt={post.title}
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
          <span
            className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${color}`}
          >
            {label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-primary text-[15px] leading-snug mb-2 line-clamp-2 group-hover:text-secondary transition-colors">
          {post.title}
        </h3>
        {post.subtitle && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
            {post.subtitle.length > 150
              ? post.subtitle.slice(0, 150) + '...'
              : post.subtitle}
          </p>
        )}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          {post.published_at && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Calendar className="h-3 w-3" />
              {formatDate(post.published_at)}
            </span>
          )}
          <span className="text-secondary font-bold text-[13px]">
            Lire &rarr;
          </span>
        </div>
      </div>
    </Link>
  )
}
