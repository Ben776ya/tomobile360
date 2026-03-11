'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Check, ArrowLeft, Clock, BadgePercent, Handshake } from 'lucide-react'

const BOA_WEBSITE = 'https://www.bankofafrica.ma'

const creditProducts = [
  {
    name: 'Salariés & Fonctionnaires',
    description: 'Crédit auto exclusif pour les salariés du secteur public et privé, avec domiciliation de salaire.',
    features: [
      'Taux préférentiel négocié',
      'Durée jusqu\'à 84 mois',
      'Domiciliation de salaire',
      'Sans frais de dossier',
    ],
    featured: true,
    badge: 'Le plus populaire',
  },
  {
    name: 'Commerçants & Auto-entrepreneurs',
    description: 'Financement sur mesure pour les professionnels et indépendants avec étude personnalisée.',
    features: [
      'Étude personnalisée',
      'Durée jusqu\'à 72 mois',
      'Dossier simplifié',
      'Réponse rapide',
    ],
    featured: false,
    badge: null,
  },
  {
    name: 'Toutes Professions',
    description: 'Solution de financement auto accessible à tous les profils, neuf ou occasion.',
    features: [
      'Financement jusqu\'à 100%',
      'Durée de 12 à 84 mois',
      'Véhicule neuf ou occasion',
      'Accompagnement dédié',
    ],
    featured: false,
    badge: null,
  },
]

const benefits = [
  {
    icon: BadgePercent,
    title: 'Meilleurs taux',
    description: 'Taux négociés en exclusivité pour les clients Tomobile 360',
  },
  {
    icon: Clock,
    title: 'Réponse rapide',
    description: 'Réponse de principe en moins de 24h ouvrées',
  },
  {
    icon: Handshake,
    title: 'Partenaire officiel',
    description: 'Bank of Africa — Leader bancaire panafricain',
  },
]

export default function CreditAutoPage() {
  return (
    <div className="min-h-screen bg-background">

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#EAF1FB] via-white to-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-secondary mb-6 transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux services
          </Link>
          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-4">
              <Image
                src="/boa_small_logo.PNG"
                alt="Bank of Africa"
                width={56}
                height={56}
                className="w-14 h-14 object-contain"
              />
              <Image
                src="/bank_of_africa.PNG"
                alt="Bank of Africa"
                width={200}
                height={36}
                className="h-8 w-auto object-contain"
              />
            </div>
            <p className="text-lg md:text-xl text-gray-500 mt-2">
              Financez votre véhicule avec Bank of Africa — leader bancaire panafricain.
              Simulation gratuite et sans engagement directement en ligne.
            </p>
          </div>
        </div>
      </section>

      {/* Credit Products */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-primary text-center mb-12">
            Choisissez votre formule de crédit
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {creditProducts.map((product, idx) => (
              <div
                key={idx}
                className={`relative bg-white rounded-2xl border-2 p-6 shadow-card transition-all hover:shadow-elevated flex flex-col ${
                  product.featured ? 'border-secondary' : 'border-secondary/30'
                }`}
              >
                {product.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    {product.badge}
                  </div>
                )}

                <h3 className="text-lg font-bold text-primary mb-2">{product.name}</h3>
                <p className="text-sm text-gray-400 mb-6">{product.description}</p>

                <ul className="space-y-3 mb-6 flex-1">
                  {product.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-secondary flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={BOA_WEBSITE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 mt-auto text-center block ${
                    product.featured
                      ? 'bg-secondary hover:bg-secondary-600 text-white'
                      : 'bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/30'
                  }`}
                >
                  Demander un devis gratuit
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-primary text-center mb-12">
            Pourquoi choisir Bank of Africa ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 text-center shadow-card border border-blue-100">
                <div className="w-16 h-16 bg-[#EAF1FB] rounded-full flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="font-bold text-primary mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-400">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-secondary to-secondary-600 rounded-2xl p-8 md:p-12 text-center text-white shadow-lg">
            <div className="flex justify-center mb-6">
              <Image
                src="/boa_small_logo.PNG"
                alt="Bank of Africa"
                width={64}
                height={64}
                className="w-16 h-16 object-contain opacity-90"
              />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Simulez votre crédit en ligne
            </h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">
              Accédez directement au site Bank of Africa pour calculer vos mensualités
              et obtenir une réponse de principe en moins de 24h.
            </p>
            <a
              href={BOA_WEBSITE}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-secondary font-bold rounded-xl transition-all duration-300 hover:bg-blue-50 shadow-md"
            >
              Accéder au site Bank of Africa
            </a>
          </div>
        </div>
      </section>

    </div>
  )
}
