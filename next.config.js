/** @type {import('next').NextConfig} */

// Single-CPU / no-worker-threads is needed during `next build` to avoid OOM on
// the static-paths worker, but it actively breaks the dev server: webpack
// chunk loading can race against the static-paths-worker and produce
// `Cannot find module './vendor-chunks/...'` 500s on dynamic routes.
// Apply the constraint only when invoked via `next build`.
const isProductionBuild = process.argv.includes('build')

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "frame-src 'self' https://www.youtube.com https://youtube.com",
      "media-src 'self' https://*.supabase.co",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
]

const nextConfig = {
  poweredByHeader: false,
  compress: true,
  ...(isProductionBuild
    ? {
        experimental: {
          workerThreads: false,
          cpus: 1,
        },
      }
    : {}),
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      // Block search engines from indexing any preview / non-canonical hosts
      // (e.g. *.vercel.app). The production hostname is allow-listed below.
      {
        source: '/(.*)',
        missing: [
          { type: 'host', value: 'tomobile360.ma' },
          { type: 'host', value: 'www.tomobile360.ma' },
        ],
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.vroomsupport.be',
      },
      {
        protocol: 'https',
        hostname: '**.vroom.be',
      },
      {
        protocol: 'https',
        hostname: '**.b-cdn.net',
      },
      {
        protocol: 'https',
        hostname: 'cloud.car-cutter.com',
      },
      {
        protocol: 'https',
        hostname: 'm-occaz.ma',
      },
      {
        protocol: 'https',
        hostname: 'moccaz-crm.onetechapp.ma',
      },
    ],
  },
  async redirects() {
    return [
      // Old per-vehicle URLs: /neuf/{brand}/{model}/{uuid} → /neuf/{brand}/{model}
      // The page itself does a second redirect to the canonical-slug pair
      // when the brand/model params aren't already slug-form.
      {
        source: '/neuf/:brand/:model/:id',
        destination: '/neuf/:brand/:model',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
