import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'

export function NarsaCampaign() {
  return (
    <div className="relative h-full min-h-[240px] md:min-h-[260px] rounded-2xl overflow-hidden border border-gray-200/70 shadow-md bg-white">
      <Image
        src="/narsa_banner_bg.jpeg"
        alt=""
        fill
        sizes="(min-width: 1024px) 66vw, 100vw"
        className="object-cover object-left opacity-80"
        priority={false}
        aria-hidden="true"
      />

      <div
        className="absolute inset-0 bg-black/20 lg:hidden"
        aria-hidden="true"
      />

      <div className="relative h-full w-full grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] items-stretch">
        <div className="px-6 lg:pl-56 pt-6 md:pt-7 pb-2 flex items-start justify-center">
          <h3 className="text-xl sm:text-2xl md:text-[26px] font-extrabold leading-[1.2] text-white text-center max-w-[22ch] [text-shadow:0_2px_14px_rgba(0,0,0,0.75),0_1px_3px_rgba(0,0,0,0.45)]">
            Roulez en toute sécurité
            <br />
            avec NARSA
          </h3>
        </div>

        <div className="px-4 pb-6 lg:py-4 lg:pr-4 flex flex-col items-center lg:items-end justify-center gap-4">
          <Image
            src="/narsa_logo.png"
            alt="NARSA — Agence Nationale de la Sécurité Routière"
            width={320}
            height={96}
            className="h-16 md:h-20 w-auto object-contain"
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
