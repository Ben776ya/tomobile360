import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink, Calendar, Gauge, Fuel, Zap, GitFork, Car } from 'lucide-react'
import { getMoccazListings, type MoccazListing } from '@/lib/scrapers/moccaz'

export const revalidate = 0

export const metadata = {
  title: 'Voitures d\'Occasion au Maroc | Tomobile 360',
  description: 'Trouvez votre voiture d\'occasion au Maroc parmi des milliers d\'annonces vérifiées.',
}

function MOccazCard({ listing }: { listing: MoccazListing }) {
  return (
    <a
      href={listing.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group bg-white rounded-xl overflow-hidden border border-gray-200 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col"
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
          <div className="h-[225px] flex items-center justify-center bg-gray-100">
            <Car className="w-12 h-12 text-gray-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
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
        <div className="mb-1.5">
          <span className="text-lg font-bold text-primary leading-none">
            {listing.price}
          </span>
        </div>

        {/* Title + subtitle */}
        <h3 className="font-bold text-gray-800 text-sm leading-snug mb-0.5 line-clamp-1">
          {listing.title}
        </h3>
        <p className="text-[11px] text-gray-400 mb-3 line-clamp-1">
          {listing.subtitle}
        </p>

        {/* Specs 2×3 grid */}
        <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 mb-3 flex-1">
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
          <span className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-[#006EFE] border border-[#006EFE]/25 rounded-lg group-hover:bg-[#006EFE] group-hover:text-white group-hover:border-[#006EFE] transition-all duration-200">
            Voir l&apos;annonce
            <ExternalLink className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* Bottom accent */}
      <div className="h-0.5 bg-gradient-to-r from-[#006EFE] via-[#32B75C] to-[#006EFE] opacity-40" />
    </a>
  )
}

export default async function UsedVehiclesPage({
  searchParams,
}: {
  searchParams: Record<string, string>
}) {
  let moccazListings = await getMoccazListings()

  const brand = searchParams.brand?.toLowerCase()
  const fuel  = searchParams.fuel?.toLowerCase()

  if (brand) {
    moccazListings = moccazListings.filter(l => l.title.toLowerCase().includes(brand))
  }
  if (fuel) {
    moccazListings = moccazListings.filter(l => l.fuel.toLowerCase().includes(fuel))
  }

  const quickFilters = [
    { label: 'Moins de 80 000 DH', params: 'priceMax=80000' },
    { label: 'Diesel', params: 'fuel=Diesel' },
    { label: 'Automatique', params: 'transmission=Automatic' },
    { label: 'Casablanca', params: 'city=Casablanca' },
    { label: 'Moins de 50 000 km', params: 'mileageMax=50000' },
  ]

  return (
    <div className="min-h-screen bg-[#F2F4F6]">

      {/* ── M-OCCAZ PARTNERSHIP SECTION ── */}
      <section className="py-10">
        <div className="container mx-auto px-4">

          {/* Inner inset — aligns header and grid to the same left/right edges */}
          <div className="px-6 md:px-16">

            {/* Header row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <Image
                  src="/moccaz-logo.png"
                  alt="M-OCCAZ"
                  width={160}
                  height={44}
                  className="h-10 w-auto"
                />
                <div className="h-8 w-px bg-gray-300 hidden sm:block" />
                <p className="text-sm text-gray-500 font-medium">
                  Partenaire officiel · Voitures vérifiées &amp; garanties
                </p>
              </div>
              <a
                href="https://m-occaz.ma/notre-parc-de-vehicules"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:-translate-y-0.5 hover:bg-primary/90 transition-all duration-200 shadow-md flex-shrink-0"
              >
                Voir tout sur M·OCCAZ
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Quick-filter pills */}
            <div className="flex flex-wrap gap-2 mb-6">
              {quickFilters.map((f) => (
                <Link
                  key={f.params}
                  href={`/occasion?${f.params}`}
                  className="px-4 py-1.5 text-sm font-medium rounded-full border border-gray-200 text-gray-600 hover:border-[#006EFE] hover:text-[#006EFE] hover:bg-[#006EFE]/5 transition-all duration-150"
                >
                  {f.label}
                </Link>
              ))}
            </div>

            {/* Listings grid — first 3 cars, then ad banner, then cars 4-19 */}
            {moccazListings.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {moccazListings.slice(0, 3).map((listing) => (
                  <MOccazCard key={listing.slug} listing={listing} />
                ))}

                {/* Ad banner — position 4, fills full row height */}
                <a
                  href="https://m-occaz.ma"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative overflow-hidden rounded-xl border border-gray-200 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 bg-[#1a0f6e] block min-h-[200px]"
                >
                  <Image
                    src="/moccaz-ad.png"
                    alt="M-OCCAZ — Le choix Malin"
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </a>

                {moccazListings.slice(3, 19).map((listing) => (
                  <MOccazCard key={listing.slug} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 text-sm">
                Impossible de charger les annonces M-OCCAZ pour le moment.
              </div>
            )}

          </div>

        </div>
      </section>

    </div>
  )
}
