import Image from 'next/image'
import Link from 'next/link'
import { Wrench, Sparkles, ChevronRight } from 'lucide-react'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'
import { pageMetadata } from '@/lib/seo/page-metadata'

export const metadata = pageMetadata({
  title: 'Entretien Rapide Auto au Maroc — Pneus, Detailing & Plus',
  description: 'Entretien rapide pour votre voiture au Maroc : pneus DabaPneu, detailing professionnel et plus. Choisissez le service qui vous convient sur Tomobile 360.',
  path: '/services/revision',
})

type SubService = {
  title: string
  description: string
  href: string
  bullets: string[]
  cta: string
} & (
  | { kind: 'logo'; logoSrc: string; logoAlt: string; accent: string; cardAccent: string }
  | { kind: 'icon'; Icon: React.ComponentType<{ className?: string }>; accent: string; cardAccent: string }
)

const subServices: SubService[] = [
  {
    kind: 'logo',
    title: 'DabaPneu',
    description: 'Pneus toutes marques, livraison partout au Maroc et montage chez nos garages partenaires.',
    href: '/services/revision/dabapneu',
    bullets: ['Pneus toutes saisons', 'Montage inclus', 'Livraison rapide'],
    cta: 'Découvrir DabaPneu',
    logoSrc: '/daba_pneu.png',
    logoAlt: 'DabaPneu',
    accent: 'bg-[#FDF6E3]',
    cardAccent: 'hover:border-secondary/40',
  },
  {
    kind: 'icon',
    title: 'Detailing',
    description: 'Nettoyage en profondeur, polissage et protection céramique pour redonner éclat à votre véhicule.',
    href: '/services/revision/detailing',
    bullets: ['Nettoyage express', 'Detailing complet', 'Protection céramique'],
    cta: 'Découvrir le detailing',
    Icon: Sparkles,
    accent: 'bg-[#F3E8FF]',
    cardAccent: 'hover:border-purple-400/50',
  },
]

export default function EntretienRapidePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 pt-6">
        <Breadcrumbs items={[
          { name: 'Services', href: '/services' },
          { name: 'Entretien rapide' },
        ]} />
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-black/5 via-white to-white pt-6 md:pt-8 pb-8 md:pb-12">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary/10 mb-6">
            <Wrench className="h-8 w-8 text-secondary" />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4">
            Entretien rapide
          </h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto">
            Pneus, detailing et bientôt plus — gardez votre véhicule en parfait état grâce
            à nos services d&apos;entretien rapide au Maroc.
          </p>
        </div>
      </section>

      {/* Sub-services Grid */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-primary text-center mb-12">
            Nos partenaires
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {subServices.map((service) => (
              <Link
                key={service.href}
                href={service.href}
                className={`group bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-card hover:shadow-elevated hover:-translate-y-1 transition-all duration-300 ${service.cardAccent}`}
              >
                <div className="flex items-start gap-4 md:gap-6">
                  <div className={`${service.accent} p-4 rounded-xl flex-shrink-0 flex items-center justify-center w-20 h-20`}>
                    {service.kind === 'logo' ? (
                      <Image
                        src={service.logoSrc}
                        alt={service.logoAlt}
                        width={56}
                        height={56}
                        className="w-14 h-14 object-contain"
                        sizes="56px"
                      />
                    ) : (
                      <service.Icon className="h-8 w-8 text-purple-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-primary mb-2 group-hover:text-secondary transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {service.description}
                    </p>
                    <ul className="space-y-2 mb-4">
                      {service.bullets.map((b, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                          <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
                          {b}
                        </li>
                      ))}
                    </ul>
                    <span className="inline-flex items-center gap-1 text-secondary font-semibold text-sm group-hover:gap-2 transition-all">
                      {service.cta}
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Coming soon hint */}
          <p className="text-center text-sm text-gray-400 mt-10">
            D&apos;autres services d&apos;entretien rapide arrivent bientôt.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 md:p-12 text-center shadow-card">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">
              Une question sur l&apos;entretien de votre véhicule ?
            </h2>
            <p className="text-gray-500 mb-6 max-w-xl mx-auto">
              Notre équipe vous oriente vers le service ou le partenaire le mieux adapté
              à vos besoins.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-3 bg-secondary text-white hover:bg-secondary-400 font-semibold rounded-xl transition-all duration-300 hover:shadow-lg"
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
