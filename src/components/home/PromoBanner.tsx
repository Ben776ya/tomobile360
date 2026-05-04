'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, Check } from 'lucide-react'

export function PromoBanner() {
  return (
    <section className="py-2 md:py-3 bg-[#F2F4F6]">
      <div className="container mx-auto px-4">
        <div className="relative">
          <div className="flex flex-col lg:flex-row items-center relative z-10">
            {/* Left - NARSA logo emblem */}
            <div className="lg:w-1/3 p-3 lg:p-4 flex justify-center">
              <div className="relative w-44 h-44 md:w-56 md:h-56">
                <div className="absolute inset-0 bg-gradient-to-br from-[#4057aa]/20 to-[#E8EBF5] rounded-full animate-glow-pulse" />
                <div className="absolute inset-1.5 md:inset-2 bg-white rounded-full shadow-card flex items-center justify-center p-4 md:p-5">
                  <Image
                    src="/narsa_logo.png"
                    alt="NARSA — Agence Nationale de la Sécurité Routière"
                    width={200}
                    height={60}
                    className="w-full h-auto object-contain"
                    priority={false}
                  />
                </div>
              </div>
            </div>

            {/* Center - Content */}
            <div className="lg:w-1/3 p-6 lg:p-8 text-center lg:text-left">
              <h3 className="text-xl md:text-2xl font-bold text-primary mb-3">
                Sécurité Routière — en partenariat avec la NARSA
              </h3>
              <p className="text-gray-500 mb-4">
                Conseils, capsules vidéo et bonnes pratiques de l&apos;Agence Nationale de la Sécurité Routière pour une route plus sûre au Maroc.
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-[#4057aa] flex-shrink-0" />
                  <span>Capsules de sensibilisation officielles</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-[#4057aa] flex-shrink-0" />
                  <span>Conseils pratiques pour conducteurs et piétons</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-[#4057aa] flex-shrink-0" />
                  <span>Code de la route et ressources NARSA</span>
                </li>
              </ul>
            </div>

            {/* Right - CTA */}
            <div className="lg:w-1/3 p-6 lg:p-8 flex flex-col items-center lg:items-end gap-4">
              <div className="text-center lg:text-right">
                <span className="tag inline-block bg-[#4057aa] text-white text-xs font-bold tracking-wider px-3 py-1 rounded-full mb-2">
                  PARTENAIRE NARSA
                </span>
                <p className="text-lg font-bold text-primary">Roulez en sécurité</p>
              </div>
              <Link
                href="/services/securite-routiere"
                className="inline-flex items-center gap-2 px-8 py-3 bg-[#4057aa] hover:bg-[#2e3f7a] text-white font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Découvrir NARSA
                <ChevronRight className="w-5 h-5" />
              </Link>
              <p className="text-xs text-gray-400 text-center lg:text-right">
                Source : Agence Nationale de la Sécurité Routière
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
