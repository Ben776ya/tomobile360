'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface ImageGalleryProps {
  images: string[]
  alt: string
}

export function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  // Use placeholder if no images
  const displayImages = images.length > 0 ? images : ['/placeholder-car.svg']

  const goToPrevious = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? displayImages.length - 1 : prev - 1
    )
  }

  const goToNext = () => {
    setCurrentIndex((prev) =>
      prev === displayImages.length - 1 ? 0 : prev + 1
    )
  }

  return (
    <>
      <div className="space-y-3">
        {/* Main Image — clickable to open lightbox */}
        <div
          className="relative aspect-[16/9] bg-gray-100 rounded-xl overflow-hidden cursor-zoom-in"
          onClick={() => setLightboxOpen(true)}
        >
          <Image
            src={displayImages[currentIndex]}
            alt={`${alt} - Image ${currentIndex + 1}`}
            fill
            className="object-cover"
            priority
          />

          {/* Navigation Arrows */}
          {displayImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goToPrevious() }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center transition-all duration-200 shadow-sm"
                aria-label="Image précédente"
              >
                <ChevronLeft className="h-5 w-5 text-gray-700" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goToNext() }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center transition-all duration-200 shadow-sm"
                aria-label="Image suivante"
              >
                <ChevronRight className="h-5 w-5 text-gray-700" />
              </button>
            </>
          )}

          {/* Image counter */}
          <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/60 text-white text-xs font-medium rounded-lg">
            {currentIndex + 1} / {displayImages.length}
          </div>
        </div>

        {/* Thumbnail Strip */}
        {displayImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {displayImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={cn(
                  'relative w-16 h-12 sm:w-20 sm:h-14 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-150',
                  idx === currentIndex
                    ? 'border-[#006EFE] ring-1 ring-[#006EFE]/30'
                    : 'border-transparent hover:border-gray-300 opacity-70 hover:opacity-100'
                )}
              >
                <Image src={img} alt={`${alt} - Miniature ${idx + 1}`} fill className="object-cover" sizes="80px" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-5xl w-[95vw] p-0 bg-black border-0">
          <div className="relative aspect-[16/9]">
            <Image
              src={displayImages[currentIndex]}
              alt={`${alt} - Image ${currentIndex + 1}`}
              fill
              className="object-contain"
            />
            {displayImages.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-all"
                  aria-label="Image précédente"
                >
                  <ChevronLeft className="h-6 w-6 text-white" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-all"
                  aria-label="Image suivante"
                >
                  <ChevronRight className="h-6 w-6 text-white" />
                </button>
              </>
            )}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/60 text-white text-sm font-medium rounded-lg">
              {currentIndex + 1} / {displayImages.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
