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
      // googletagmanager.com hosts gtag.js (GA4). Consent-gated in
      // GoogleAnalytics.tsx, so it only loads after the visitor accepts cookies.
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline'",
      // img-src already allows https: (covers GA measurement pixels).
      "img-src 'self' data: blob: https:",
      "font-src 'self' https://fonts.gstatic.com",
      // GA4 sends its /g/collect beacon to *.google-analytics.com (region
      // endpoints) / *.analytics.google.com; gtag also fetches from GTM.
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com",
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
  experimental: {
    // Tree-shake barrel imports for icon / utility packages. Without this,
    // `import { Foo } from 'lucide-react'` pulls the whole barrel into the
    // page chunk even if Foo is the only icon used on that page.
    optimizePackageImports: ['lucide-react'],
    ...(isProductionBuild
      ? {
          // Single-CPU during `next build` is needed to avoid OOM on the
          // static-paths worker (see top-of-file comment).
          workerThreads: false,
          cpus: 1,
        }
      : {}),
  },
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
    unoptimized: true,
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

// Wrap with Sentry only if the SDK is installed AND a DSN is present.
// This keeps local builds without Sentry credentials working unchanged.
let exportedConfig = nextConfig
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { withSentryConfig } = require('@sentry/nextjs')
  if (process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN) {
    exportedConfig = withSentryConfig(nextConfig, {
      // Org/project only needed for source-map upload; the SDK ignores
      // these at runtime — they're for the build-time webpack plugin.
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      silent: !process.env.CI,
      widenClientFileUpload: true,
      tunnelRoute: '/monitoring',
      webpack: {
        treeshake: { removeDebugLogging: true },
        automaticVercelMonitors: false,
      },
      // Source-map upload is skipped automatically when SENTRY_AUTH_TOKEN is unset.
    })
  }
} catch {
  // @sentry/nextjs not installed → ship vanilla config.
}

module.exports = exportedConfig
