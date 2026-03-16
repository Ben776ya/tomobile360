import Link from 'next/link'
import Image from 'next/image'
import { Car, Calculator, Search, Gauge, Calendar, Fuel, ChevronRight, Zap, GitFork, ExternalLink } from 'lucide-react'
import { getMoccazListings, type MoccazListing } from '@/lib/scrapers/moccaz'

const serviceButtons = [
  { href: '/occasion', label: 'Parcourir les annonces', icon: Search },
  { href: '/occasion/vendre', label: 'Vendre ma voiture', icon: Car },
  { href: '/occasion/estimation', label: 'Estimation gratuite', icon: Calculator },
]

function MOccazCard({ listing }: { listing: MoccazListing }) {
  return (
    <a
      href={listing.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group bg-white rounded-xl overflow-hidden border border-gray-200 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
    >
      {/* Image — plain <img> to avoid next/image hostname restrictions on scraped CDN URLs */}
      <div className="relative flex-shrink-0 bg-white overflow-hidden">
        {listing.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.image}
            alt={listing.title}
            className="w-full h-auto block"
          />
        ) : (
          <div className="h-[190px] flex items-center justify-center bg-gray-100">
            <Car className="w-12 h-12 text-gray-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent pointer-events-none" />
        {/* M-CHECK badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 pl-0 pr-2 py-0.5 rounded-full shadow-lg" style={{ backgroundColor: '#290054' }}>
          <Image
            src="/le_m_check.PNG"
            alt="M-Check"
            width={18}
            height={18}
            className="object-contain"
          />
          <span className="text-white text-[10px] font-bold tracking-wide">M-CHECK</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Price */}
        <div className="mb-2">
          <span className="text-xl font-bold text-primary leading-none">
            {listing.price}
          </span>
        </div>

        {/* Title + subtitle */}
        <h3 className="font-bold text-gray-800 text-sm mb-0.5 line-clamp-1">
          {listing.title}
        </h3>
        <p className="text-[11px] text-gray-400 mb-3 line-clamp-1">
          {listing.subtitle}
        </p>

        {/* Specs */}
        <div className="grid grid-cols-2 gap-y-2 gap-x-2 mb-3 flex-1">
          {listing.year && (
            <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
              <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-[#006EFE]/50" />
              <span>{listing.year}</span>
            </div>
          )}
          {listing.mileage && (
            <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
              <Gauge className="w-3.5 h-3.5 flex-shrink-0 text-[#006EFE]/50" />
              <span>{listing.mileage}</span>
            </div>
          )}
          {listing.fuel && (
            <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
              <Fuel className="w-3.5 h-3.5 flex-shrink-0 text-[#006EFE]/50" />
              <span>{listing.fuel}</span>
            </div>
          )}
          {listing.gearbox && (
            <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
              <GitFork className="w-3.5 h-3.5 flex-shrink-0 text-[#006EFE]/50" />
              <span>{listing.gearbox}</span>
            </div>
          )}
          {listing.power && (
            <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
              <Zap className="w-3.5 h-3.5 flex-shrink-0 text-[#006EFE]/50" />
              <span>{listing.power}</span>
            </div>
          )}
          {/* M-CHECK spec item */}
          <div className="flex items-center gap-1 text-[11px] font-bold">
            <Image
              src="/m_check_dark.PNG"
              alt="M-Check"
              width={32}
              height={32}
              className="object-contain flex-shrink-0"
            />
            <span style={{ color: '#290054' }}>CHECK</span>
          </div>
        </div>

        {/* CTA */}
        <div className="border-t border-gray-100 pt-3 mt-auto">
          <span className="w-full flex items-center justify-center py-2 text-xs font-semibold text-[#006EFE] border border-[#006EFE]/25 rounded-lg group-hover:bg-[#006EFE] group-hover:text-white group-hover:border-[#006EFE] transition-all duration-200">
            Voir le détail
          </span>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="h-0.5 bg-gradient-to-r from-[#006EFE] via-[#32B75C] to-[#006EFE] opacity-40" />
    </a>
  )
}

export async function OccasionServicesSection() {
  const listings = await getMoccazListings()
  const featured = listings.slice(0, 3)

  return (
    <section className="py-4 md:py-6 bg-[#F2F4F6]">
      <div className="container mx-auto px-4">
        <div className="p-6 md:p-8">

          {/* Section Title — M-Occaz Logo */}
          <div className="text-center mb-8 relative z-10">
            <div className="flex items-center justify-center mb-4">
              <Image
                src="/moccaz-logo.png"
                alt="M-OCCAZ"
                width={200}
                height={56}
                className="h-12 w-auto"
              />
            </div>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-secondary to-transparent mx-auto rounded-full shadow-dark-card" />
          </div>

          {/* 4-column grid: 3 live car cards + 1 ad banner */}
          <div className="grid grid-cols-4 gap-4 mb-7">
            {featured.map((listing) => (
              <MOccazCard key={listing.slug} listing={listing} />
            ))}

            {/* Ad Banner */}
            <a
              href="https://m-occaz.ma"
              target="_blank"
              rel="noopener noreferrer"
              className="h-[469px] rounded-xl overflow-hidden border border-gray-200 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 block relative"
            >
              <Image
                src="/moccaz-ad.png"
                alt="M-OCCAZ — Le choix Malin"
                fill
                className="object-contain"
                sizes="246px"
              />
            </a>
          </div>

          {/* Service Buttons — 4 columns aligned with cards above */}
          <div className="grid grid-cols-4 gap-4">
            {/* Voir sur M.OCCAZ — red, external */}
            <a
              href="https://m-occaz.ma/notre-parc-de-vehicules"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#32B75C] hover:bg-[#e6a832] text-white font-semibold font-sans rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <ExternalLink className="w-4 h-4" />
              Voir sur M.OCCAZ
            </a>

            {serviceButtons.map((btn) => (
              <Link
                key={btn.href}
                href={btn.href}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-secondary hover:bg-secondary-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-gold hover:shadow-gold-lg"
              >
                <btn.icon className="w-4 h-4" />
                <span>{btn.label}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
