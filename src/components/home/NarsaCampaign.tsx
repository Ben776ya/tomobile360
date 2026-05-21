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
        className="object-cover object-center"
        priority={false}
        aria-hidden="true"
      />

      <div
        className="hidden lg:block absolute inset-y-0 right-0 w-[280px] bg-gradient-to-l from-white via-white/95 to-white/0"
        aria-hidden="true"
      />

      <div
        className="absolute inset-0 bg-black/25 lg:hidden"
        aria-hidden="true"
      />

      <div className="relative h-full w-full grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] items-stretch">
        <div className="px-6 lg:pl-12 pt-6 md:pt-7 pb-2 flex items-start justify-center">
          <h3 className="text-xl sm:text-2xl md:text-[26px] font-extrabold leading-[1.2] text-white text-center [text-shadow:0_2px_14px_rgba(0,0,0,0.75),0_1px_3px_rgba(0,0,0,0.45)]">
            Roulez en toute sécurité
            <br />
            avec NARSA
          </h3>
        </div>

        <div className="px-4 pb-6 lg:py-4 lg:pr-4 flex flex-col items-center justify-center gap-4">
          <Image
            src="/narsa_logo.png"
            alt="NARSA — Agence Nationale de la Sécurité Routière"
            width={320}
            height={96}
            className="h-20 md:h-24 w-auto object-contain -mt-2 md:-mt-3"
            priority={false}
          />
          <Link
            href="/services/securite-routiere"
            className="
              inline-flex items-center gap-2
              px-4 py-2.5
              -translate-x-2 md:-translate-x-3
              rounded-full bg-[#4057aa] hover:bg-[#2e3f7a]
              text-white font-bold text-[13px]
              shadow-[0_6px_16px_rgba(0,0,0,0.10)]
              hover:shadow-[0_10px_22px_rgba(0,0,0,0.14)]
              hover:-translate-y-px active:translate-y-0
              transition-all duration-200
            "
          >
            <span>Découvrir NARSA</span>
            <ChevronRight className="w-4 h-4" strokeWidth={2.2} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  )
}
