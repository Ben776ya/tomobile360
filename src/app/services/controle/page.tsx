import Link from 'next/link'
import { ClipboardCheck, Check, ChevronRight, ArrowLeft, MapPin, Calendar, Clock } from 'lucide-react'

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

const centers = [
  { city: 'Casablanca', centers: 12 },
  { city: 'Rabat', centers: 8 },
  { city: 'Marrakech', centers: 6 },
  { city: 'Tanger', centers: 5 },
  { city: 'Fès', centers: 4 },
  { city: 'Agadir', centers: 4 },
]

export default function ControlePage() {
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
                    Réservation en ligne 24h/24
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-700">
                    <Clock className="h-5 w-5 text-purple-400" />
                    Durée moyenne : 30 minutes
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-700">
                    <MapPin className="h-5 w-5 text-purple-400" />
                    Plus de 40 centres partenaires
                  </li>
                </ul>
              </div>
            </div>

            {/* Booking Form */}
            <div className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-xl rounded-2xl p-8 shadow-card">
              <h2 className="text-xl font-bold text-primary mb-6">
                Réserver un créneau
              </h2>
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville
                  </label>
                  <select className="w-full px-4 py-3 bg-white text-primary border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-transparent">
                    <option value="">Sélectionnez une ville</option>
                    {centers.map((c) => (
                      <option key={c.city} value={c.city}>
                        {c.city} ({c.centers} centres)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Immatriculation
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 12345-A-67"
                    className="w-full px-4 py-3 bg-white text-primary border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-transparent placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date souhaitée
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 bg-white text-primary border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    placeholder="+212 6XX-XXXXXX"
                    className="w-full px-4 py-3 bg-white text-primary border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-transparent placeholder-gray-400"
                  />
                </div>

                <div className="bg-gray-100 rounded-xl p-4 border border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Tarif contrôle technique</span>
                    <span className="text-xl font-bold text-primary">350 DH</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Contre-visite gratuite en cas de défaillance
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-secondary hover:bg-secondary-400 text-white font-semibold rounded-xl transition-colors shadow-gold"
                >
                  Réserver maintenant
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Centers */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-primary text-center mb-12">
            Nos centres partenaires
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {centers.map((center, idx) => (
              <div key={idx} className="bg-white rounded-xl p-4 text-center shadow-card border border-gray-100">
                <MapPin className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                <p className="font-semibold text-primary">{center.city}</p>
                <p className="text-sm text-gray-400">{center.centers} centres</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
