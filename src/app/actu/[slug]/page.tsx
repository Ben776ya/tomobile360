import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, Eye, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'
import { JsonLd } from '@/components/seo/JsonLd'
import { MarkdownRenderer } from '@/components/blog/MarkdownRenderer'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import { getPostBySlug, getRelatedPosts, incrementViews } from '@/lib/blog'
import { createClient } from '@/lib/supabase/server'
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
  const supabase = createClient()
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

      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { name: 'Actualités', href: '/actu' },
            { name: post.title },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <article className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-card overflow-hidden border border-gray-100">
              {/* Hero Image */}
              {post.hero_image_url && (
                <div className="relative w-full aspect-[16/9] bg-gray-100">
                  <Image
                    src={post.hero_image_url}
                    alt={post.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    priority
                  />
                </div>
              )}
              {post.hero_image_caption && (
                <p className="px-6 pt-3 text-xs text-gray-400 italic">
                  {post.hero_image_caption}
                </p>
              )}

              <div className="p-6 md:p-8">
                {/* Category + Meta */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Badge className={`border-0 ${categoryColor}`}>
                    {categoryLabel}
                  </Badge>
                  {post.published_at && (
                    <span className="flex items-center gap-1 text-sm text-gray-400">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(post.published_at)}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-sm text-gray-400">
                    <Clock className="h-3.5 w-3.5" />
                    {estimateReadTime(post.content)} de lecture
                  </span>
                  <span className="flex items-center gap-1 text-sm text-gray-400">
                    <Eye className="h-3.5 w-3.5" />
                    {post.views.toLocaleString()} vues
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary font-display leading-tight mb-4">
                  {post.title}
                </h1>

                {/* Subtitle */}
                {post.subtitle && (
                  <div className="bg-gray-50/50 border-l-4 border-secondary p-4 mb-6 rounded-r-lg">
                    <p className="text-lg text-gray-600 italic leading-relaxed">
                      {post.subtitle}
                    </p>
                  </div>
                )}

                {/* Markdown Body */}
                <MarkdownRenderer content={post.content} />

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-500 mb-3">
                      Tags :
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Author Box */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary/10 text-secondary">
                      <User className="h-5 w-5" />
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
                </div>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            {related.length > 0 && (
              <div className="bg-white rounded-2xl shadow-card p-6 sticky top-4 border border-gray-100">
                <h2 className="text-lg font-bold text-primary mb-4">
                  Articles similaires
                </h2>
                <div className="space-y-4">
                  {related.map((r) => (
                    <RelatedCard key={r.id} post={r} />
                  ))}
                </div>
                <Link
                  href="/actu"
                  className="mt-5 block text-center text-sm font-medium text-secondary hover:text-secondary-600 transition-colors"
                >
                  Voir toutes les actualités &rarr;
                </Link>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}

function RelatedCard({ post }: { post: BlogListItem }) {
  return (
    <Link href={`/actu/${post.slug}`} className="block group">
      <div className="flex gap-3">
        {post.hero_image_url && (
          <div className="relative w-24 aspect-video bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src={post.hero_image_url}
              alt={post.title}
              fill
              className="object-cover"
              sizes="96px"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-primary line-clamp-2 group-hover:text-secondary transition-colors">
            {post.title}
          </h3>
          {post.published_at && (
            <p className="text-xs text-gray-400 mt-1">
              {formatRelativeTime(post.published_at)}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
