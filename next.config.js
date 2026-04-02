/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

const nextConfig = {
  poweredByHeader: false,
  compress: true,
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
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
    ],
  },
}

module.exports = nextConfig
