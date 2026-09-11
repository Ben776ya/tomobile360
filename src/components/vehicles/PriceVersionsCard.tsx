import { Tag } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import { fuelLabel, transmissionLabel } from '@/lib/vehicles/display-labels'
import type { Variant } from '@/lib/types'

export type PricePromo = {
  title?: string | null
  discount_percentage: number | null
  valid_until?: string | null
}

interface PriceVersionsCardProps {
  brandName: string
  modelName: string
  variants: Variant[]
  /** Lowest variant price, or null → "Prix sur demande". */
  minPrice: number | null
  /** Pre-formatted headline ("À partir de …", "X - Y", "Prix sur demande"). */
  priceDisplay: string
  /** Best active promotion, already resolved by the page. */
  promo: PricePromo | null
  /** minPrice after the promo discount (equals minPrice when no promo). */
  finalPrice: number
}

/** With a single unnamed variant the list would just repeat the headline. */
export function hasVersionsList(variants: Variant[]): boolean {
  return variants.length > 1 || (variants.length === 1 && !!variants[0].version)
}

/**
 * "Prix & versions" card — lives in the main column right under the model
 * header so the price is the first thing after the gallery on every
 * viewport, and each version's price sits next to its name.
 */
export function PriceVersionsCard({
  brandName,
  modelName,
  variants,
  minPrice,
  priceDisplay,
  promo,
  finalPrice,
}: PriceVersionsCardProps) {
  const showVersions = hasVersionsList(variants)
  const hasPromo = !!promo && !!minPrice

  return (
    <section
      id="prix"
      aria-labelledby="prix-heading"
      className="bg-white rounded-xl border border-gray-200 p-6 shadow-card scroll-mt-24"
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 id="prix-heading" className="text-lg font-semibold text-primary">Prix</h2>
          {hasPromo ? (
            <div className="mt-1">
              <p className="text-sm text-gray-400 line-through">{formatPrice(minPrice!)}</p>
              <p className="text-3xl font-bold text-secondary">{formatPrice(finalPrice)}</p>
              <p className="text-sm text-green-600 mt-1">Économisez {formatPrice(minPrice! - finalPrice)}</p>
            </div>
          ) : (
            <p className="text-3xl font-bold text-secondary mt-1">{priceDisplay}</p>
          )}
          <p className="text-xs text-gray-400 mt-1.5">
            {minPrice ? 'Prix public TTC, hors options.' : 'Contactez le concessionnaire pour obtenir un devis.'}
          </p>
        </div>

        {promo && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl max-w-xs">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-amber-600 shrink-0" aria-hidden="true" />
              <Badge variant="destructive">PROMOTION -{promo.discount_percentage}%</Badge>
            </div>
            {promo.title && <p className="text-sm font-semibold text-amber-700 mt-2">{promo.title}</p>}
            {promo.valid_until && (
              <p className="text-xs text-amber-600/80 mt-0.5">
                Valable jusqu&apos;au{' '}
                {new Date(promo.valid_until).toLocaleDateString('fr-MA', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>
        )}
      </div>

      {showVersions && (
        <div id="versions" className="mt-6 scroll-mt-24">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">
            {variants.length} version{variants.length > 1 ? 's' : ''} disponible{variants.length > 1 ? 's' : ''}
          </h3>
          <ul className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
            {variants.map((v, i) => (
              <li
                key={`${v.version ?? 'v'}-${i}`}
                className={`flex items-center justify-between gap-4 px-4 py-3 ${i % 2 === 0 ? 'bg-white' : 'bg-muted/30'} hover:bg-muted/50 transition-colors`}
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800">
                    {v.version || `${brandName} ${modelName}`}
                  </p>
                  {(v.fuel_type || v.transmission || v.horsepower) && (
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 mt-0.5">
                      {v.fuel_type && <span>{fuelLabel(v.fuel_type)}</span>}
                      {v.transmission && <span>{transmissionLabel(v.transmission)}</span>}
                      {v.horsepower && <span>{v.horsepower} ch</span>}
                    </div>
                  )}
                </div>
                <p className="text-sm font-bold whitespace-nowrap shrink-0 text-right">
                  {v.price_min && v.price_min > 0 ? (
                    <span className="text-secondary">{formatPrice(v.price_min)}</span>
                  ) : (
                    <span className="text-gray-400 font-medium">Prix sur demande</span>
                  )}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
