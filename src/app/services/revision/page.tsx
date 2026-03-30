import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Check, ArrowLeft, Truck, ShieldCheck, Zap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Révision & Entretien Voiture au Maroc | Tomobile 360',
  description: 'Révisez et entretenez votre voiture dans nos centres partenaires agréés au Maroc. Prise de rendez-vous en ligne.',
}

const DABAPNEU_WEBSITE = 'https://www.dabapneu.ma'

const tireCategories = [
  {
    name: 'Pneus Été',
    description: 'Performances optimales sur route sèche et mouillée — idéaux pour le climat marocain.',
    features: [
      'Adhérence renforcée sur bitume chaud',
      'Faible résistance au roulement',
      'Économie de carburant',
      'Larges choix de dimensions',
    ],
    featured: true,
    badge: 'Le plus vendu',
  },
  {
    name: 'Pneus 4 Saisons',
    description: 'Polyvalence toute l\'année — route, pluie et terrain difficile sans changer de pneus.',
    features: [
      'Homologué toutes saisons',
      'Traction sur sol glissant',
      'Durée de vie allongée',
      'Idéal pour les régions montagneuses',
    ],
    featured: false,
    badge: null,
  },
  {
    name: 'Pneus SUV & 4x4',
    description: 'Conçus pour les véhicules hauts — robustesse sur route et hors-route.',
    features: [
      'Flancs renforcés anti-crevaison',
      'Excellente tenue en charge',
      'Profil adapté aux SUV',
      'Marques premium disponibles',
    ],
    featured: false,
    badge: null,
  },
]

const benefits = [
  {
    icon: Truck,
    title: 'Livraison à domicile',
    description: 'Vos pneus livrés chez vous ou directement chez le garagiste de votre choix',
  },
  {
    icon: Zap,
    title: 'Montage express',
    description: 'Réseau de garages partenaires pour un montage rapide et professionnel',
  },
  {
    icon: ShieldCheck,
    title: 'Partenaire officiel',
    description: 'DabaPneu — référence du pneu en ligne au Maroc depuis plusieurs années',
  },
]

export default function RevisionPage() {
  return (
    <div className="min-h-screen bg-background">

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#FDF6E3] via-white to-white py-16 md:py-24">
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
                src="/daba_pneu.png"
                alt="DabaPneu"
                width={160}
                height={56}
                className="h-14 w-auto object-contain"
              />
            </div>
            <p className="text-lg md:text-xl text-gray-500 mt-2">
              Trouvez et commandez vos pneus en ligne avec DabaPneu — livraison rapide partout
              au Maroc et montage chez nos garages partenaires.
            </p>
          </div>
        </div>
      </section>

      {/* Tire Categories */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-primary text-center mb-12">
            Choisissez vos pneus
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tireCategories.map((category, idx) => (
              <div
                key={idx}
                className={`relative bg-white rounded-2xl border-2 p-6 shadow-card transition-all hover:shadow-elevated flex flex-col ${
                  category.featured ? 'border-secondary' : 'border-secondary/30'
                }`}
              >
                {category.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    {category.badge}
                  </div>
                )}

                <h3 className="text-lg font-bold text-primary mb-2">{category.name}</h3>
                <p className="text-sm text-gray-400 mb-6">{category.description}</p>

                <ul className="space-y-3 mb-6 flex-1">
                  {category.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-secondary flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={DABAPNEU_WEBSITE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 mt-auto text-center block ${
                    category.featured
                      ? 'bg-secondary hover:bg-secondary-600 text-white'
                      : 'bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/30'
                  }`}
                >
                  Voir les pneus
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
            Pourquoi choisir DabaPneu ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 text-center shadow-card border border-amber-100">
                <div className="w-16 h-16 bg-[#FDF6E3] rounded-full flex items-center justify-center mx-auto mb-4">
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
                src="/daba_pneu.png"
                alt="DabaPneu"
                width={160}
                height={56}
                className="h-12 w-auto object-contain opacity-90"
              />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Commandez vos pneus en ligne
            </h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">
              Accédez directement au catalogue DabaPneu, comparez les prix et passez commande
              en quelques clics — livraison rapide partout au Maroc.
            </p>
            <a
              href={DABAPNEU_WEBSITE}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-secondary font-bold rounded-xl transition-all duration-300 hover:bg-blue-50 shadow-md"
            >
              Accéder au site DabaPneu
            </a>
          </div>
        </div>
      </section>

    </div>
  )
}
