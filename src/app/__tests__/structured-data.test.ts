/**
 * F16 (audit 2026-10-21): structured data must describe Tomobile 360 as what
 * it is — a media / lead-connection service — not a dealer selling stock.
 * The JSON-LD lives inline in server components, so we assert on the source.
 */
import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const read = (p: string) => fs.readFileSync(path.resolve(__dirname, '..', p), 'utf8')

describe('structured data', () => {
  it('root organization is not an AutoDealer', () => {
    const src = read('layout.tsx')
    expect(src).not.toContain("'AutoDealer'")
    expect(src).toContain("'@type': 'NewsMediaOrganization'")
    expect(src).toContain("'@id': 'https://www.tomobile360.ma/#organization'")
  })

  it('WebSite does not advertise a search URL that ignores the query', () => {
    expect(read('layout.tsx')).not.toContain('SearchAction')
  })

  it.each(['neuf/[brand]/[model]/page.tsx', 'occasion/[id]/page.tsx'])(
    '%s offers carry a price but no seller or stock claim',
    (file) => {
      const src = read(file)
      expect(src).not.toContain('schema.org/InStock')
      expect(src).not.toMatch(/seller:\s*\{/)
      expect(src).toContain("priceCurrency: 'MAD'")
    },
  )
})
