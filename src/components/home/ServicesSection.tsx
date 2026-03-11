'use client'

import Link from 'next/link'
import Image from 'next/image'
import { CreditCard, Shield, Car, Wrench, CalendarCheck, Truck, ChevronRight } from 'lucide-react'

const services = [
  {
    id: 'credit',
    icon: CreditCard,
    logoSrc: '/boa_small_logo.PNG',
    title: 'BANK OF AFRICA',
    description: 'Financez votre véhicule avec Bank of Africa — simulation gratuite en ligne.',
    link: '/services/credit',
    color: 'bg-[#EAF1FB]',
    glowColor: 'group-hover:shadow-[0_0_15px_rgba(0,110,254,0.2)]',
  },
  {
    id: 'assurance',
    icon: Shield,
    logoSrc: '/atlanta-sanad-logo.png',
    title: 'ATLANTA SANAD',
    description: 'Obtenez votre devis d\'assurance auto avec notre partenaire Atlanta Sanad.',
    link: '/services/assurance',
    color: 'bg-[#EEF3FF]',
    glowColor: 'group-hover:shadow-glow-cyan-sm',
  },
  {
    id: 'test-drive',
    icon: Car,
    title: 'Essai',
    description: 'Essayez avant de vous décider.',
    link: '/services/test-drive',
    color: 'bg-neon-purple',
    glowColor: 'group-hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]',
  },
  {
    id: 'revision',
    icon: Wrench,
    title: 'Révision',
    description: 'Garages partenaires agréés.',
    link: '/services/revision',
    color: 'bg-[#32B75C]',
    glowColor: 'group-hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]',
  },
  {
    id: 'controle',
    icon: CalendarCheck,
    title: 'Contrôle',
    description: 'Centres agréés, prise en ligne.',
    link: '/services/controle',
    color: 'bg-orange-500',
    glowColor: 'group-hover:shadow-[0_0_15px_rgba(245,158,11,0.3)]',
  },
  {
    id: 'livraison',
    icon: Truck,
    title: 'Livraison',
    description: 'Livraison partout au Maroc.',
    link: '/services/livraison',
    color: 'bg-secondary',
    glowColor: 'group-hover:shadow-glow-cyan-sm',
  },
]

export function ServicesSection() {
  return (
    <section className="py-4 md:py-6">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-card p-6 md:p-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-4">
            Du premier contact à la livraison — sans souci
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Trouvez des services correspondant à chaque étape de votre projet automobile
          </p>
          <div className="neon-line w-24 mx-auto mt-4" />
        </div>

        {/* Services Grid */}
        {(() => {
          const renderCard = (service: typeof services[number], compact = false) => (
            <Link
              key={service.id}
              href={service.link}
              className={`group bg-gray-50 rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 border border-gray-100 hover:border-secondary/20 flex overflow-hidden ${service.glowColor}`}
            >
              {/* Icon - Left side */}
              <div className={`${service.color} flex items-center justify-center ${compact ? 'px-4 md:px-5 min-w-[64px] md:min-w-[72px]' : 'px-6 md:px-8 min-w-[88px] md:min-w-[104px]'} group-hover:scale-105 transition-transform duration-300 origin-center`}>
                {(service as any).logoSrc ? (
                  <Image
                    src={(service as any).logoSrc}
                    alt={service.title}
                    width={48}
                    height={48}
                    className="w-10 h-10 md:w-12 md:h-12 object-contain"
                  />
                ) : (
                  <service.icon className={`${compact ? 'w-7 h-7 md:w-8 md:h-8' : 'w-9 h-9 md:w-11 md:h-11'} text-white`} />
                )}
              </div>
              {/* Content - Right side */}
              <div className={`${compact ? 'px-3 py-3 md:px-4' : 'p-4 md:p-5'} flex flex-col justify-center flex-1`}>
                <h3 className={`font-bold text-primary ${compact ? 'text-sm md:text-base' : 'text-base md:text-lg'} mb-1 group-hover:text-secondary transition-colors`}>
                  {service.title}
                </h3>
                <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                  {service.description}
                </p>
                <div className="flex items-center gap-1 text-xs font-semibold text-secondary group-hover:gap-2 transition-all">
                  <span>Voir les offres</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </Link>
          )
          return (
            <>
              {/* Row 1 — Partner services: 2 cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {services.slice(0, 2).map(s => renderCard(s, false))}
              </div>
              {/* Row 2 — Other services: 4 cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {services.slice(2).map(s => renderCard(s, true))}
              </div>
            </>
          )
        })()}
      </div>
      </div>
    </section>
  )
}
