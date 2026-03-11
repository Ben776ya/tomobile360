/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  compress: true,
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
