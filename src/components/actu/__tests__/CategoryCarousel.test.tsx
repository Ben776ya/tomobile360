import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CategoryCarousel } from '../CategoryCarousel'

// next/link renders a plain anchor in tests.
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: any) => (
    <a href={typeof href === 'string' ? href : '#'} {...rest}>
      {children}
    </a>
  ),
}))

beforeEach(() => {
  // happy-dom lacks ResizeObserver; the component observes the scroll row.
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
})

describe('CategoryCarousel', () => {
  it('renders Tout plus all categories as links', () => {
    render(<CategoryCarousel activeCategory="all" />)
    expect(screen.getByRole('link', { name: 'Tout' })).toHaveAttribute('href', '/actu')
    expect(screen.getByRole('link', { name: 'Business' })).toHaveAttribute(
      'href',
      '/actu?category=business',
    )
    expect(screen.getByRole('link', { name: 'Classic Cars' })).toHaveAttribute(
      'href',
      '/actu?category=classic-cars',
    )
  })

  it('marks the active category with the active pill style', () => {
    render(<CategoryCarousel activeCategory="business" />)
    expect(screen.getByRole('link', { name: 'Business' }).className).toContain('bg-secondary')
  })

  it('hides arrows when the row does not overflow', () => {
    render(<CategoryCarousel activeCategory="all" />)
    expect(screen.queryByLabelText('Catégories suivantes')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Catégories précédentes')).not.toBeInTheDocument()
  })

  it('shows the right arrow when the row overflows', () => {
    render(<CategoryCarousel activeCategory="all" />)
    const row = screen.getByTestId('category-scroll')
    Object.defineProperty(row, 'scrollWidth', { value: 900, configurable: true })
    Object.defineProperty(row, 'clientWidth', { value: 300, configurable: true })
    Object.defineProperty(row, 'scrollLeft', { value: 0, configurable: true, writable: true })
    fireEvent.scroll(row)
    expect(screen.getByLabelText('Catégories suivantes')).toBeInTheDocument()
    expect(screen.queryByLabelText('Catégories précédentes')).not.toBeInTheDocument()
  })
})
