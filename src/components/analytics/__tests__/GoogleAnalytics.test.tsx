import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, act } from '@testing-library/react'

// Never let the test inject (or fetch) gtag.js.
vi.mock('next/script', () => ({
  default: ({ id, src }: { id?: string; src?: string }) => <i data-script={id ?? src} />,
}))

const flag = () => (window as unknown as Record<string, unknown>)['ga-disable-G-TEST123']

describe('GoogleAnalytics consent', () => {
  let consent: typeof import('@/lib/analytics/consent')
  let GoogleAnalytics: typeof import('../GoogleAnalytics').GoogleAnalytics

  beforeEach(async () => {
    vi.stubEnv('NEXT_PUBLIC_GA_MEASUREMENT_ID', 'G-TEST123')
    vi.resetModules()
    consent = await import('@/lib/analytics/consent')
    ;({ GoogleAnalytics } = await import('../GoogleAnalytics'))
  })
  afterEach(() => {
    localStorage.clear()
    document.cookie = 'other=; Max-Age=0; path=/'
    vi.unstubAllEnvs()
  })

  it('loads nothing without consent', () => {
    const { container } = render(<GoogleAnalytics />)
    expect(container.querySelector('[data-script]')).toBeNull()
    expect(flag()).toBe(true)
  })

  it('loads gtag after acceptance, then stops it and deletes _ga cookies when consent is withdrawn', () => {
    localStorage.setItem(consent.CONSENT_STORAGE_KEY, 'accepted')
    const { container } = render(<GoogleAnalytics />)
    expect(container.querySelector('[data-script]')).toHaveAttribute(
      'data-script',
      'https://www.googletagmanager.com/gtag/js?id=G-TEST123',
    )
    expect(flag()).toBe(false)

    document.cookie = '_ga=GA1.1.123.456; path=/'
    document.cookie = '_ga_TEST123=GS1.1.789; path=/'
    document.cookie = 'other=1; path=/'

    act(() => consent.setConsent('refused'))
    expect(container.querySelector('[data-script]')).toBeNull()
    expect(flag()).toBe(true)
    expect(document.cookie).not.toMatch(/_ga/)
    expect(document.cookie).toContain('other=1')

    act(() => consent.setConsent('accepted'))
    expect(flag()).toBe(false)
  })
})
