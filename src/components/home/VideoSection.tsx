'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Play, Eye, ChevronRight } from 'lucide-react'
import { Video } from '@/lib/types'
import { MobileCarousel } from '@/components/shared/MobileCarousel'

interface VideoSectionProps {
  videos: Video[]
}

export function VideoSection({ videos }: VideoSectionProps) {
  if (!videos || videos.length === 0) return null

  const displayVideos = videos.slice(0, 3)

  return (
    <section className="py-4 md:py-6 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="p-6 md:p-8 relative">
          {/* Section Header */}
          <div className="text-center mb-10 relative z-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Image
                src="/logo_tomobil360.png"
                alt="Tomobile 360"
                width={160}
                height={40}
                className="h-10 w-auto object-contain"
              />
              <span className="text-2xl md:text-3xl lg:text-4xl font-bold font-sans text-secondary tracking-widest">
                TV
              </span>
            </div>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Découvrez nos derniers essais et tests automobiles en vidéo
            </p>
            <div className="neon-line w-24 mx-auto mt-4" />
          </div>

          {/* Videos Grid */}
          <div className="mb-8 relative z-10">
            <MobileCarousel desktopClassName="grid grid-cols-1 md:grid-cols-3 gap-5" autoPlayMs={5000}>
              {displayVideos.map((video) => (
                <Link
                  key={video.id}
                  href={`/videos/${video.id}`}
                  className="group block"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-3 border border-gray-700 group-hover:border-secondary/30 transition-all">
                    <Image
                      src={video.thumbnail_url || '/placeholder-video.jpg'}
                      alt={video.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                      <div className="w-14 h-14 rounded-full bg-secondary/90 flex items-center justify-center group-hover:scale-110 group-hover:shadow-gold transition-all shadow-lg">
                        <Play className="h-6 w-6 text-primary ml-1" fill="currentColor" />
                      </div>
                    </div>
                    {/* Duration Badge */}
                    {video.duration && (
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-medium px-2 py-0.5 rounded">
                        {video.duration}
                      </div>
                    )}
                    {/* Category Badge */}
                    {video.category && (
                      <div className="absolute top-2 left-2 bg-primary text-white text-xs font-semibold px-2 py-0.5 rounded shadow-glow-indigo-sm">
                        {video.category}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <h3 className="font-bold text-white text-sm md:text-base mb-1.5 line-clamp-2 group-hover:text-secondary transition-colors">
                    {video.title}
                  </h3>
                  {video.description && (
                    <p className="text-gray-400 text-xs line-clamp-2 mb-1.5">
                      {video.description}
                    </p>
                  )}
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{video.views.toLocaleString()} vues</span>
                  </div>
                </Link>
              ))}
            </MobileCarousel>
          </div>

          {/* View All Link */}
          <div className="text-center relative z-10">
            <Link
              href="/videos"
              className="inline-flex items-center gap-2 px-8 py-3 bg-secondary hover:bg-secondary-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-gold hover:shadow-gold-lg"
            >
              Plus de vidéos
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
