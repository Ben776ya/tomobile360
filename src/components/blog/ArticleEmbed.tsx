'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ExternalLink, Link2, Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import { parseEmbedUrl, toSafeLinkUrl, type EmbedInfo } from '@/lib/blog/embeds'

interface ArticleEmbedProps {
  url: string
  caption?: string
  className?: string
}

const IFRAME_ALLOW =
  'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen'

/**
 * URL-embedded media for article bodies (`::embed{url}`): YouTube, Vimeo,
 * Dailymotion, Facebook, Instagram, TikTok. Unsupported URLs degrade to a
 * plain link card — an arbitrary URL is never put in an iframe.
 */
export function ArticleEmbed({ url, caption, className }: ArticleEmbedProps) {
  const info = parseEmbedUrl(url)

  if (!info) {
    const href = toSafeLinkUrl(url)
    if (!href) return null
    return (
      <figure className={cn('clear-both my-8', className)}>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-primary transition-colors hover:border-secondary hover:text-secondary"
        >
          <Link2 className="h-4 w-4 flex-shrink-0 text-secondary" aria-hidden="true" />
          <span className="min-w-0 flex-1 truncate">{caption || new URL(href).hostname.replace(/^www\./, '')}</span>
          <ExternalLink className="h-4 w-4 flex-shrink-0 text-gray-400" aria-hidden="true" />
        </a>
      </figure>
    )
  }

  const title = caption || `Contenu ${info.label}`

  return (
    <figure className={cn('clear-both my-8', className)} data-embed-provider={info.provider}>
      <EmbedFrame info={info} title={title} />
      <figcaption
        className={cn(
          'mt-2 flex items-start justify-between gap-3 text-xs text-gray-400',
          info.shape !== 'landscape' && 'mx-auto',
          info.shape === 'portrait' && 'max-w-[340px]',
          info.shape === 'post' && 'max-w-[540px]',
        )}
      >
        <span className="italic">{caption}</span>
        <a
          href={info.url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="inline-flex flex-shrink-0 items-center gap-1 not-italic text-gray-400 hover:text-secondary"
        >
          Voir sur {info.label}
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
      </figcaption>
    </figure>
  )
}

function EmbedFrame({ info, title }: { info: EmbedInfo; title: string }) {
  if (info.shape === 'portrait') {
    return (
      <div className="mx-auto aspect-[9/16] w-full max-w-[340px] overflow-hidden rounded-xl bg-black">
        <iframe
          src={info.src}
          title={title}
          className="h-full w-full"
          allow={IFRAME_ALLOW}
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    )
  }

  if (info.shape === 'post') {
    return <PostFrame info={info} title={title} />
  }

  if (info.provider === 'youtube' && info.thumbnail) {
    return <YouTubeFacade info={info} title={title} />
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
      <iframe
        src={info.src}
        title={title}
        className="absolute inset-0 h-full w-full"
        allow={IFRAME_ALLOW}
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  )
}

/** Thumbnail + play button; the heavy YouTube player loads only on click. */
function YouTubeFacade({ info, title }: { info: EmbedInfo; title: string }) {
  const [playing, setPlaying] = useState(false)
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
      {playing ? (
        <iframe
          src={`${info.src}&autoplay=1`}
          title={title}
          className="absolute inset-0 h-full w-full"
          allow={IFRAME_ALLOW}
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group absolute inset-0 h-full w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          aria-label={`Lire la vidéo : ${title}`}
        >
          <Image src={info.thumbnail!} alt="" fill sizes="(max-width: 768px) 100vw, 680px" className="object-cover" />
          <span className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent transition-colors group-hover:from-black/60" />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/95 text-white shadow-lg transition-transform group-hover:scale-105">
              <Play className="h-7 w-7 translate-x-0.5" fill="currentColor" aria-hidden="true" />
            </span>
          </span>
          <span className="absolute bottom-3 left-3 rounded bg-black/60 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
            {info.label}
          </span>
        </button>
      )}
    </div>
  )
}

/**
 * Social post card (Instagram / Facebook post). Its height depends on the
 * post, so start from a sensible estimate and let Instagram's MEASURE
 * messages size it exactly when they arrive.
 */
function PostFrame({ info, title }: { info: EmbedInfo; title: string }) {
  const ref = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState<number | null>(null)

  useEffect(() => {
    if (info.provider !== 'instagram') return
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.instagram.com') return
      if (event.source !== ref.current?.contentWindow) return
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
        const h = Number(data?.details?.height)
        if (data?.type === 'MEASURE' && Number.isFinite(h) && h > 100 && h < 5000) setHeight(Math.ceil(h))
      } catch {
        // Not one of Instagram's messages.
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [info.provider])

  return (
    <div className="mx-auto w-full max-w-[540px] overflow-hidden rounded-xl border border-gray-200 bg-white">
      <iframe
        ref={ref}
        src={info.src}
        title={title}
        className={cn(
          'block w-full',
          !height &&
            (info.provider === 'instagram'
              ? 'h-[calc(min(100vw_-_2rem,540px)_*_1.25_+_190px)]'
              : 'h-[620px]'),
        )}
        style={height ? { height } : undefined}
        allow={IFRAME_ALLOW}
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  )
}
