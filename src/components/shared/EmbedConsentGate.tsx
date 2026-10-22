'use client'

import { useState, type ReactNode } from 'react'
import Image from 'next/image'
import { ExternalLink } from 'lucide-react'
import { useConsent } from '@/lib/analytics/use-consent'
import { cn } from '@/lib/utils'

interface EmbedConsentGateProps {
  /** Who hosts the embed, e.g. "YouTube" (named in the notice and the link). */
  provider: string
  /** 'video' → « Charger la vidéo »; 'content' (social post) → « Afficher le contenu ». */
  kind?: 'video' | 'content'
  /** The original on the provider's site; omit when the page already links to it. */
  href?: string | null
  /** Poster image shown dimmed behind the notice (not from a host that sets cookies). */
  thumbnail?: string | null
  onLoad: () => void
  className?: string
}

/**
 * Stands in for a third-party player (YouTube, Vimeo, Dailymotion, Facebook,
 * Instagram, TikTok), which may set its own cookies. Same approach as the
 * homepage reels' ReelConsentGate: nothing is requested from the provider
 * until the visitor accepts cookies or clicks « Charger la vidéo » /
 * « Afficher le contenu » (this embed only, not stored), or follows the link
 * to the original.
 */
export function EmbedConsentGate({ provider, kind = 'video', href, thumbnail, onLoad, className }: EmbedConsentGateProps) {
  const video = kind === 'video'
  return (
    <div
      className={cn(
        'relative flex h-full w-full flex-col items-center justify-center gap-3 overflow-hidden bg-neutral-900 px-6 py-4 text-center',
        className,
      )}
      data-embed-consent
    >
      {thumbnail && (
        <Image src={thumbnail} alt="" fill sizes="(max-width: 768px) 100vw, 680px" className="object-cover opacity-30" />
      )}
      <p className="relative max-w-sm text-xs leading-relaxed text-white sm:text-sm">
        {video ? 'Cette vidéo est hébergée' : 'Ce contenu est hébergé'} par {provider}, qui peut déposer des cookies.
      </p>
      <button
        type="button"
        onClick={onLoad}
        className="relative whitespace-nowrap rounded-full bg-white px-4 py-2 text-xs font-semibold text-black transition-colors hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 sm:text-sm"
      >
        {video ? 'Charger la vidéo' : 'Afficher le contenu'}
      </button>
      {href && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="relative inline-flex items-center gap-1 rounded text-xs font-semibold text-white underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          Voir sur {provider}
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
      )}
    </div>
  )
}

/**
 * Renders `children` (the provider's iframe) once the visitor has accepted
 * cookies or clicked the gate's button; until then, EmbedConsentGate.
 * Withdrawing consent unloads it again, unless it was loaded by a click.
 */
export function ConsentGatedEmbed({ children, ...gate }: Omit<EmbedConsentGateProps, 'onLoad'> & { children: ReactNode }) {
  const [loadRequested, setLoadRequested] = useState(false)
  const allowed = useConsent() === 'accepted' || loadRequested
  if (allowed) return <>{children}</>
  return <EmbedConsentGate {...gate} onLoad={() => setLoadRequested(true)} />
}
