import Link from 'next/link'
import { ClipboardCheck, Check, ArrowLeft, MapPin, Calendar } from 'lucide-react'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'
import { BookingForm } from './BookingForm'
import { pageMetadata } from '@/lib/seo/page-metadata'

export const metadata = pageMetadata({
  title: 'Contrôle Technique Voiture au Maroc',
  description: "Service de contrôle technique en cours de déploiement avec un partenaire agréé. Réservez votre place pour être averti dès l'ouverture.",
  path: '/services/controle',
})

const checkpoints = [
  'Freinage',
  'Direction',
  'Visibilité',
  'Éclairage',
  'Liaison au sol',
  'Structure et carrosserie',
  'Équipements',
  'Organes mécaniques',
  'Pollution et niveau sonore',
]

export default function ControlePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 pt-6">
        <Breadcrumbs items={[
          { name: 'Services', href: '/services' },
          { name: 'Contrôle Technique' },
        ]} />
      </div>
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
                <ClipboardCheck className="h-8 w-8 text-secondary" />
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary">
                Contrôle Technique
              </h1>
            </div>
            <p className="text-lg md:text-xl text-gray-500">
              Passez votre contrôle technique en toute sérénité dans nos centres partenaires agréés.
            </p>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Info */}
            <div>
              <h2 className="text-2xl font-bold text-primary mb-6">
                Points de contrôle
              </h2>
              <p className="text-gray-500 mb-6">
                Le contrôle technique vérifie plus de 130 points répartis en 9 catégories principales :
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {checkpoints.map((point, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg border border-gray-100">
                    <Check className="h-4 w-4 text-purple-400 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{point}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-6 bg-white rounded-xl border border-gray-200">
                <h3 className="font-bold text-primary mb-4">Nos avantages</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm text-gray-700">
                    <Calendar className="h-5 w-5 text-purple-400" />
                    Réservation en ligne 24h/24 dès l&apos;ouverture
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-700">
                    <MapPin className="h-5 w-5 text-purple-400" />
                    Centres agréés sur tout le territoire marocain
                  </li>
                </ul>
              </div>
            </div>

            {/* Booking Form */}
            <BookingForm />
          </div>
        </div>
      </section>

      {/* Coming soon — replace with real partner data when contracted */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">
            Service en cours de déploiement
          </h2>
          <p className="text-gray-600">
            Nous finalisons les accords avec un réseau de centres de contrôle technique agréés au Maroc.
            Inscrivez-vous via le formulaire ci-dessus pour être averti dès l&apos;ouverture.
          </p>
        </div>
      </section>
    </div>
  )
}
