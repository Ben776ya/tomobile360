'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, Check } from 'lucide-react'

export function PromoBanner() {
  return (
    <section className="py-4 md:py-6 bg-[#565A5D]/10">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-card">
          <div className="flex flex-col lg:flex-row items-stretch">
            {/* Left — NARSA campaign poster (compact) */}
            <div className="lg:w-4/12 bg-gradient-to-br from-[#E8EBF5] to-white p-3 md:p-4 flex items-center justify-center">
              <div className="relative w-full max-w-[150px] aspect-[250/370] rounded-lg overflow-hidden shadow-md ring-1 ring-[#4057aa]/10">
                <Image
                  src="/narsa_annonce_visuelle.jpg"
                  alt="Campagne NARSA — Roulez moins vite, c'est sauver plus de vies"
                  fill
                  sizes="(min-width: 1024px) 150px, 140px"
                  className="object-cover"
                  priority={false}
                />
              </div>
            </div>

            {/* Middle — Eyebrow tag + SEO bullet list */}
            <div className="lg:w-4/12 p-5 md:p-6 flex flex-col justify-center">
              <span className="inline-flex items-center self-start gap-2 px-3 py-0.5 rounded-full bg-[#E8EBF5] text-[#4057aa] text-[11px] font-semibold uppercase tracking-wide mb-6">
                En partenariat avec la NARSA
              </span>
              <ul className="space-y-2.5">
                <li className="flex items-start gap-2.5 text-sm md:text-[15px] text-gray-700">
                  <Check className="w-4 h-4 mt-0.5 text-[#4057aa] flex-shrink-0" aria-hidden="true" />
                  <span>Capsules de sensibilisation officielles</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm md:text-[15px] text-gray-700">
                  <Check className="w-4 h-4 mt-0.5 text-[#4057aa] flex-shrink-0" aria-hidden="true" />
                  <span>Conseils pratiques pour conducteurs et piétons</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm md:text-[15px] text-gray-700">
                  <Check className="w-4 h-4 mt-0.5 text-[#4057aa] flex-shrink-0" aria-hidden="true" />
                  <span>Code de la route et ressources NARSA</span>
                </li>
              </ul>
            </div>

            {/* Right — Vertically-centered CTA stack, pinned to far right */}
            <div className="lg:w-4/12 p-5 md:p-6 flex flex-col items-center justify-center text-center lg:border-l border-gray-100">
              <h3 className="text-xl md:text-2xl font-bold text-primary leading-tight">
                Roulez en sécurité
              </h3>
              <span className="block w-12 h-1 bg-[#fad502] rounded-full mt-2 mb-3" aria-hidden="true" />

              <div className="mb-4">
                <Image
                  src="/narsa_logo.png"
                  alt="NARSA — Agence Nationale de la Sécurité Routière"
                  width={200}
                  height={60}
                  className="h-11 md:h-12 w-auto object-contain"
                  priority={false}
                />
              </div>

              <Link
                href="/services/securite-routiere"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#4057aa] hover:bg-[#2e3f7a] text-white font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg text-sm"
              >
                Découvrir NARSA
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
