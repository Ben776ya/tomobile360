import Link from 'next/link'
import { Check, ArrowLeft, Sparkles, ShieldCheck, Droplets, Sun } from 'lucide-react'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'
import { pageMetadata } from '@/lib/seo/page-metadata'

export const metadata = pageMetadata({
  title: 'Detailing Auto au Maroc — Nettoyage & Protection',
  description: "Detailing automobile au Maroc : nettoyage intérieur et extérieur, polissage, protection céramique — service en cours de déploiement sur Tomobile 360.",
  path: '/services/revision/detailing',
})

const detailingPackages = [
  {
    name: 'Nettoyage Express',
    description: 'Lavage extérieur soigné et aspiration intérieure pour retrouver une voiture propre rapidement.',
    features: [
      'Lavage carrosserie main',
      'Aspiration habitacle',
      'Nettoyage vitres',
      'Désodorisation',
    ],
    featured: false,
    badge: null,
  },
  {
    name: 'Detailing Complet',
    description: 'Rénovation profonde intérieur et extérieur — comme neuf, par des professionnels.',
    features: [
      'Décontamination peinture',
      'Polissage et lustrage',
      'Shampouinage sièges & moquettes',
      'Plastiques rénovés',
    ],
    featured: true,
    badge: 'Le plus demandé',
  },
  {
    name: 'Protection Céramique',
    description: 'Traitement longue durée : éclat préservé, lavages plus rapides, protection contre les rayures.',
    features: [
      'Couche céramique 2–5 ans',
      'Hydrophobie maximale',
      'Brillance miroir',
      'Protection UV',
    ],
    featured: false,
    badge: null,
  },
]

const benefits = [
  {
    icon: Sparkles,
    title: 'Finitions professionnelles',
    description: 'Techniciens formés aux dernières méthodes de detailing pour un rendu impeccable',
  },
  {
    icon: ShieldCheck,
    title: 'Produits premium',
    description: 'Cires, polish et traitements céramiques professionnels — sans abîmer la peinture',
  },
  {
    icon: Sun,
    title: 'Adapté au climat marocain',
    description: 'Protection renforcée contre le soleil, la poussière et le sable — pensée pour le Maroc',
  },
]

export default function DetailingPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 pt-6">
        <Breadcrumbs items={[
          { name: 'Services', href: '/services' },
          { name: 'Entretien rapide', href: '/services/revision' },
          { name: 'Detailing' },
        ]} />
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#F3E8FF] via-white to-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <Link
            href="/services/revision"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-secondary mb-6 transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l&apos;entretien rapide
          </Link>
          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-purple-600" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-primary">
                Detailing Auto
              </h1>
            </div>
            <p className="text-lg md:text-xl text-gray-500 mt-2">
              Nettoyage en profondeur, polissage, protection céramique — redonnez à votre véhicule
              son éclat d&apos;origine. Service en cours de déploiement au Maroc.
            </p>
          </div>
        </div>
      </section>

      {/* Detailing Packages */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-primary text-center mb-12">
            Nos formules detailing
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {detailingPackages.map((pkg, idx) => (
              <div
                key={idx}
                className={`relative bg-white rounded-2xl border-2 p-6 shadow-card transition-all hover:shadow-elevated flex flex-col ${
                  pkg.featured ? 'border-purple-500' : 'border-purple-200'
                }`}
              >
                {pkg.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    {pkg.badge}
                  </div>
                )}

                <h3 className="text-lg font-bold text-primary mb-2">{pkg.name}</h3>
                <p className="text-sm text-gray-400 mb-6">{pkg.description}</p>

                <ul className="space-y-3 mb-6 flex-1">
                  {pkg.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-purple-600 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/contact?subject=service&topic=detailing"
                  className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 mt-auto text-center block ${
                    pkg.featured
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200'
                  }`}
                >
                  Demander un devis
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-primary text-center mb-12">
            Pourquoi le detailing ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 text-center shadow-card border border-purple-100">
                <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="h-8 w-8 text-purple-600" />
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
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-8 md:p-12 text-center text-white shadow-lg">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center">
                <Droplets className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Réservez votre detailing
            </h2>
            <p className="text-white/85 mb-8 max-w-xl mx-auto">
              Contactez-nous pour un devis personnalisé — notre équipe vous accompagne dans
              votre projet de detailing.
            </p>
            <Link
              href="/contact?subject=service&topic=detailing"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-purple-700 font-bold rounded-xl transition-all duration-300 hover:bg-purple-50 shadow-md"
            >
              Demander un devis
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
