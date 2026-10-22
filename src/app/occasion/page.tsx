import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink, Calendar, Gauge, Fuel, Zap, GitFork, Car, X } from 'lucide-react'
import { getMoccazStock, type MoccazListing } from '@/lib/scrapers/moccaz'
import { filterMoccazListings, parseMoccazFilters, toSearchParams } from '@/lib/occasion/moccaz-filters'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'
import { Pagination } from '@/components/actu/Pagination'
import { pageMetadata } from '@/lib/seo/page-metadata'
import { formatPrice } from '@/lib/utils'

export const revalidate = 0

// One page of the grid: 3 cars, the ad banner, 16 cars (5 rows of 4).
const PAGE_SIZE = 19

export const metadata = pageMetadata({
  title: 'Voitures d\'Occasion Vérifiées au Maroc — M-OCCAZ',
  description: 'Trouvez votre voiture d\'occasion vérifiée au Maroc. Véhicules M-OCCAZ contrôlés et garantis : prix, kilométrage, historique complet sur Tomobile 360.',
  path: '/occasion',
})

function MOccazCard({ listing }: { listing: MoccazListing }) {
  return (
    <a
      href={listing.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group bg-white rounded-xl overflow-hidden border border-gray-200 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col"
    >
      {/* Image */}
      <div className="relative flex-shrink-0 bg-white overflow-hidden">
        {listing.image ? (
          <Image
            src={listing.image}
            alt={listing.title}
            className="w-full h-auto block"
            width={400}
            height={300}
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
            sizes="18px"
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
        <p className="text-xs text-gray-400 mb-3 line-clamp-1">
          {listing.subtitle}
        </p>

        {/* Specs 2×3 grid */}
        <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 mb-3 flex-1">
          {listing.year && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-secondary/50" />
              <span>{listing.year}</span>
            </div>
          )}
          {listing.mileage && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Gauge className="w-3.5 h-3.5 flex-shrink-0 text-secondary/50" />
              <span>{listing.mileage}</span>
            </div>
          )}
          {listing.fuel && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Fuel className="w-3.5 h-3.5 flex-shrink-0 text-secondary/50" />
              <span>{listing.fuel}</span>
            </div>
          )}
          {listing.gearbox && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <GitFork className="w-3.5 h-3.5 flex-shrink-0 text-secondary/50" />
              <span>{listing.gearbox}</span>
            </div>
          )}
          {listing.power && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Zap className="w-3.5 h-3.5 flex-shrink-0 text-secondary/50" />
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
              sizes="32px"
            />
            <span style={{ color: '#290054' }}>CHECK</span>
          </div>
        </div>

        {/* CTA */}
        <div className="border-t border-gray-100 pt-3 mt-auto">
          <span className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-secondary border border-secondary/25 rounded-lg group-hover:bg-secondary group-hover:text-white group-hover:border-secondary transition-all duration-200">
            Voir l&apos;annonce
            <ExternalLink className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* Bottom accent */}
      <div className="h-0.5 bg-gradient-to-r from-secondary via-[#32B75C] to-secondary opacity-40" />
    </a>
  )
}

export default async function UsedVehiclesPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const { listings: allListings, complete } = await getMoccazStock()
  const filters = parseMoccazFilters(searchParams)
  const moccazListings = filterMoccazListings(allListings, filters)
  // A partial stock (a page failed) is only the newest listings: say so.
  const stockLabel = complete ? 'annonces M-OCCAZ' : 'dernières annonces M-OCCAZ'

  const totalPages = Math.max(1, Math.ceil(moccazListings.length / PAGE_SIZE))
  const requestedPage = Number(searchParams.page)
  const page = Number.isInteger(requestedPage) && requestedPage > 1 ? Math.min(requestedPage, totalPages) : 1
  const pageListings = moccazListings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Links add or remove one filter and keep the others.
  const activeParams = toSearchParams(filters)
  const hrefWith = (key: string, value: string | null) => {
    const next = new URLSearchParams(activeParams)
    if (value === null) next.delete(key)
    else next.set(key, value)
    const qs = next.toString()
    return qs ? `/occasion?${qs}` : '/occasion'
  }

  const activeChips: { key: string; label: string }[] = []
  if (filters.brand) activeChips.push({ key: 'brand', label: `Marque : ${filters.brand}` })
  if (filters.fuel) activeChips.push({ key: 'fuel', label: `Carburant : ${filters.fuel}` })
  if (filters.priceMax !== undefined) activeChips.push({ key: 'priceMax', label: `Prix max : ${formatPrice(filters.priceMax)}` })
  if (filters.transmission) activeChips.push({ key: 'transmission', label: `Boîte : ${filters.transmission === 'automatic' ? 'Automatique' : 'Manuelle'}` })
  if (filters.mileageMax !== undefined) activeChips.push({ key: 'mileageMax', label: `Kilométrage max : ${new Intl.NumberFormat('fr-MA').format(filters.mileageMax)} km` })

  // No city shortcut: the M-OCCAZ feed carries no location per listing.
  const quickFilters = [
    { label: 'Moins de 80 000 DH', key: 'priceMax', value: '80000' },
    { label: 'Diesel', key: 'fuel', value: 'Diesel' },
    { label: 'Automatique', key: 'transmission', value: 'Automatic' },
    { label: 'Moins de 50 000 km', key: 'mileageMax', value: '50000' },
  ]

  return (
    <div className="min-h-screen bg-[#F2F4F6]">
      <div className="container mx-auto px-4">
        <Breadcrumbs items={[{ name: 'Occasion', href: '/occasion' }]} />
      </div>

      {/* SEO Intro Text */}
      <div className="container mx-auto px-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-3">
            Voitures d&apos;Occasion Vérifiées au Maroc
          </h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            Retrouvez une sélection de voitures d&apos;occasion vérifiées par notre partenaire M-OCCAZ.
            Chaque véhicule bénéficie du contrôle qualité M-CHECK couvrant plus de 100 points d&apos;inspection
            mécanique et esthétique. Filtrez par budget, kilométrage, type de carburant ou boîte de vitesses pour trouver
            le véhicule qui vous correspond. Toutes les annonces incluent un historique complet, des photos
            détaillées et un prix transparent sans surprise.
          </p>
        </div>
      </div>

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
                  sizes="160px"
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
              {quickFilters.map((f) => {
                const active = activeParams.get(f.key)?.toLowerCase() === f.value.toLowerCase()
                return (
                  <Link
                    key={f.key}
                    href={hrefWith(f.key, active ? null : f.value)}
                    className={`px-3 sm:px-4 py-2 sm:py-1.5 text-xs sm:text-sm font-medium rounded-full border transition-all duration-150 ${
                      active
                        ? 'border-secondary bg-secondary text-white'
                        : 'border-gray-200 text-gray-600 hover:border-secondary hover:text-secondary hover:bg-secondary/5'
                    }`}
                  >
                    {f.label}
                  </Link>
                )
              })}
            </div>

            {/* Result count + active filters */}
            {allListings.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <p className="text-sm text-gray-600 mr-1">
                  {activeChips.length > 0 ? (
                    <>
                      <strong className="text-primary">{moccazListings.length}</strong>{' '}
                      {moccazListings.length > 1 ? 'résultats' : 'résultat'} parmi les {allListings.length} {stockLabel}
                    </>
                  ) : (
                    <>
                      <strong className="text-primary">{allListings.length}</strong> {stockLabel}
                    </>
                  )}
                </p>
                {activeChips.map((chip) => (
                  <Link
                    key={chip.key}
                    href={hrefWith(chip.key, null)}
                    aria-label={`Retirer le filtre ${chip.label}`}
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-secondary/10 text-secondary hover:bg-secondary/20 transition-all duration-150"
                  >
                    {chip.label}
                    <X className="w-3 h-3" />
                  </Link>
                ))}
                {activeChips.length > 0 && (
                  <Link href="/occasion" className="text-xs text-gray-500 underline hover:text-secondary">
                    Effacer les filtres
                  </Link>
                )}
              </div>
            )}

            {/* Listings grid — first 3 cars, then ad banner, then cars 4-19 */}
            {moccazListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
                {pageListings.slice(0, 3).map((listing) => (
                  <MOccazCard key={listing.slug} listing={listing} />
                ))}

                {/* Ad banner — position 4, fills full row height */}
                <a
                  href="https://m-occaz.ma"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative overflow-hidden rounded-xl border border-gray-200 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 bg-[#1a0f6e] block min-h-[140px] sm:min-h-[200px]"
                >
                  <Image
                    src="/moccaz-ad.png"
                    alt="M-OCCAZ — Le choix Malin"
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </a>

                {pageListings.slice(3).map((listing) => (
                  <MOccazCard key={listing.slug} listing={listing} />
                ))}
              </div>
            ) : allListings.length > 0 ? (
              <div className="text-center py-12 text-sm text-gray-500">
                <p className="text-base font-semibold text-gray-700 mb-1">Aucun résultat</p>
                <p>Aucune des {allListings.length} {stockLabel} ne correspond à ces critères.</p>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 text-sm">
                Impossible de charger les annonces M-OCCAZ pour le moment.
              </div>
            )}

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              hrefFor={(p) => hrefWith('page', p > 1 ? String(p) : null)}
            />

          </div>

        </div>
      </section>

    </div>
  )
}
