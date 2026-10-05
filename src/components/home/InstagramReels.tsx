'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Pause, Play, Volume2, VolumeX } from 'lucide-react'
import type { InstagramReel } from '@/lib/instagram'
import { InstagramIcon } from '@/components/shared/FloatingSocialBubble'

interface InstagramReelsProps {
  reels: InstagramReel[]
  handle: string
  profileUrl: string
  className?: string
}

const IFRAME_ALLOW = 'autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share; fullscreen'
// @tomobile360.ma's profile picture, served locally (Instagram CDN URLs expire).
const AVATAR_SRC = '/instagram-avatar.jpg'

// Our Instagram-style header strip (same height as Instagram's own).
const HEADER_PX = 54

// Instagram's reel embed (measured 2026-10-05 on every curated reel, 398–620 px
// wide): a 54 px header, then a W × 1.25W media box with the 9:16 reel
// contain-fitted in its middle 0.703W (1.25 × 9/16 = 45/64). An iframe 64/45 of
// the media area's width, centred, therefore shows the reel edge to edge:
// Instagram's letterbox bars fall outside the panel, its header sits above the
// media area and its footer below. OVERSCAN zooms 1% further so sub-pixel
// rounding never exposes a bar.
const EMBED_HEADER_PX = 54
const OVERSCAN = 1.01
const EMBED_WIDTH = (64 / 45) * OVERSCAN // × media-area width
// The panel is 9:16 including our header, so the reel is ~60 px taller than the
// media area. Trim only a fifth of that off the top: burned-in logos and titles
// sit near the top, and the bottom is Instagram's own UI zone in the app.
const TOP_TRIM_SHARE = 0.2
const round4 = (x: number) => +x.toFixed(4)
const EMBED_FRAME_STYLE: CSSProperties = {
  width: `${round4(EMBED_WIDTH * 100)}%`,
  left: `${round4(((1 - EMBED_WIDTH) / 2) * 100)}%`,
  // Reel height = OVERSCAN × (media area + header); lift the frame past
  // Instagram's header plus TOP_TRIM_SHARE of the excess over the media area.
  top: `calc(${round4(-(EMBED_HEADER_PX + TOP_TRIM_SHARE * HEADER_PX * OVERSCAN))}px - ${round4(TOP_TRIM_SHARE * (OVERSCAN - 1) * 100)}%)`,
  // Room for Instagram's footer below the reel (cropped by the panel).
  height: `calc(100% + ${EMBED_HEADER_PX + HEADER_PX + 240}px)`,
}
// Same trim for native video (object-fit: cover).
const VIDEO_OBJECT_POSITION = `50% ${round4(TOP_TRIM_SHARE * 100)}%`

// Instagram's embed script posts {type: 'MOUNTED'} once the reel is rendered.
// A deleted reel only posts LOADING and a blocked/offline request posts nothing,
// yet all of them fire `load` — so only MOUNTED reveals the embed.
const MOUNT_GRACE_AFTER_LOAD_MS = 4000
const MOUNT_TIMEOUT_MS = 15000

// overflow: clip (unlike hidden) can't be scrolled by focus or scrollIntoView,
// which would shift the crop and expose Instagram's chrome. Browsers without
// `clip` drop the inline value and keep the overflow-hidden class.
const NO_SCROLL_CLIP: CSSProperties = { overflow: 'clip' }

/**
 * True once the page has finished loading and the main thread is idle, so the
 * Instagram iframe / video never competes with the hero for bandwidth.
 */
function useAfterPageLoad(): boolean {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    let handle: number | undefined
    const schedule = () => {
      handle =
        typeof window.requestIdleCallback === 'function'
          ? window.requestIdleCallback(() => setReady(true), { timeout: 2000 })
          : window.setTimeout(() => setReady(true), 200)
    }
    if (document.readyState === 'complete') schedule()
    else window.addEventListener('load', schedule, { once: true })
    return () => {
      window.removeEventListener('load', schedule)
      if (handle === undefined) return
      if (typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(handle)
      else window.clearTimeout(handle)
    }
  }, [])
  return ready
}

/**
 * Borderless reel-format (9:16) panel cycling through the account's latest
 * reels: the reel fills the panel under an Instagram-style publisher header,
 * with a pair of small arrows. By default each reel is Instagram's own embed,
 * cropped to the reel; a reel with a playable MP4 (Instagram API) plays
 * natively and adds pause / mute controls.
 */
export function InstagramReels({ reels, handle, profileUrl, className = '' }: InstagramReelsProps) {
  const [current, setCurrent] = useState(0)
  const [muted, setMuted] = useState(true)
  const ready = useAfterPageLoad()
  const n = reels.length
  if (n === 0) return null

  const reel = reels[current]
  const native = reel.videoUrl !== null
  const go = (delta: number) => setCurrent((c) => (c + delta + n) % n)

  const arrow =
    'absolute top-1/2 z-20 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50 focus:outline-none focus-visible:bg-black/75 focus-visible:ring-2 focus-visible:ring-white'

  return (
    <section
      aria-label={`Reels Instagram @${handle}`}
      data-instagram-reels
      className={`relative isolate flex aspect-[9/16] flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_1px_2px_rgba(13,18,32,0.04),0_14px_32px_-22px_rgba(13,18,32,0.22)] ${className}`}
      style={NO_SCROLL_CLIP}
    >
      <ReelHeader handle={handle} profileUrl={profileUrl} />

      {/* The reel, edge to edge under the header. */}
      <div className="relative min-h-0 flex-1 overflow-hidden bg-black" style={NO_SCROLL_CLIP} data-reel-media>
        {native ? (
          <ReelVideo key={reel.code} reel={reel} ready={ready} muted={muted} onToggleMute={() => setMuted((m) => !m)} />
        ) : (
          <ReelEmbed key={reel.code} reel={reel} ready={ready} title={`Reel Instagram de @${handle} (${current + 1} sur ${n})`} />
        )}

        {n > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} className={`${arrow} left-2`} aria-label="Reel précédent">
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button type="button" onClick={() => go(1)} className={`${arrow} right-2`} aria-label="Reel suivant">
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <p className="sr-only" aria-live="polite">
              Reel {current + 1} sur {n}
            </p>
          </>
        )}
      </div>
    </section>
  )
}

/**
 * Replica of Instagram's embed header (white, 54 px, 600 14/18 system font,
 * #4A5DF9 button), reduced to the publisher: avatar, name, "Voir le profil".
 */
function ReelHeader({ handle, profileUrl }: { handle: string; profileUrl: string }) {
  return (
    <div
      className="flex flex-shrink-0 items-center gap-2 bg-white pl-3 pr-2.5 [font-family:-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif] xl:gap-2.5"
      // min-height: grows (and the name wraps) under user text-spacing overrides.
      style={{ minHeight: HEADER_PX }}
    >
      {/* Mouse shortcut only; the button is the keyboard / screen-reader link. */}
      <a
        href={profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={-1}
        className="flex min-w-0 items-center gap-2 xl:gap-2.5"
      >
        <Image
          src={AVATAR_SRC}
          alt=""
          width={32}
          height={32}
          className="h-7 w-7 flex-shrink-0 rounded-full ring-1 ring-black/10 xl:h-8 xl:w-8"
        />
        <span className="min-w-0 text-[13px] font-semibold leading-[18px] text-black [overflow-wrap:anywhere] xl:text-[14px]">
          {handle}
        </span>
      </a>
      <a
        href={profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Voir le profil Instagram de @${handle}`}
        className="ml-auto flex-shrink-0 rounded-[3px] bg-[#4A5DF9] px-2.5 py-1 text-[13px] font-semibold leading-[18px] text-white transition-colors hover:bg-[#3A4DE6] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A5DF9] focus-visible:ring-offset-2 xl:px-3 xl:py-[5px] xl:text-[14px]"
      >
        Voir le profil
      </a>
    </div>
  )
}

/** "Voir ce reel sur Instagram": revealed on keyboard focus, or as the fallback. */
function ReelLink({ reel, visible }: { reel: InstagramReel; visible: boolean }) {
  return (
    <a
      href={reel.permalink}
      target="_blank"
      rel="noopener noreferrer"
      className={
        visible
          ? 'whitespace-nowrap rounded-full bg-black/75 px-3 py-1.5 text-xs font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white'
          : // Styles only on focus: padding would otherwise override sr-only's 1 px box.
            'sr-only focus:not-sr-only focus:absolute focus:bottom-3 focus:left-1/2 focus:z-30 focus:-translate-x-1/2 focus:whitespace-nowrap focus:rounded-full focus:bg-black/75 focus:px-3 focus:py-1.5 focus:text-xs focus:font-semibold focus:text-white focus:outline-none focus:ring-2 focus:ring-white'
      }
    >
      Voir ce reel sur Instagram
    </a>
  )
}

/**
 * Instagram's official embed, cropped to the reel itself (see EMBED_FRAME_STYLE).
 * Hidden behind a placeholder until Instagram reports the reel MOUNTED; a reel
 * that never mounts (deleted, blocked, offline) gets a link to Instagram instead.
 * The frame is out of the tab order and the accessibility tree: its links are
 * cropped away, so keyboard and screen-reader users get ReelLink instead.
 */
function ReelEmbed({ reel, ready, title }: { reel: InstagramReel; ready: boolean; title: string }) {
  const ref = useRef<HTMLIFrameElement>(null)
  const graceTimer = useRef<number>()
  const [status, setStatus] = useState<'loading' | 'mounted' | 'failed'>('loading')

  useEffect(() => {
    if (!ready) return
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.instagram.com' || event.source !== ref.current?.contentWindow) return
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
        if (data?.type === 'MOUNTED') setStatus('mounted')
      } catch {
        // Not one of Instagram's messages.
      }
    }
    window.addEventListener('message', onMessage)
    const timeout = window.setTimeout(() => setStatus((s) => (s === 'loading' ? 'failed' : s)), MOUNT_TIMEOUT_MS)
    return () => {
      window.removeEventListener('message', onMessage)
      window.clearTimeout(timeout)
      window.clearTimeout(graceTimer.current)
    }
  }, [ready])

  const handleLoad = () => {
    window.clearTimeout(graceTimer.current)
    graceTimer.current = window.setTimeout(
      () => setStatus((s) => (s === 'loading' ? 'failed' : s)),
      MOUNT_GRACE_AFTER_LOAD_MS,
    )
  }

  return (
    <>
      {ready && (
        <iframe
          ref={ref}
          src={`https://www.instagram.com/reel/${reel.code}/embed/`}
          title={title}
          tabIndex={-1}
          aria-hidden="true"
          className="absolute max-w-none border-0"
          style={EMBED_FRAME_STYLE}
          allow={IFRAME_ALLOW}
          scrolling="no"
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={handleLoad}
        />
      )}
      {status !== 'mounted' && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center bg-neutral-900"
          data-reel-placeholder
        >
          {status === 'failed' ? (
            <ReelLink reel={reel} visible />
          ) : (
            <span aria-hidden="true">
              <InstagramIcon className="h-9 w-9 animate-pulse text-white/20" />
            </span>
          )}
        </div>
      )}
      {status !== 'failed' && <ReelLink reel={reel} visible={false} />}
    </>
  )
}

interface ReelVideoProps {
  reel: InstagramReel
  ready: boolean
  muted: boolean
  onToggleMute: () => void
}

/** Native reel: autoplays muted while on screen (not with reduced motion or Save-Data). */
function ReelVideo({ reel, ready, muted, onToggleMute }: ReelVideoProps) {
  const ref = useRef<HTMLVideoElement>(null)
  const pausedByUser = useRef(false)
  const [playing, setPlaying] = useState(false)

  // React doesn't reflect `muted` reliably; set the property directly.
  useEffect(() => {
    if (ref.current) ref.current.muted = muted
  }, [muted])

  useEffect(() => {
    const video = ref.current
    if (!ready || !video) return
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData
    if (saveData || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !pausedByUser.current) video.play().catch(() => {})
        else if (!entry.isIntersecting) video.pause()
      },
      { threshold: 0.5 },
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [ready])

  const togglePlay = () => {
    const video = ref.current
    if (!video) return
    if (video.paused) {
      pausedByUser.current = false
      video.play().catch(() => {})
    } else {
      pausedByUser.current = true
      video.pause()
    }
  }

  const control =
    'flex h-7 w-7 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white'

  return (
    <>
      <video
        ref={ref}
        src={ready ? reel.videoUrl ?? undefined : undefined}
        poster={reel.posterUrl ?? undefined}
        muted
        loop
        playsInline
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onClick={togglePlay}
        className="absolute inset-0 h-full w-full cursor-pointer object-cover"
        style={{ objectPosition: VIDEO_OBJECT_POSITION }}
        aria-label={reel.caption ?? 'Reel Instagram'}
      />
      <ReelLink reel={reel} visible={false} />

      {!playing && (
        <button
          type="button"
          onClick={togglePlay}
          tabIndex={-1}
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 z-10 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-transform hover:scale-105"
        >
          <Play className="h-6 w-6 translate-x-0.5" fill="currentColor" />
        </button>
      )}

      <div className="absolute bottom-3 right-3 z-20 flex gap-1.5">
        {/* Always reachable pause control for the autoplaying reel (WCAG 2.2.2). */}
        <button
          type="button"
          onClick={togglePlay}
          className={control}
          aria-label={playing ? 'Mettre le reel en pause' : 'Lire le reel'}
        >
          {playing ? <Pause className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true" /> : <Play className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true" />}
        </button>
        <button
          type="button"
          onClick={onToggleMute}
          className={control}
          aria-label={muted ? 'Activer le son' : 'Couper le son'}
          aria-pressed={!muted}
        >
          {muted ? <VolumeX className="h-3.5 w-3.5" aria-hidden="true" /> : <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />}
        </button>
      </div>
    </>
  )
}
