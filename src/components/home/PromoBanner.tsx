'use client'

import Link from 'next/link'
import { ChevronRight, Check } from 'lucide-react'

export function PromoBanner() {
  return (
    <section className="py-2 md:py-3 bg-[#F2F4F6]">
      <div className="container mx-auto px-4">
        <div className="relative">
          <div className="flex flex-col lg:flex-row items-center relative z-10">
            {/* Left - Illustration/Image */}
            <div className="lg:w-1/3 p-3 lg:p-4 flex justify-center">
              <div className="relative w-32 h-32 md:w-44 md:h-44">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/20 rounded-full animate-glow-pulse" />
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-0.5">Offre exceptionnelle</p>
                    <div className="relative">
                      <span className="text-4xl md:text-5xl font-black text-secondary glow-cyan-text">2.9</span>
                      <span className="text-lg md:text-xl font-bold text-secondary align-top">%</span>
                    </div>
                    <p className="text-xs font-semibold text-gray-700">sur votre PRÊT AUTO</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Center - Content */}
            <div className="lg:w-1/3 p-6 lg:p-8 text-center lg:text-left">
              <h3 className="text-xl md:text-2xl font-bold text-primary mb-3">
                Financez votre véhicule au meilleur taux
              </h3>
              <p className="text-gray-500 mb-4">
                Profitez de notre offre exclusive de crédit auto avec un taux préférentiel.
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-secondary flex-shrink-0" />
                  <span>Réponse immédiate</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-secondary flex-shrink-0" />
                  <span>Durée flexible jusqu&apos;à 72 mois</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-secondary flex-shrink-0" />
                  <span>Sans frais de dossier</span>
                </li>
              </ul>
            </div>

            {/* Right - CTA */}
            <div className="lg:w-1/3 p-6 lg:p-8 flex flex-col items-center lg:items-end gap-4">
              <div className="text-center lg:text-right">
                <span className="tag inline-block bg-[#32B75C] text-white text-xs font-bold tracking-wider px-3 py-1 rounded-full mb-2">OFFRE LIMITÉE</span>
                <p className="text-lg font-bold text-primary">Profitez-en maintenant</p>
              </div>
              <Link
                href="/services/credit"
                className="inline-flex items-center gap-2 px-8 py-3 bg-secondary hover:bg-secondary-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-gold hover:shadow-gold-lg"
              >
                J&apos;en profite
                <ChevronRight className="w-5 h-5" />
              </Link>
              <p className="text-xs text-gray-400 text-center lg:text-right">
                *Sous réserve d&apos;acceptation du dossier
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
