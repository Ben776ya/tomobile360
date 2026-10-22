'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Play } from 'lucide-react'
import { JsonLd } from '@/components/seo/JsonLd'
import { EmbedConsentGate } from '@/components/shared/EmbedConsentGate'
import { useConsent } from '@/lib/analytics/use-consent'
import { getVideoEmbedUrl, getVideoHostLabel, getYouTubeThumbnail, toIsoDuration } from '@/lib/videos/youtube'
import { cleanVideoDescription } from '@/lib/videos/clean-description'

interface LazyVideoEmbedProps {
  /** The watch/share URL (the `video_url` column). */
  videoUrl: string
  title: string
  thumbnailUrl?: string | null
  description?: string | null
  /** Display duration like "12:34" (converted to ISO 8601 for JSON-LD). */
  duration?: string | null
  /** ISO date string for VideoObject.uploadDate. */
  uploadDate?: string | null
  className?: string
}

/**
 * Click-to-load video embed: renders a lightweight thumbnail facade and only
 * mounts the YouTube/Vimeo iframe after the user clicks — so the heavy player
 * doesn't load on every model page. Until cookies are accepted the facade is
 * EmbedConsentGate (« Charger la vidéo » + link to the original). Emits
 * VideoObject JSON-LD (server-rendered in the initial HTML) whether or not the
 * iframe is loaded.
 */
export function LazyVideoEmbed({
  videoUrl,
  title,
  thumbnailUrl,
  description,
  duration,
  uploadDate,
  className,
}: LazyVideoEmbedProps) {
  const [loaded, setLoaded] = useState(false)
  const consented = useConsent() === 'accepted'

  const baseEmbed = getVideoEmbedUrl(videoUrl)
  const thumbnail = thumbnailUrl || getYouTubeThumbnail(videoUrl)
  const isoDuration = toIsoDuration(duration)
  const summary = cleanVideoDescription(description)
  // Autoplay only after an explicit click (facade → player).
  const embedSrc = baseEmbed.includes('?') ? `${baseEmbed}&autoplay=1` : `${baseEmbed}?autoplay=1`

  return (
    <div className={className}>
      <JsonLd
        data={{
          '@type': 'VideoObject',
          name: title,
          ...(summary ? { description: summary.substring(0, 200) } : {}),
          thumbnailUrl: [thumbnail || 'https://www.tomobile360.ma/og-image.png'],
          ...(uploadDate ? { uploadDate } : {}),
          ...(isoDuration ? { duration: isoDuration } : {}),
          ...(baseEmbed ? { embedUrl: baseEmbed } : {}),
          publisher: {
            '@type': 'Organization',
            name: 'Tomobile 360',
            logo: { '@type': 'ImageObject', url: 'https://www.tomobile360.ma/logo_tomobile360.png' },
          },
        }}
      />
      <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
        {loaded ? (
          <iframe
            src={embedSrc}
            title={title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : !consented ? (
          <EmbedConsentGate
            provider={getVideoHostLabel(videoUrl)}
            href={videoUrl}
            thumbnail={thumbnail}
            onLoad={() => setLoaded(true)}
          />
        ) : (
          <button
            type="button"
            onClick={() => setLoaded(true)}
            className="group absolute inset-0 h-full w-full"
            aria-label={`Lire la vidéo : ${title}`}
          >
            {thumbnail ? (
              <Image
                src={thumbnail}
                alt={title}
                fill
                sizes="(max-width: 768px) 100vw, 66vw"
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-slate-800 to-slate-900" />
            )}
            <span className="absolute inset-0 flex items-center justify-center bg-black/25 transition-colors group-hover:bg-black/35">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/90 text-white shadow-lg transition-transform group-hover:scale-105">
                <Play className="h-7 w-7 translate-x-0.5" fill="currentColor" />
              </span>
            </span>
          </button>
        )}
      </div>
    </div>
  )
}
