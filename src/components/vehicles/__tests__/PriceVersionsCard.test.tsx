import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PriceVersionsCard } from '../PriceVersionsCard'
import type { Variant } from '@/lib/types'
import { formatPrice } from '@/lib/utils'

const variants: Variant[] = [
  { version: '2.0 ATK 235 HEV Dynamic', price_min: 299900, price_max: null, horsepower: 235, fuel_type: 'Hybrid', transmission: 'Automatic' },
  { version: '2.0 ATK 235 HEV Premium', price_min: 329900, price_max: null, horsepower: 235, fuel_type: 'Hybrid', transmission: 'Automatic' },
]

const base = {
  brandName: 'GAC',
  modelName: 'EMKOO',
  variants,
  minPrice: 299900,
  priceDisplay: `À partir de ${formatPrice(299900)}`,
  promo: null,
  finalPrice: 299900,
}

describe('PriceVersionsCard', () => {
  it('renders the headline price and one row per version with its price and chips', () => {
    render(<PriceVersionsCard {...base} />)
    expect(screen.getByRole('heading', { name: 'Prix' })).toBeInTheDocument()
    expect(screen.getByText(`À partir de ${formatPrice(299900)}`)).toBeInTheDocument()
    expect(screen.getByText('2 versions disponibles')).toBeInTheDocument()
    const rows = screen.getAllByRole('listitem')
    expect(rows).toHaveLength(2)
    expect(rows[0]).toHaveTextContent('2.0 ATK 235 HEV Dynamic')
    expect(rows[0]).toHaveTextContent(formatPrice(299900))
    expect(rows[0]).toHaveTextContent('Hybride')
    expect(rows[0]).toHaveTextContent('Automatique')
    expect(rows[0]).toHaveTextContent('235 ch')
    expect(rows[1]).toHaveTextContent(formatPrice(329900))
    // anchors for the jump nav
    expect(document.querySelector('#prix')).toBeTruthy()
    expect(document.querySelector('#versions')).toBeTruthy()
  })

  it('shows struck-through price, discounted price and promo box when a promo is active', () => {
    render(
      <PriceVersionsCard
        {...base}
        promo={{ title: 'Offre de lancement', discount_percentage: 10, valid_until: '2099-12-31' }}
        finalPrice={269910}
      />,
    )
    expect(screen.getByText(formatPrice(269910))).toBeInTheDocument()
    expect(document.querySelector('.line-through')).toHaveTextContent(formatPrice(299900))
    expect(screen.getByText('PROMOTION -10%')).toBeInTheDocument()
    expect(screen.getByText('Offre de lancement')).toBeInTheDocument()
    expect(screen.getByText(`Économisez ${formatPrice(29990)}`)).toBeInTheDocument()
  })

  it('falls back to "Prix sur demande" per version and overall when prices are missing', () => {
    render(
      <PriceVersionsCard
        {...base}
        variants={[{ ...variants[0], price_min: null }, { ...variants[1], price_min: null }]}
        minPrice={null}
        priceDisplay="Prix sur demande"
        finalPrice={0}
      />,
    )
    expect(screen.getAllByText('Prix sur demande')).toHaveLength(3) // headline + 2 rows
    expect(screen.getByText(/Contactez le concessionnaire/)).toBeInTheDocument()
  })

  it('hides the versions list for a single unnamed variant but shows it for a named one', () => {
    const { unmount } = render(
      <PriceVersionsCard {...base} variants={[{ ...variants[0], version: null }]} />,
    )
    expect(document.querySelector('#versions')).toBeNull()
    unmount()
    render(<PriceVersionsCard {...base} variants={[variants[0]]} />)
    expect(document.querySelector('#versions')).toBeTruthy()
    expect(screen.getByText('1 version disponible')).toBeInTheDocument()
  })
})
