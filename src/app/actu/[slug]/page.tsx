import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, Calendar, Clock, Share2, Facebook, Twitter } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatRelativeTime } from '@/lib/utils'
import sanitizeHtml from 'sanitize-html'

export const revalidate = 30

interface PageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = await createClient()
  const { data: article } = await supabase
    .from('articles')
    .select('title, excerpt, featured_image, slug, profiles:author_id (full_name)')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single()

  if (!article) {
    return { title: 'Article non trouvé | Tomobile 360' }
  }

  return {
    title: `${article.title} | Tomobile 360`,
    description: article.excerpt || undefined,
    alternates: {
      canonical: `https://tomobile360.ma/actu/${article.slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.excerpt || undefined,
      url: `https://tomobile360.ma/actu/${article.slug}`,
      siteName: 'Tomobile 360',
      images: article.featured_image
        ? [{ url: article.featured_image, width: 1200, height: 630, alt: article.title }]
        : [{ url: '/og-image.png', width: 1200, height: 630, alt: article.title }],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt || undefined,
      images: article.featured_image ? [article.featured_image] : ['/og-image.png'],
    },
  }
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const supabase = await createClient()

  // Fetch article
  const { data: article } = await supabase
    .from('articles')
    .select('*, profiles:author_id (full_name, avatar_url)')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single()

  if (!article) {
    notFound()
  }

  // Redirect to external URL if this is an external article
  if (article.content?.startsWith('http')) {
    redirect(article.content)
  }

  // Increment view count
  void supabase.rpc('increment_article_views', { article_id: article.id })

  // Fetch related articles (same category)
  const { data: relatedArticles } = await supabase
    .from('articles')
    .select('id, title, slug, featured_image, published_at')
    .eq('is_published', true)
    .eq('category', article.category)
    .neq('id', article.id)
    .order('published_at', { ascending: false })
    .limit(3)

  const categoryLabels: { [key: string]: string } = {
    morocco: 'Maroc',
    Morocco: 'Maroc',
    international: 'International',
    International: 'International',
    market: 'Marché',
    Market: 'Marché',
    review: 'Essai',
    Review: 'Essai',
    technology: 'Technologie',
    news: 'Actualité',
    News: 'Actualité',
  }

  const estimateReadTime = (content: string) => {
    const wordsPerMinute = 200
    const plainText = content.replace(/<[^>]+>/g, ' ').trim()
    const words = plainText.split(/\s+/).filter(Boolean).length
    const minutes = Math.max(1, Math.ceil(words / wordsPerMinute))
    return `${minutes} min`
  }

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'NewsArticle',
                headline: article.title,
                description: article.excerpt,
                image: article.featured_image || 'https://tomobile360.ma/og-image.png',
                datePublished: article.published_at,
                publisher: {
                  '@type': 'Organization',
                  name: 'Tomobile 360',
                  logo: {
                    '@type': 'ImageObject',
                    url: 'https://tomobile360.ma/logo_tomobil360.png',
                  },
                },
                url: `https://tomobile360.ma/actu/${article.slug}`,
              },
              {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://tomobile360.ma' },
                  { '@type': 'ListItem', position: 2, name: 'Actualités', item: 'https://tomobile360.ma/actu' },
                  { '@type': 'ListItem', position: 3, name: article.title },
                ],
              },
            ],
          }),
        }}
      />
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/actu"
            className="inline-flex items-center gap-2 text-secondary hover:text-secondary-400"
          >
            <ChevronLeft className="h-4 w-4" />
            Retour aux actualités
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <article className="bg-white rounded-lg shadow-card overflow-hidden border border-gray-100">
              {/* Featured Image */}
              {article.featured_image && (
                <div className="relative w-full h-96 bg-gray-50/50">
                  <Image
                    src={article.featured_image}
                    alt={article.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )}

              {/* Article Content */}
              <div className="p-6 md:p-8">
                {/* Category Badge */}
                {article.category && (
                  <Badge variant="secondary" className="mb-4">
                    {categoryLabels[article.category] || article.category}
                  </Badge>
                )}

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold text-primary font-display leading-tight mb-4">
                  {article.title}
                </h1>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-200">
                  {(article as any).profiles?.full_name && (
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-gray-700">{(article as any).profiles.full_name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatRelativeTime(article.published_at)}</span>
                  </div>
                  {article.content && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{estimateReadTime(article.content)} de lecture</span>
                      </div>
                    </>
                  )}
                  <span>•</span>
                  <span>{(article.views || 0).toLocaleString()} vues</span>
                </div>

                {/* Excerpt */}
                {article.excerpt && (
                  <div className="bg-gray-50/50 border-l-4 border-secondary p-4 mb-6">
                    <p className="text-lg text-gray-600 italic">
                      {article.excerpt}
                    </p>
                  </div>
                )}

                {/* Article Body */}
                <div className="mx-auto max-w-[65ch]">
                  <div
                    className="text-gray-600 leading-relaxed text-base [&>p]:mb-5 [&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-primary [&>h2]:mt-10 [&>h2]:mb-4 [&>h2]:font-display [&>h3]:text-lg [&>h3]:font-bold [&>h3]:text-primary [&>h3]:mt-8 [&>h3]:mb-3 [&>h3]:font-display [&>img]:rounded-xl [&>img]:my-6 [&>a]:text-[#006EFE] [&>a]:hover:underline [&>blockquote]:border-l-4 [&>blockquote]:border-[#006EFE] [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-gray-500 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-5 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-5"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtml(article.content, {
                        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2']),
                        allowedAttributes: {
                          ...sanitizeHtml.defaults.allowedAttributes,
                          img: ['src', 'alt', 'width', 'height', 'loading'],
                        },
                      }),
                    }}
                  />
                </div>

                {/* Tags */}
                {article.tags && article.tags.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-500 mb-3">
                      Tags:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {article.tags.map((tag: string) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Share Buttons */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-500 mb-3">
                    Partager cet article:
                  </h3>
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm" className="shadow-card hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300 border-gray-200 text-gray-600 hover:text-secondary hover:border-secondary/20">
                      <Facebook className="h-4 w-4 mr-2" />
                      Facebook
                    </Button>
                    <Button variant="outline" size="sm" className="shadow-card hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300 border-gray-200 text-gray-600 hover:text-secondary hover:border-secondary/20">
                      <Twitter className="h-4 w-4 mr-2" />
                      Twitter
                    </Button>
                    <Button variant="outline" size="sm" className="shadow-card hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300 border-gray-200 text-gray-600 hover:text-secondary hover:border-secondary/20">
                      <Share2 className="h-4 w-4 mr-2" />
                      Copier le lien
                    </Button>
                  </div>
                </div>
              </div>
            </article>

          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Related Articles */}
            {relatedArticles && relatedArticles.length > 0 && (
              <div className="bg-white rounded-lg shadow-card p-6 sticky top-4 border border-gray-100">
                <h2 className="text-lg font-bold text-slate-700 mb-4">Articles similaires</h2>
                <div className="space-y-4">
                  {relatedArticles.map((related) => (
                    <Link
                      key={related.id}
                      href={`/actu/${related.slug}`}
                      className="block group"
                    >
                      <div className="flex gap-3">
                        {related.featured_image && (
                          <div className="relative w-24 aspect-video bg-gray-50/50 rounded overflow-hidden flex-shrink-0">
                            <Image
                              src={related.featured_image}
                              alt={related.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm text-gray-700 line-clamp-2 group-hover:text-secondary transition">
                            {related.title}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatRelativeTime(related.published_at)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link href="/actu" className="mt-4 block">
                  <Button variant="outline" className="w-full shadow-card hover:shadow-elevated transition-all duration-300 border-gray-200 text-gray-600 hover:text-secondary hover:border-secondary/20">
                    Voir toutes les actualités
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
