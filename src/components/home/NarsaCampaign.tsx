'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'

export function NarsaCampaign() {
  return (
    <div className="relative h-full min-h-[240px] md:min-h-[260px] rounded-2xl overflow-hidden border border-gray-200/70 shadow-md">
      {/* Background road-scene image (panoramic, with built-in white panel on the right) */}
      <Image
        src="/narsa_banner_bg.jpeg"
        alt=""
        fill
        sizes="(min-width: 1024px) 66vw, 100vw"
        className="object-cover object-left"
        priority={false}
        aria-hidden="true"
      />

      {/* Mobile-only soft overlay so text + logo stay legible when the white panel is cropped */}
      <div
        className="absolute inset-0 bg-black/25 lg:hidden"
        aria-hidden="true"
      />

      {/* Content layer */}
      <div className="relative h-full w-full grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_220px] items-center">
        {/* Title overlay — centered over the photo area */}
        <div className="px-6 py-6 lg:py-0 lg:pl-8 flex items-center justify-center lg:justify-start">
          <h3 className="text-xl sm:text-2xl md:text-[26px] font-extrabold leading-[1.15] text-white text-center lg:text-left max-w-[18ch] [text-shadow:0_2px_8px_rgba(0,0,0,0.45)]">
            Roulez en toute sécurité avec NARSA
          </h3>
        </div>

        {/* Right column — logo + CTA, sized to sit on top of the image's built-in white panel */}
        <div className="px-6 pb-6 lg:py-0 lg:pr-6 flex flex-col items-center justify-center gap-4">
          <Image
            src="/narsa_logo.png"
            alt="NARSA — Agence Nationale de la Sécurité Routière"
            width={200}
            height={60}
            className="h-10 md:h-12 w-auto object-contain opacity-70"
            priority={false}
          />
          <Link
            href="/services/securite-routiere"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#4057aa] hover:bg-[#2e3f7a] text-white font-semibold rounded-full transition-all duration-300 shadow-md hover:shadow-lg text-sm"
          >
            Découvrir NARSA
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  )
}
