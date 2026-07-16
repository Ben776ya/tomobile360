import type { Metadata } from 'next'

/**
 * Builds a Next.js Metadata object with a page-specific canonical AND a
 * page-specific Open Graph / Twitter block.
 *
 * Why this exists: Next.js does NOT backfill `openGraph.title/description/url`
 * from a page's top-level `title/description`. A route that sets only
 * `title`/`description`/`canonical` therefore inherits the ROOT layout's Open
 * Graph verbatim — so every such page was emitting the homepage's
 * og:url/og:title/og:image. This helper gives each route its own OG in one call.
 *
 * `path` is a site-relative path (e.g. '/neuf'); canonical + og:url resolve
 * against the root `metadataBase` (https://www.tomobile360.ma). Pass `images`
 * only when a page has a better-than-default share image; otherwise the root
 * default `/og-image.png` is inherited.
 */
export function pageMetadata(opts: {
  title: string
  description: string
  path: string
  images?: string[]
  keywords?: string[]
  type?: 'website' | 'article'
}): Metadata {
  const { title, description, path, images, keywords, type = 'website' } = opts

  return {
    title,
    description,
    ...(keywords ? { keywords } : {}),
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: 'Tomobile 360',
      type,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(images ? { images } : {}),
    },
  }
}
