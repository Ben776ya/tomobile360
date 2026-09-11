/**
 * Layout-order regression guard for the model page.
 *
 * The page is a Supabase-backed async server component, so we assert on the
 * JSX source instead of rendering: the mobile single-column flow must read
 * Header → Prix & versions → Points clés → Fiche, and the brand description
 * must live in the sidebar (which renders after the main column on mobile).
 */
import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const src = fs.readFileSync(path.resolve(__dirname, '../page.tsx'), 'utf8')
// Only the rendered JSX of the page component, not the metadata helpers.
const jsx = src.slice(src.indexOf('<div className="min-h-screen bg-background">'))

const at = (needle: string) => {
  const i = jsx.indexOf(needle)
  expect(i, `missing "${needle}"`).toBeGreaterThanOrEqual(0)
  return i
}

describe('model page layout order', () => {
  it('renders header → price/versions → key specs → fiche → sidebar → brand blurb', () => {
    const header = at('<h1 className')
    const price = at('<PriceVersionsCard')
    const keySpecs = at('<KeySpecsStrip')
    const fiche = at('<VehicleSpecs ')
    const sidebar = at('{/* Sidebar */}')
    const blurb = at('{brand.description}')
    expect(header).toBeLessThan(price)
    expect(price).toBeLessThan(keySpecs)
    expect(keySpecs).toBeLessThan(fiche)
    expect(fiche).toBeLessThan(sidebar)
    expect(sidebar).toBeLessThan(blurb)
  })

  it('does not render the brand description in the main column', () => {
    const mainColumn = jsx.slice(0, at('{/* Sidebar */}'))
    expect(mainColumn).not.toContain('{brand.description}')
  })

  it('has exactly one price card and no leftover sidebar versions list', () => {
    expect(jsx.match(/<PriceVersionsCard/g)).toHaveLength(1)
    expect(jsx).not.toContain('>Versions disponibles</h3>')
  })

  it('exposes the fiche anchor used by the jump nav', () => {
    expect(jsx).toContain('id="fiche-technique"')
  })
})
