'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Calendar, ChevronRight, ArrowRight } from 'lucide-react'
import { Article } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { MobileCarousel } from '@/components/shared/MobileCarousel'

interface NewsSectionProps {
  articles: Article[]
}

const categoryConfig: Record<string, { label: string; bg: string }> = {
  morocco:       { label: 'MAROC',         bg: 'bg-blue-500' },
  international: { label: 'INTERNATIONAL', bg: 'bg-purple-500' },
  market:        { label: 'MARCHÉ',        bg: 'bg-emerald-500' },
  review:        { label: 'ESSAI',         bg: 'bg-orange-500' },
  news:          { label: 'ACTUALITÉ',     bg: 'bg-[#32B75C]' },
}

export function NewsSection({ articles }: NewsSectionProps) {
  if (!articles || articles.length === 0) return null

  const displayArticles = articles.slice(0, 4)

  return (
    <section className="py-4 md:py-6">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-card p-6 md:p-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-4">
            Restez informé des dernières actualités automobiles
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Les guides d&apos;achat Tomobile 360 : essais, nouveautés et tendances du marché
          </p>
          <div className="neon-line w-24 mx-auto mt-4" />
        </div>

        {/* Articles Grid */}
        <div className="mb-10">
          <MobileCarousel desktopClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" autoPlayMs={5000}>
          {displayArticles.map((article) => {
            const cat = categoryConfig[article.category || 'news'] || categoryConfig.news
            const excerpt = article.excerpt || ''

            return (
              <Link key={article.id} href={`/actu/${article.slug}`} className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                {/* Image */}
                <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
                  <Image
                    src={article.featured_image || '/placeholder-article.jpg'}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                  {/* Category tag */}
                  {article.category && (
                    <span className={`tag absolute top-3 left-3 ${cat.bg} text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-md`}>
                      {cat.label}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  {article.published_at && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(article.published_at)}</span>
                    </div>
                  )}
                  <h3 className="font-bold text-slate-700 text-base md:text-lg leading-snug line-clamp-2 mb-2 group-hover:text-[#006EFE] transition-colors duration-200">
                    {article.title}
                  </h3>
                  {excerpt && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed flex-1">
                      {excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-1 text-sm font-semibold text-[#006EFE] group-hover:gap-2 transition-all duration-200 mt-auto">
                    Lire l&apos;article
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Bottom accent line */}
                <div className="h-[2px] bg-gradient-to-r from-[#006EFE] to-[#0284FE] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </Link>
            )
          })}
          </MobileCarousel>
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link
            href="/actu"
            className="inline-flex items-center gap-2 px-8 py-3 bg-secondary hover:bg-secondary-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-gold hover:shadow-gold-lg"
          >
            Plus d&apos;actus
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
      </div>
    </section>
  )
}
