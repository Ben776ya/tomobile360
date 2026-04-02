import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { CreditCard, Shield, Wrench, ClipboardCheck, ChevronRight, Car, Calculator, FileCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Services Auto au Maroc — Crédit, Assurance, Révision | Tomobile 360',
  description: 'Crédit auto, assurance, révision, contrôle technique : tous les services automobiles au Maroc réunis sur Tomobile 360.',
}

const services = [
  {
    icon: CreditCard,
    logoSrc: '/bank_of_africa.PNG',
    title: 'Bank of Africa',
    description: 'Financez votre véhicule avec Bank of Africa — simulation gratuite en ligne, réponse rapide.',
    href: '/services/credit',
    color: 'bg-[#EAF1FB]',
    features: ['Taux préférentiels', 'Simulation gratuite', 'Réponse en 24h'],
  },
  {
    icon: Shield,
    logoSrc: '/atlanta-sanad-logo.png',
    title: 'Atlanta Sanad',
    description: 'Obtenez votre devis d\'assurance auto avec notre partenaire Atlanta Sanad — leader de l\'assurance au Maroc.',
    href: '/services/assurance',
    color: 'bg-[#EEF3FF]',
    features: ['Tous risques', 'Tiers collision', 'Assistance 24/7'],
  },
  {
    icon: Wrench,
    title: 'Révision & Entretien',
    description: 'Entretenez votre véhicule chez nos partenaires agréés à des prix avantageux.',
    href: '/services/revision',
    color: 'bg-orange-500',
    features: ['Pièces d\'origine', 'Garantie constructeur', 'Devis gratuit'],
  },
  {
    icon: ClipboardCheck,
    title: 'Contrôle Technique',
    description: 'Passez votre contrôle technique en toute sérénité dans nos centres partenaires.',
    href: '/services/controle',
    color: 'bg-purple-500',
    features: ['Rendez-vous en ligne', 'Centres agréés', 'Contre-visite incluse'],
  },
]

const additionalServices = [
  {
    icon: Car,
    title: 'Reprise de véhicule',
    description: 'Faites reprendre votre ancien véhicule au meilleur prix.',
  },
  {
    icon: Calculator,
    title: 'Estimation gratuite',
    description: 'Estimez la valeur de votre véhicule en quelques clics.',
  },
  {
    icon: FileCheck,
    title: 'Démarches administratives',
    description: 'Nous vous accompagnons dans toutes vos démarches.',
  },
]

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-black/30 via-white to-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4">
            Simplifiez votre projet : Tous nos services réunis pour vous !
          </h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto">
            Du financement à la livraison — Tomobile 360 vous accompagne à chaque étape
          </p>
        </div>
      </section>

      {/* Main Services Grid */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {services.map((service) => (
              <Link
                key={service.href}
                href={service.href}
                className="group bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 md:p-8 shadow-card hover:shadow-elevated hover:border-secondary/20 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-start gap-3 sm:gap-4 md:gap-6">
                  <div className={`${service.color} p-4 rounded-xl flex-shrink-0 flex items-center justify-center`}>
                    {(service as any).logoSrc ? (
                      <Image
                        src={(service as any).logoSrc}
                        alt={service.title}
                        width={56}
                        height={56}
                        className="w-14 h-14 object-contain"
                      />
                    ) : (
                      <service.icon className="h-8 w-8 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-primary mb-2 group-hover:text-secondary transition-colors">
                      {service.title}
                    </h2>
                    <p className="text-gray-500 mb-4">
                      {service.description}
                    </p>
                    <ul className="space-y-2 mb-4">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                          <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <span className="inline-flex items-center gap-1 text-secondary font-semibold text-sm group-hover:gap-2 transition-all">
                      En savoir plus
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-primary text-center mb-12">
            Services Complémentaires
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {additionalServices.map((service, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-6 text-center shadow-card border border-gray-100"
              >
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <service.icon className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="font-bold text-primary mb-2">{service.title}</h3>
                <p className="text-sm text-gray-400">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">
              Besoin d&apos;aide ?
            </h2>
            <p className="text-gray-500 mb-6 max-w-xl mx-auto">
              Notre équipe est à votre disposition pour répondre à toutes vos questions
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-3 bg-secondary text-white hover:bg-secondary-400 font-semibold rounded-xl transition-all duration-300 shadow-gold hover:shadow-lg"
            >
              Contactez-nous
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
