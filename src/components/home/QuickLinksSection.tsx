import Link from 'next/link'
import { GitCompareArrows, Tag, TrendingUp, Heart, ChevronRight } from 'lucide-react'

const links = [
  {
    id: 'comparateur',
    icon: GitCompareArrows,
    title: 'Comparateur',
    description: 'Comparez les modèles côte à côte',
    href: '/neuf/comparer',
    color: 'bg-[#006EFE]',
    glowColor: 'group-hover:shadow-[0_0_15px_rgba(0,110,254,0.2)]',
  },
  {
    id: 'offres-speciales',
    icon: Tag,
    title: 'Offres Spéciales',
    description: 'Promotions et remises exclusives',
    href: '/neuf?promo=true',
    color: 'bg-[#32B75C]',
    glowColor: 'group-hover:shadow-[0_0_15px_rgba(50,183,92,0.2)]',
  },
  {
    id: 'top-ventes',
    icon: TrendingUp,
    title: 'Top Ventes Maroc',
    description: 'Les modèles les plus populaires',
    href: '/neuf/populaires',
    color: 'bg-orange-500',
    glowColor: 'group-hover:shadow-[0_0_15px_rgba(249,115,22,0.2)]',
  },
  {
    id: 'coups-de-coeur',
    icon: Heart,
    title: 'Coups de Cœur par Catégorie',
    description: 'Nos sélections par type de véhicule',
    href: '/neuf?filter=category',
    color: 'bg-rose-500',
    glowColor: 'group-hover:shadow-[0_0_15px_rgba(244,63,94,0.2)]',
  },
]

export function QuickLinksSection() {
  return (
    <section className="py-4 md:py-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {links.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className={`group bg-gray-50 rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 border border-gray-100 hover:border-secondary/20 flex overflow-hidden ${link.glowColor}`}
            >
              {/* Icon - Left side */}
              <div className={`${link.color} flex items-center justify-center px-4 md:px-5 min-w-[64px] md:min-w-[72px] group-hover:scale-105 transition-transform duration-300 origin-center`}>
                <link.icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
              </div>
              {/* Content - Right side */}
              <div className="px-3 py-3 md:px-4 flex flex-col justify-center flex-1">
                <h3 className="font-bold text-primary text-sm md:text-base mb-1 group-hover:text-secondary transition-colors">
                  {link.title}
                </h3>
                <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                  {link.description}
                </p>
                <div className="flex items-center gap-1 text-xs font-semibold text-secondary group-hover:gap-2 transition-all">
                  <span>Découvrir</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
