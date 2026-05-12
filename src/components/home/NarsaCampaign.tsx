'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, Check } from 'lucide-react'

export function NarsaCampaign() {
  return (
    <div className="h-full bg-[#EEF2F8] rounded-2xl border border-gray-200/70 p-5 md:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] lg:grid-cols-[150px_minmax(0,1fr)_auto] gap-5 md:gap-6 items-center h-full">
        {/* Column 1 — NARSA campaign poster */}
        <div className="relative w-[150px] sm:w-[140px] lg:w-[150px] aspect-[250/350] rounded-lg overflow-hidden ring-1 ring-[#4057aa]/10 shadow-md mx-auto sm:mx-0">
          <Image
            src="/narsa_annonce_visuelle.jpg"
            alt="Campagne NARSA — Roulez moins vite, c'est sauver plus de vies"
            fill
            sizes="150px"
            className="object-cover"
            priority={false}
          />
        </div>

        {/* Column 2 — Eyebrow + bullets */}
        <div className="flex flex-col items-start gap-3 min-w-0 text-left">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#DBE4F5] text-[#4057aa] text-[11px] font-bold uppercase tracking-wide">
            En partenariat avec la NARSA
          </span>
          <ul className="space-y-2.5 mt-4">
            <li className="flex items-start gap-2.5 text-sm md:text-[15px] text-gray-700">
              <span className="mt-0.5 w-[18px] h-[18px] rounded-full bg-[#4057aa] inline-flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-white" aria-hidden="true" strokeWidth={3} />
              </span>
              <span>Capsules de sensibilisation officielles</span>
            </li>
            <li className="flex items-start gap-2.5 text-sm md:text-[15px] text-gray-700">
              <span className="mt-0.5 w-[18px] h-[18px] rounded-full bg-[#4057aa] inline-flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-white" aria-hidden="true" strokeWidth={3} />
              </span>
              <span>Conseils pratiques pour conducteurs et piétons</span>
            </li>
            <li className="flex items-start gap-2.5 text-sm md:text-[15px] text-gray-700">
              <span className="mt-0.5 w-[18px] h-[18px] rounded-full bg-[#4057aa] inline-flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-white" aria-hidden="true" strokeWidth={3} />
              </span>
              <span>Code de la route et ressources NARSA</span>
            </li>
          </ul>
        </div>

        {/* Column 3 — Headline + logo + CTA */}
        <div className="flex flex-col items-center gap-4 lg:w-[200px]">
          <h3 className="text-2xl md:text-[26px] font-extrabold text-[#1c2541] leading-[1.1] text-center">
            Roulez en{' '}
            <span className="relative inline-block whitespace-nowrap">
              <span className="relative z-10">sécurité</span>
              <span
                className="absolute left-0 right-0 bottom-0.5 h-2 bg-[#fad502] -z-0 rounded-sm"
                aria-hidden="true"
              />
            </span>
          </h3>
          <Image
            src="/narsa_logo.png"
            alt="NARSA — Agence Nationale de la Sécurité Routière"
            width={200}
            height={60}
            className="h-9 md:h-10 w-auto object-contain"
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
