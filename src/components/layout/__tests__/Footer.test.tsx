/**
 * Footer links must lead to the content they name: every query param an
 * internal footer link carries has to be read by the target page.
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import fs from 'node:fs'
import path from 'node:path'

vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  default: (props: Record<string, unknown>) => <img {...props} />,
}))
vi.mock('@/lib/actions/newsletter', () => ({ subscribeNewsletter: vi.fn() }))

import Footer from '../Footer'

const pageSource = (route: string) =>
  fs.readFileSync(path.resolve(__dirname, `../../../app${route}/page.tsx`), 'utf8')

describe('Footer links', () => {
  it('drops the labels that had no matching content', () => {
    render(<Footer />)
    expect(screen.queryByText('Concessionnaires')).toBeNull()
    expect(screen.queryByText('Professionnels')).toBeNull()
  })

  it('"Prix des voitures" opens the catalogue sorted by ascending price', () => {
    render(<Footer />)
    expect(screen.getByRole('link', { name: 'Prix des voitures' })).toHaveAttribute('href', '/neuf?sort=price-asc')
  })

  it('every query param on an internal link is handled by its page', () => {
    const { container } = render(<Footer />)
    const withQuery = Array.from(container.querySelectorAll('a'))
      .map((a) => a.getAttribute('href') || '')
      .filter((h) => h.startsWith('/') && h.includes('?'))
    expect(withQuery.length).toBeGreaterThan(0)
    for (const href of withQuery) {
      const url = new URL(href, 'https://www.tomobile360.ma')
      const src = pageSource(url.pathname)
      Array.from(url.searchParams.entries()).forEach(([key, value]) => {
        expect(src, `${href}: page ignores "${key}"`).toContain(`searchParams.${key}`)
        if (key === 'sort') expect(src, `${href}: unknown sort`).toContain(`case '${value}':`)
      })
    }
  })
})
