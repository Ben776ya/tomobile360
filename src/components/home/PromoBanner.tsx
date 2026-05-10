'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'

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

            {/* Middle — SEO descriptive text */}
            <div className="lg:w-4/12 p-5 md:p-6 flex flex-col justify-center">
              <p className="text-sm md:text-[15px] text-gray-600 leading-relaxed">
                L&apos;<strong className="font-semibold text-[#4057aa]">Agence Nationale de la Sécurité Routière (NARSA)</strong> mène au Maroc des campagnes de sensibilisation, des capsules vidéo pédagogiques et des conseils pratiques pour conducteurs et piétons. Une démarche essentielle pour faire du <strong className="font-semibold text-[#4057aa]">code de la route</strong> un réflexe partagé.
              </p>
            </div>

            {/* Right — CTA stack pinned to far right */}
            <div className="lg:w-4/12 p-5 md:p-6 flex flex-col justify-center lg:border-l border-gray-100">
              <span className="inline-flex items-center self-start gap-2 px-3 py-0.5 rounded-full bg-[#E8EBF5] text-[#4057aa] text-[11px] font-semibold uppercase tracking-wide mb-2">
                En partenariat avec la NARSA
              </span>

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
                  className="h-8 md:h-9 w-auto object-contain"
                  priority={false}
                />
              </div>

              <Link
                href="/services/securite-routiere"
                className="inline-flex items-center self-start gap-2 px-6 py-2.5 bg-[#4057aa] hover:bg-[#2e3f7a] text-white font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg text-sm"
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
