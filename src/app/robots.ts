import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/compte/', '/api/'],
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'https://tomobile360.ma' : 'http://localhost:3000'}/sitemap.xml`,
  }
}
