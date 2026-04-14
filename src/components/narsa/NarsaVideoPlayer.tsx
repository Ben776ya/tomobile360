'use client'

import { useState, useRef, useEffect } from 'react'
import { Play } from 'lucide-react'

type NarsaVideoPlayerProps = {
  src: string
  title: string
}

export function NarsaVideoPlayer({ src, title }: NarsaVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasError, setHasError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  function handlePlay() {
    setHasError(false)
    setIsPlaying(true)
  }

  useEffect(() => {
    const video = videoRef.current
    if (isPlaying && video) {
      video.src = src
      video.play().catch(() => {})
    }
  }, [isPlaying, src])

  return (
    <div className="relative aspect-video bg-gradient-to-br from-[#2e3f7a] to-[#4057aa] rounded-t-xl overflow-hidden">
      <video
        ref={videoRef}
        controls={isPlaying}
        preload="none"
        crossOrigin="anonymous"
        className="w-full h-full object-cover"
        onEnded={() => setIsPlaying(false)}
        onError={() => {
          setIsPlaying(false)
          setHasError(true)
        }}
        aria-label={title}
      >
        Votre navigateur ne supporte pas la lecture vidéo.
      </video>
      {!isPlaying && (
        <button
          onClick={handlePlay}
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 cursor-pointer group"
          aria-label={`Lire la vidéo : ${title}`}
        >
          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:bg-white group-hover:scale-110 transition-all duration-300">
            <Play className="h-7 w-7 text-[#4057aa] ml-1" fill="#4057aa" />
          </div>
          <span className="text-white/80 text-sm font-medium">
            {hasError ? 'Erreur — Cliquez pour réessayer' : 'Cliquez pour lire'}
          </span>
        </button>
      )}
    </div>
  )
}
