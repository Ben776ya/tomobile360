'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Calendar, ChevronRight, ArrowRight } from 'lucide-react'
import type { BlogListItem } from '@/lib/types/blog'
import { formatDate } from '@/lib/utils'
import { MobileCarousel } from '@/components/shared/MobileCarousel'
import { CATEGORY_LABELS, CATEGORY_PILL_COLORS } from '@/lib/blog/categories'

interface NewsSectionProps {
  articles: BlogListItem[]
}

export function NewsSection({ articles }: NewsSectionProps) {
  if (!articles || articles.length === 0) return null

  const displayArticles = articles.slice(0, 4)

  return (
    <section className="py-4 md:py-6 bg-[#565A5D]/10">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-card px-6 pb-6 pt-4 md:px-8 md:pb-8 md:pt-5">
        {/* Section Header */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-4 text-center">
            Restez informé des dernières actualités automobiles
          </h2>
          {/* Subtitle row — the "En partenariat avec" + "challenge" badge sits on
              the right, vertically level with the subtitle. It is a flex sibling
              rather than an absolute overlay, so it reserves its own space and can
              never overlap the text; the empty left spacer mirrors its flex basis
              to keep the subtitle centered. Stacks below the subtitle on mobile. */}
          <div className="flex flex-col items-center gap-3 md:flex-row md:gap-4">
            <div className="hidden md:block md:flex-1" aria-hidden="true" />
            <p className="text-gray-500 max-w-2xl text-center">
              Les guides d&apos;achat Tomobile 360 : essais, nouveautés et tendances du marché
            </p>
            <div className="flex items-center gap-2.5 md:flex-1 md:justify-end">
              <span className="text-gray-500 text-xs md:text-sm leading-none">
                En partenariat avec
              </span>
              <span className="inline-block rounded-md bg-[#DB0E16] px-4 py-1.5 font-roboto text-base md:text-lg font-bold lowercase leading-tight text-white shadow-lg shadow-[#DB0E16]/30 ring-1 ring-black/5">
                challenge
              </span>
            </div>
          </div>
          <div className="neon-line w-24 mx-auto mt-4" />
        </div>

        {/* Articles Grid */}
        <div className="mb-10">
          <MobileCarousel desktopClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" autoPlayMs={5000}>
          {displayArticles.map((post) => {
            const cat = {
              label: (CATEGORY_LABELS[post.category] || post.category).toUpperCase(),
              bg: CATEGORY_PILL_COLORS[post.category] || 'bg-gray-500 text-white',
            }
            const excerpt = post.subtitle || ''

            return (
              <Link key={post.id} href={`/actu/${post.slug}`} className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                {/* Image */}
                <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
                  <Image
                    src={post.hero_image_url || '/placeholder-article.jpg'}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                  {/* Category tag */}
                  <span className={`tag absolute top-3 left-3 ${cat.bg} text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-md`}>
                    {cat.label}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  {post.published_at && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(post.published_at)}</span>
                    </div>
                  )}
                  <h3 className="font-bold text-slate-700 text-base md:text-lg leading-snug line-clamp-2 mb-2 group-hover:text-secondary transition-colors duration-200">
                    {post.title}
                  </h3>
                  {excerpt && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed flex-1">
                      {excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-1 text-sm font-semibold text-secondary group-hover:gap-2 transition-all duration-200 mt-auto">
                    Lire l&apos;article
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Bottom accent line */}
                <div className="h-[2px] bg-gradient-to-r from-secondary to-[#0284FE] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </Link>
            )
          })}
          </MobileCarousel>
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link
            href="/actu"
            className="inline-flex items-center gap-2 px-8 py-3 bg-secondary hover:bg-secondary-400 text-white font-semibold rounded-xl transition-all duration-300"
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
