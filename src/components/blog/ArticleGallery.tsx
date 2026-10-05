'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Camera, ChevronLeft, ChevronRight, Expand, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { GalleryImage, GalleryLayout } from '@/lib/blog/article-blocks'

interface ArticleGalleryProps {
  images: GalleryImage[]
  layout: GalleryLayout
  caption?: string
}

/** Tiles shown by the mosaic before the "+N" overlay takes over. */
const MOSAIC_MAX_TILES = 5

function altFor(image: GalleryImage, index: number): string {
  return image.alt || image.caption || `Photo ${index + 1}`
}

function photoCount(n: number): string {
  return `${n} photo${n > 1 ? 's' : ''}`
}

/**
 * Magazine-style multi-image block for article bodies (`:::gallery`).
 *
 * - mosaic: editorial collage (hero + supporting shots, "+N" on overflow)
 * - grid: uniform contact sheet, every photo visible
 * - carousel: swipeable slides with per-photo captions
 *
 * Every layout opens a full-screen lightbox (keyboard ← → / swipe / Échap).
 */
export function ArticleGallery({ images, layout, caption }: ArticleGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  if (images.length === 0) return null

  return (
    <figure className="clear-both my-8" data-gallery-layout={layout}>
      {layout === 'carousel' ? (
        <CarouselLayout images={images} onOpen={setLightboxIndex} />
      ) : layout === 'grid' ? (
        <GridLayout images={images} onOpen={setLightboxIndex} />
      ) : (
        <MosaicLayout images={images} onOpen={setLightboxIndex} />
      )}

      <figcaption className="mt-3 flex items-start gap-2 text-xs text-gray-500">
        <Camera className="mt-px h-3.5 w-3.5 flex-shrink-0 text-secondary" aria-hidden="true" />
        <span>
          {caption ? <span className="italic text-gray-600">{caption}</span> : null}
          {caption ? <span className="text-gray-300"> · </span> : null}
          <span className="font-medium">{photoCount(images.length)}</span>
        </span>
      </figcaption>

      <Lightbox
        images={images}
        index={lightboxIndex}
        onIndexChange={setLightboxIndex}
        title={caption}
      />
    </figure>
  )
}

interface LayoutProps {
  images: GalleryImage[]
  onOpen: (index: number) => void
}

function Tile({
  image,
  index,
  onOpen,
  className,
  sizes,
  overlayCount,
}: {
  image: GalleryImage
  index: number
  onOpen: (index: number) => void
  className?: string
  sizes: string
  overlayCount?: number
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(index)}
      className={cn(
        'group relative block w-full overflow-hidden bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2',
        className,
      )}
      aria-label={
        overlayCount
          ? `Voir les ${overlayCount} photos supplémentaires`
          : `Agrandir la photo ${index + 1} : ${altFor(image, index)}`
      }
    >
      <Image
        src={image.src}
        alt={altFor(image, index)}
        fill
        sizes={sizes}
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
      />
      {overlayCount ? (
        <span className="absolute inset-0 flex items-center justify-center bg-primary/60 text-2xl font-bold text-white backdrop-blur-[1px] font-display">
          +{overlayCount}
        </span>
      ) : (
        <span className="pointer-events-none absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/45 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          <Expand className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      )}
    </button>
  )
}

function MosaicLayout({ images, onOpen }: LayoutProps) {
  const n = images.length
  const shown = images.slice(0, MOSAIC_MAX_TILES)
  const hidden = n - shown.length
  const wide = '(max-width: 768px) 100vw, 680px'
  const half = '(max-width: 768px) 50vw, 340px'
  const third = '(max-width: 768px) 33vw, 230px'

  if (n === 1) {
    return (
      <div className="overflow-hidden rounded-2xl">
        <Tile image={images[0]} index={0} onOpen={onOpen} className="aspect-[16/9]" sizes={wide} />
      </div>
    )
  }

  if (n === 2) {
    return (
      <div className="grid grid-cols-2 gap-1.5 overflow-hidden rounded-2xl sm:gap-2">
        {shown.map((img, i) => (
          <Tile key={img.src + i} image={img} index={i} onOpen={onOpen} className="aspect-[4/5]" sizes={half} />
        ))}
      </div>
    )
  }

  if (n === 3) {
    // Hero on the left, two stacked shots on the right.
    return (
      <div className="grid aspect-[3/2] grid-cols-3 grid-rows-2 gap-1.5 overflow-hidden rounded-2xl sm:gap-2">
        <Tile image={images[0]} index={0} onOpen={onOpen} className="col-span-2 row-span-2 h-full" sizes={wide} />
        <Tile image={images[1]} index={1} onOpen={onOpen} className="h-full" sizes={third} />
        <Tile image={images[2]} index={2} onOpen={onOpen} className="h-full" sizes={third} />
      </div>
    )
  }

  if (n === 4) {
    // Full-width hero, three supporting shots underneath.
    return (
      <div className="grid grid-cols-3 gap-1.5 overflow-hidden rounded-2xl sm:gap-2">
        <Tile image={images[0]} index={0} onOpen={onOpen} className="col-span-3 aspect-[16/9]" sizes={wide} />
        {images.slice(1).map((img, i) => (
          <Tile key={img.src + i} image={img} index={i + 1} onOpen={onOpen} className="aspect-[4/3]" sizes={third} />
        ))}
      </div>
    )
  }

  // 5+: two large shots on top, three below; the last tile carries "+N".
  return (
    <div className="grid grid-cols-6 gap-1.5 overflow-hidden rounded-2xl sm:gap-2">
      {shown.map((img, i) => (
        <Tile
          key={img.src + i}
          image={img}
          index={i}
          onOpen={onOpen}
          className={i < 2 ? 'col-span-3 aspect-[4/3]' : 'col-span-2 aspect-[4/3]'}
          sizes={i < 2 ? half : third}
          overlayCount={i === shown.length - 1 && hidden > 0 ? hidden : undefined}
        />
      ))}
    </div>
  )
}

function GridLayout({ images, onOpen }: LayoutProps) {
  return (
    <div
      className={cn(
        'grid gap-1.5 sm:gap-2',
        images.length === 2 || images.length === 4 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3',
      )}
    >
      {images.map((img, i) => (
        <Tile
          key={img.src + i}
          image={img}
          index={i}
          onOpen={onOpen}
          className="aspect-[4/3] rounded-lg"
          sizes="(max-width: 640px) 50vw, 230px"
        />
      ))}
    </div>
  )
}

function CarouselLayout({ images, onOpen }: LayoutProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  const onScroll = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const slides = Array.from(track.children) as HTMLElement[]
    const center = track.scrollLeft + track.clientWidth / 2
    let best = 0
    let bestDist = Infinity
    slides.forEach((slide, i) => {
      const dist = Math.abs(slide.offsetLeft + slide.offsetWidth / 2 - center)
      if (dist < bestDist) {
        bestDist = dist
        best = i
      }
    })
    setActive(best)
  }, [])

  const goTo = useCallback((index: number) => {
    const track = trackRef.current
    const slide = track?.children[index] as HTMLElement | undefined
    if (!track || !slide) return
    track.scrollTo({
      left: slide.offsetLeft - (track.clientWidth - slide.offsetWidth) / 2,
      behavior: 'smooth',
    })
  }, [])

  return (
    <div className="relative" role="region" aria-roledescription="carrousel" aria-label="Galerie photo">
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="scrollbar-hide flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1"
      >
        {images.map((img, i) => (
          <div
            key={img.src + i}
            className="w-[86%] flex-shrink-0 snap-center sm:w-[80%]"
            aria-roledescription="diapositive"
            aria-label={`${i + 1} sur ${images.length}`}
          >
            <Tile
              image={img}
              index={i}
              onOpen={onOpen}
              className="aspect-[3/2] rounded-xl"
              sizes="(max-width: 768px) 86vw, 560px"
            />
            {img.caption ? (
              <p className="mt-2 line-clamp-2 text-xs italic text-gray-500">{img.caption}</p>
            ) : null}
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(Math.max(0, active - 1))}
            disabled={active === 0}
            className="absolute left-2 top-[calc(50%-1.5rem)] hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-primary shadow-md transition hover:bg-white disabled:opacity-0 sm:flex"
            aria-label="Photo précédente"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => goTo(Math.min(images.length - 1, active + 1))}
            disabled={active === images.length - 1}
            className="absolute right-2 top-[calc(50%-1.5rem)] hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-primary shadow-md transition hover:bg-white disabled:opacity-0 sm:flex"
            aria-label="Photo suivante"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="mt-3 flex items-center justify-center gap-1.5" aria-hidden="true">
            {images.map((img, i) => (
              <span
                key={img.src + i}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i === active ? 'w-5 bg-secondary' : 'w-1.5 bg-gray-300',
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function Lightbox({
  images,
  index,
  onIndexChange,
  title,
}: {
  images: GalleryImage[]
  index: number | null
  onIndexChange: (index: number | null) => void
  title?: string
}) {
  const open = index !== null
  const current = index ?? 0
  const image = images[current]
  const pointerStart = useRef<number | null>(null)

  const prev = useCallback(
    () => onIndexChange((current - 1 + images.length) % images.length),
    [current, images.length, onIndexChange],
  )
  const next = useCallback(
    () => onIndexChange((current + 1) % images.length),
    [current, images.length, onIndexChange],
  )

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, prev, next])

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(o) => !o && onIndexChange(null)}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-black data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed inset-0 z-[100] flex flex-col text-white focus:outline-none"
          aria-describedby={undefined}
          onPointerDown={(e) => {
            pointerStart.current = e.clientX
          }}
          onPointerUp={(e) => {
            if (pointerStart.current === null || images.length < 2) return
            const dx = e.clientX - pointerStart.current
            pointerStart.current = null
            if (Math.abs(dx) > 50) {
              if (dx > 0) prev()
              else next()
            }
          }}
        >
          <DialogPrimitive.Title className="sr-only">{title || 'Galerie photo'}</DialogPrimitive.Title>

          <div className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="tabular-nums text-white/80" aria-live="polite">
              {current + 1} / {images.length}
            </span>
            <DialogPrimitive.Close
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Fermer la galerie"
            >
              <X className="h-5 w-5" />
            </DialogPrimitive.Close>
          </div>

          <div className="relative min-h-0 flex-1">
            {image && (
              <Image
                key={image.src}
                src={image.src}
                alt={altFor(image, current)}
                fill
                sizes="100vw"
                className="select-none object-contain"
                draggable={false}
                priority
              />
            )}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:left-4"
                  aria-label="Photo précédente"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-4"
                  aria-label="Photo suivante"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>

          <div className="mx-auto w-full max-w-3xl px-4 pb-5 pt-3 text-center">
            {image?.caption ? <p className="text-sm text-white/90">{image.caption}</p> : null}
            {title ? <p className="mt-1 text-xs text-white/50">{title}</p> : null}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
