import Link from 'next/link'
import { Wrench, Check, ChevronRight, ArrowLeft, Settings, Droplets, Wind } from 'lucide-react'

const services = [
  {
    icon: Settings,
    title: 'Vidange & Filtres',
    description: 'Changement d\'huile moteur et remplacement des filtres',
    price: 'À partir de 350 DH',
  },
  {
    icon: Droplets,
    title: 'Freinage',
    description: 'Vérification et remplacement des plaquettes et disques',
    price: 'À partir de 500 DH',
  },
  {
    icon: Wind,
    title: 'Climatisation',
    description: 'Recharge et nettoyage du système de climatisation',
    price: 'À partir de 400 DH',
  },
]

const maintenancePackages = [
  {
    name: 'Révision Standard',
    description: 'Entretien de base pour votre véhicule',
    features: [
      'Vidange huile moteur',
      'Filtre à huile',
      'Contrôle des niveaux',
      'Contrôle visuel',
    ],
    price: '450',
  },
  {
    name: 'Révision Complète',
    description: 'Entretien approfondi recommandé',
    features: [
      'Vidange huile moteur',
      'Tous les filtres (huile, air, habitacle)',
      'Contrôle des freins',
      'Contrôle de la batterie',
      'Diagnostic électronique',
    ],
    price: '850',
    popular: true,
  },
  {
    name: 'Révision Premium',
    description: 'Le meilleur pour votre véhicule',
    features: [
      'Révision complète',
      'Liquide de frein',
      'Liquide de refroidissement',
      'Nettoyage injecteurs',
      'Contrôle géométrie',
    ],
    price: '1200',
  },
]

export default function RevisionPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-black/30 via-white to-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <Link href="/services" className="inline-flex items-center gap-2 text-gray-400 hover:text-secondary mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Retour aux services
          </Link>
          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-gray-100 p-3 rounded-xl">
                <Wrench className="h-8 w-8 text-secondary" />
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary">
                Révision & Entretien
              </h1>
            </div>
            <p className="text-lg md:text-xl text-gray-500">
              Entretenez votre véhicule chez nos partenaires agréés avec des pièces d&apos;origine.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Services */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-primary text-center mb-12">
            Services rapides
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map((service, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-gray-100 p-6 shadow-card hover:shadow-elevated hover:border-secondary/20 transition-all">
                <div className="w-14 h-14 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4">
                  <service.icon className="h-7 w-7 text-orange-400" />
                </div>
                <h3 className="font-bold text-primary mb-2">{service.title}</h3>
                <p className="text-sm text-gray-400 mb-4">{service.description}</p>
                <p className="text-secondary font-semibold">{service.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-primary text-center mb-4">
            Forfaits révision
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Choisissez le forfait adapté à vos besoins
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {maintenancePackages.map((pkg, idx) => (
              <div
                key={idx}
                className={`relative bg-white rounded-2xl border-2 p-6 shadow-card ${
                  pkg.popular ? 'border-orange-500' : 'border-gray-200'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-primary text-xs font-bold px-3 py-1 rounded-full">
                    Populaire
                  </div>
                )}
                <h3 className="text-xl font-bold text-primary mb-2">{pkg.name}</h3>
                <p className="text-sm text-gray-400 mb-4">{pkg.description}</p>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-primary">{pkg.price}</span>
                  <span className="text-gray-400"> DH</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {pkg.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-orange-400 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-xl font-semibold transition-colors ${
                  pkg.popular
                    ? 'bg-orange-500 hover:bg-orange-600 text-primary'
                    : 'bg-white hover:bg-white text-primary'
                }`}>
                  Réserver
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-xl rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">
              Prenez rendez-vous en ligne
            </h2>
            <p className="text-gray-500 mb-6 max-w-xl mx-auto">
              Réservez votre créneau et bénéficiez d&apos;un service rapide et professionnel.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-3 bg-secondary hover:bg-secondary-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-gold hover:shadow-lg"
            >
              Prendre rendez-vous
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
