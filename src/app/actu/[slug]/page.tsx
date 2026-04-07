import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, Eye } from 'lucide-react'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'
import { JsonLd } from '@/components/seo/JsonLd'
import { MarkdownRenderer } from '@/components/blog/MarkdownRenderer'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import { getPostBySlug, getRelatedPosts, incrementViews } from '@/lib/blog'
import type { BlogListItem } from '@/lib/types/blog'

export const revalidate = 30

interface PageProps {
  params: { slug: string }
}

const CATEGORY_LABELS: Record<string, string> = {
  marche: 'Marché',
  nouveautes: 'Nouveautés',
  pratique: 'Pratique',
  tendances: 'Tendances',
  interview: 'Interview',
}

const CATEGORY_COLORS: Record<string, string> = {
  marche: 'bg-emerald-500 text-white',
  nouveautes: 'bg-secondary text-white',
  pratique: 'bg-orange-500 text-white',
  tendances: 'bg-purple-500 text-white',
  interview: 'bg-rose-500 text-white',
}

function estimateReadTime(content: string): string {
  const words = content
    .replace(/[#*_`~\[\]()>|\\-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length
  const minutes = Math.max(1, Math.ceil(words / 200))
  return `${minutes} min`
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await getPostBySlug(params.slug)
  if (!post) return { title: 'Article non trouvé' }

  return {
    title: post.title,
    description: post.meta_description || post.subtitle || undefined,
    alternates: { canonical: `https://tomobile360.ma/actu/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.meta_description || post.subtitle || undefined,
      url: `https://tomobile360.ma/actu/${post.slug}`,
      siteName: 'Tomobile 360',
      images: post.hero_image_url
        ? [{ url: post.hero_image_url, width: 1200, height: 630, alt: post.title }]
        : [{ url: '/og-image.png', width: 1200, height: 630, alt: post.title }],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.meta_description || post.subtitle || undefined,
      images: post.hero_image_url ? [post.hero_image_url] : ['/og-image.png'],
    },
  }
}

export async function generateStaticParams() {
  const { createClient: createDirectClient } = await import('@supabase/supabase-js')
  const supabase = createDirectClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const { data } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(50)

  return (data ?? []).map((post) => ({ slug: post.slug }))
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const post = await getPostBySlug(params.slug)
  if (!post) notFound()

  const related = await getRelatedPosts(post.id, post.category, 3)

  // Fire-and-forget view increment
  incrementViews(post.id)

  const categoryLabel = CATEGORY_LABELS[post.category] || post.category
  const categoryColor = CATEGORY_COLORS[post.category] || 'bg-gray-500 text-white'

  return (
    <div className="min-h-screen bg-background">
      <JsonLd
        data={{
          '@type': 'NewsArticle',
          headline: post.title,
          ...(post.meta_description ? { description: post.meta_description } : {}),
          image: [
            {
              '@type': 'ImageObject',
              url: post.hero_image_url || 'https://tomobile360.ma/og-image.png',
              width: 1200,
              height: 630,
            },
          ],
          datePublished: post.published_at,
          dateModified: post.updated_at,
          author: { '@type': 'Person', name: post.author },
          publisher: {
            '@type': 'Organization',
            name: 'Tomobile 360',
            logo: {
              '@type': 'ImageObject',
              url: 'https://tomobile360.ma/logo_tomobil360.png',
            },
          },
          url: `https://tomobile360.ma/actu/${post.slug}`,
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://tomobile360.ma/actu/${post.slug}`,
          },
        }}
      />

      {/* Full-Bleed Hero */}
      <div className="relative w-full min-h-[320px] sm:min-h-[400px] bg-primary overflow-hidden">
        {/* Background image */}
        {post.hero_image_url && (
          <Image
            src={post.hero_image_url}
            alt={post.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/50 to-primary/20" />

        {/* Content overlay */}
        <div className="relative z-10 container mx-auto px-4 flex flex-col justify-end h-full pb-10 pt-20 sm:pt-28 min-h-[320px] sm:min-h-[400px]">
          <Breadcrumbs
            items={[
              { name: 'Actualités', href: '/actu' },
              { name: post.title },
            ]}
          />

          {/* Category + Meta row */}
          <div className="flex flex-wrap items-center gap-3 mb-3 mt-4">
            <span
              className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${categoryColor}`}
            >
              {categoryLabel}
            </span>
            {post.published_at && (
              <span className="flex items-center gap-1 text-xs sm:text-sm text-white/50">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(post.published_at)}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs sm:text-sm text-white/50">
              <Clock className="h-3.5 w-3.5" />
              {estimateReadTime(post.content)} de lecture
            </span>
            <span className="flex items-center gap-1 text-xs sm:text-sm text-white/50">
              <Eye className="h-3.5 w-3.5" />
              {post.views.toLocaleString()} vues
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white font-display leading-tight max-w-3xl">
            {post.title}
          </h1>

          {/* Subtitle */}
          {post.subtitle && (
            <p className="text-white/60 text-base sm:text-lg leading-relaxed mt-3 max-w-2xl">
              {post.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Hero image caption */}
      {post.hero_image_caption && (
        <p className="text-xs text-gray-400 italic text-center py-2">
          {post.hero_image_caption}
        </p>
      )}

      {/* Body + Sidebar Grid */}
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="lg:grid lg:grid-cols-[1fr_400px] lg:gap-8">
          {/* Main Article */}
          <article className="max-w-[720px] mx-auto lg:mx-auto">
            {/* Author bar */}
            <div className="flex items-center gap-3 pb-6 mb-8 border-b border-gray-100">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center text-white font-bold text-sm">
                {getInitials(post.author)}
              </div>
              <div>
                <p className="font-semibold text-primary text-sm">
                  {post.author}
                </p>
                {post.published_at && (
                  <p className="text-xs text-gray-400">
                    Publié {formatRelativeTime(post.published_at)}
                  </p>
                )}
              </div>
            </div>

            {/* Markdown Body */}
            <MarkdownRenderer content={post.content} />

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="border border-gray-200 text-gray-500 px-4 py-1.5 rounded-full text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Sidebar — hidden on mobile, sticky on desktop */}
          {related.length > 0 && (
            <aside className="mt-10 lg:mt-0 lg:pr-4">
              <div className="sticky top-[90px] bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-secondary/[0.08]">
                <h2 className="text-[15px] font-bold text-primary pb-3 border-b-2 border-secondary inline-block mb-5">
                  Articles similaires
                </h2>
                <div>
                  {related.map((r, idx) => (
                    <RelatedCard
                      key={r.id}
                      post={r}
                      isLast={idx === related.length - 1}
                    />
                  ))}
                </div>
                <Link
                  href="/actu"
                  className="mt-4 block text-center text-secondary font-bold text-[13px] py-2.5 bg-secondary/[0.04] rounded-xl hover:bg-secondary/[0.08] transition-colors"
                >
                  Voir tous les articles &rarr;
                </Link>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}

function RelatedCard({
  post,
  isLast,
}: {
  post: BlogListItem
  isLast: boolean
}) {
  return (
    <Link
      href={`/actu/${post.slug}`}
      className={`block group ${isLast ? '' : 'pb-4 mb-4 border-b border-gray-100'}`}
    >
      <div className="flex gap-3">
        {post.hero_image_url ? (
          <div className="relative w-[72px] h-[52px] bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
            <Image
              src={post.hero_image_url}
              alt={post.title}
              fill
              className="object-cover"
              sizes="72px"
            />
          </div>
        ) : (
          <div className="w-[72px] h-[52px] rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 flex-shrink-0 flex items-center justify-center">
            <Calendar className="h-4 w-4 text-gray-300" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[13px] text-primary line-clamp-2 group-hover:text-secondary transition-colors leading-snug">
            {post.title}
          </h3>
          {post.published_at && (
            <p className="text-[11px] text-gray-400 mt-1">
              {formatRelativeTime(post.published_at)}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
