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
            {/* Left — NARSA campaign poster */}
            <div className="lg:w-5/12 bg-gradient-to-br from-[#E8EBF5] to-white p-5 md:p-8 flex items-center justify-center">
              <div className="relative w-full max-w-[260px] md:max-w-[300px] aspect-[250/370] rounded-xl overflow-hidden shadow-md ring-1 ring-[#4057aa]/10">
                <Image
                  src="/narsa_annonce_visuelle.jpg"
                  alt="Campagne NARSA — Roulez moins vite, c'est sauver plus de vies"
                  fill
                  sizes="(min-width: 1024px) 300px, (min-width: 768px) 260px, 80vw"
                  className="object-cover"
                  priority={false}
                />
              </div>
            </div>

            {/* Right — Content */}
            <div className="lg:w-7/12 p-6 md:p-8 lg:p-10 flex flex-col justify-center">
              <span className="inline-flex items-center self-start gap-2 px-3 py-1 rounded-full bg-[#E8EBF5] text-[#4057aa] text-xs font-semibold uppercase tracking-wide mb-4">
                En partenariat avec la NARSA
              </span>

              <h3 className="text-2xl md:text-3xl font-bold text-primary leading-tight">
                Roulez en sécurité
              </h3>
              <span className="block w-16 h-1 bg-[#fad502] rounded-full mt-3 mb-5" aria-hidden="true" />

              <div className="mb-5">
                <Image
                  src="/narsa_logo.png"
                  alt="NARSA — Agence Nationale de la Sécurité Routière"
                  width={200}
                  height={60}
                  className="h-10 md:h-12 w-auto object-contain"
                  priority={false}
                />
              </div>

              <p className="text-gray-500 mb-5 max-w-xl">
                Conseils, capsules vidéo et bonnes pratiques de l&apos;Agence Nationale de la Sécurité Routière
                pour une route plus sûre au Maroc.
              </p>

              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-[#4057aa] flex-shrink-0" aria-hidden="true" />
                  <span>Capsules de sensibilisation officielles</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-[#4057aa] flex-shrink-0" aria-hidden="true" />
                  <span>Conseils pratiques pour conducteurs et piétons</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-[#4057aa] flex-shrink-0" aria-hidden="true" />
                  <span>Code de la route et ressources NARSA</span>
                </li>
              </ul>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <Link
                  href="/services/securite-routiere"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-[#4057aa] hover:bg-[#2e3f7a] text-white font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Découvrir NARSA
                  <ChevronRight className="w-5 h-5" aria-hidden="true" />
                </Link>
                <p className="text-xs text-gray-400">
                  Source : Agence Nationale de la Sécurité Routière
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
