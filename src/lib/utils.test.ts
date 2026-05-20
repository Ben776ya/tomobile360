import { describe, expect, it } from 'vitest'
import { cn, formatPrice, formatDate, safeJsonLd } from './utils'

describe('cn', () => {
  it('merges class strings and resolves tailwind conflicts', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
    expect(cn('text-sm font-bold', null, undefined, false, 'block')).toBe('text-sm font-bold block')
  })
})

describe('formatPrice', () => {
  // The exact thousand-separator (space, NBSP, or period) varies by ICU build
  // for the fr-MA locale; assert on digit grouping and the DH suffix instead.
  it('formats Moroccan dirham amounts without decimals', () => {
    const out = formatPrice(150000)
    expect(out).toMatch(/150[\s .,]?000.*DH/)
    expect(out).not.toMatch(/\d,\d/) // no decimal fraction
    expect(formatPrice(0)).toMatch(/0\s?DH/)
  })

  it('handles million-range prices', () => {
    const out = formatPrice(1250000)
    expect(out).toMatch(/1[\s .,]?250[\s .,]?000.*DH/)
  })
})

describe('formatDate', () => {
  it('returns a French Moroccan date string', () => {
    const formatted = formatDate('2026-05-20')
    expect(formatted).toContain('2026')
    expect(formatted.length).toBeGreaterThan(0)
  })
})

describe('safeJsonLd', () => {
  it('escapes opening <script tag boundaries', () => {
    const payload = { name: 'Test </script><img src=x>' }
    const out = safeJsonLd(payload)
    expect(out).not.toContain('</script>')
    expect(out).toContain('\\u003c')
  })

  it('produces valid JSON', () => {
    const out = safeJsonLd({ '@type': 'Thing', name: 'x' })
    // Re-parse after un-escaping the safety substitution
    const reparsed = JSON.parse(out.replace(/\\u003c/g, '<'))
    expect(reparsed['@type']).toBe('Thing')
  })
})
