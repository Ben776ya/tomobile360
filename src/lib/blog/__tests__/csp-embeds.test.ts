import { describe, it, expect } from 'vitest'
import { EMBED_FRAME_ORIGINS } from '../embeds'
// next.config.js is CommonJS; it only wraps with Sentry when a DSN is set.
import nextConfig from '../../../../next.config.js'

async function frameSrcSources(): Promise<string[]> {
  const rules = (await nextConfig.headers()) as Array<{ headers: Array<{ key: string; value: string }> }>
  const csp = rules
    .flatMap((r) => r.headers)
    .find((h) => h.key === 'Content-Security-Policy')
  expect(csp, 'Content-Security-Policy header is configured').toBeDefined()
  const directive = csp!.value
    .split(';')
    .map((d) => d.trim())
    .find((d) => d.startsWith('frame-src '))
  expect(directive, 'frame-src directive is present').toBeDefined()
  return directive!.split(/\s+/).slice(1)
}

describe('CSP frame-src covers article embeds', () => {
  it.each([...EMBED_FRAME_ORIGINS])('allows %s', async (origin) => {
    expect(await frameSrcSources()).toContain(origin)
  })

  it('does not open frame-src to arbitrary origins', async () => {
    const sources = await frameSrcSources()
    expect(sources).not.toContain('*')
    expect(sources).not.toContain('https:')
    expect(sources).not.toContain('https://evil.example')
  })
})
