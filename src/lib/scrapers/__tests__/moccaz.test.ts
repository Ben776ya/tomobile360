import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchMoccazStock } from '../moccaz'

const LISTING_PAGE = 'https://m-occaz.ma/notre-parc-de-vehicules'

// Same markup as the live listing pages (2026-10-22), trimmed to what the scraper reads.
function listingPage(slugs: string[], next?: string): string {
  const cards = slugs
    .map((s) => `<div class="car-card"><a href="https://m-occaz.ma/annonce/${s}"><h2 class="car-title">${s}</h2></a></div>`)
    .join('')
  const nextLink = next ? `<li class="page-item"><a href="${next}" class="page-link" rel="next">Suiv →</a></li>` : ''
  return `<html><body>${cards}<ul class="pagination"><li class="page-item active">1</li>${nextLink}</ul></body></html>`
}

const slugsOf = (n: number, prefix: string) => Array.from({ length: n }, (_, i) => `${prefix}-${i}`)
const pageUrl = (offset: number) => (offset === 0 ? LISTING_PAGE : `${LISTING_PAGE}/${offset}`)

describe('fetchMoccazStock', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    fetchMock.mockReset()
  })

  /** Serve `pages` by URL; anything else is a 404. */
  function serve(pages: Record<string, string>) {
    fetchMock.mockImplementation(async (url: string) =>
      url in pages ? new Response(pages[url]) : new Response('', { status: 404 })
    )
  }

  const requested = () => fetchMock.mock.calls.map(([url]) => url)

  it('follows the "next" links to the last page, one request at a time', async () => {
    serve({
      [pageUrl(0)]: listingPage(slugsOf(20, 'a'), pageUrl(20)),
      [pageUrl(20)]: listingPage(slugsOf(20, 'b'), pageUrl(40)),
      [pageUrl(40)]: listingPage(slugsOf(7, 'c')),
    })
    let inFlight = 0
    let maxInFlight = 0
    const serveOne = fetchMock.getMockImplementation()!
    fetchMock.mockImplementation(async (url: string) => {
      maxInFlight = Math.max(maxInFlight, ++inFlight)
      await new Promise((r) => setTimeout(r, 1))
      inFlight--
      return serveOne(url)
    })

    const stock = await fetchMoccazStock()

    expect(requested()).toEqual([pageUrl(0), pageUrl(20), pageUrl(40)])
    expect(maxInFlight).toBe(1)
    expect(stock.complete).toBe(true)
    expect(stock.listings).toHaveLength(47)
    // Newest first, as on M-OCCAZ: page 1 leads.
    expect(stock.listings.slice(0, 2).map((l) => l.slug)).toEqual(['a-0', 'a-1'])
    expect(stock.listings[46].slug).toBe('c-6')
  })

  it('stops on an empty page', async () => {
    serve({
      [pageUrl(0)]: listingPage(slugsOf(20, 'a'), pageUrl(20)),
      [pageUrl(20)]: listingPage([], pageUrl(40)),
      [pageUrl(40)]: listingPage(slugsOf(20, 'c')),
    })

    const stock = await fetchMoccazStock()

    expect(requested()).toEqual([pageUrl(0), pageUrl(20)])
    expect(stock).toMatchObject({ complete: true })
    expect(stock.listings).toHaveLength(20)
  })

  it('stops on a page that repeats listings already read, and flags the stock as partial', async () => {
    serve({
      [pageUrl(0)]: listingPage(slugsOf(20, 'a'), pageUrl(20)),
      [pageUrl(20)]: listingPage(slugsOf(20, 'a'), pageUrl(40)),
      [pageUrl(40)]: listingPage(slugsOf(20, 'c')),
    })

    const stock = await fetchMoccazStock()

    expect(requested()).toEqual([pageUrl(0), pageUrl(20)])
    expect(stock.complete).toBe(false)
    expect(stock.listings).toHaveLength(20)
  })

  it('keeps one copy of a listing that shifted onto the next page mid-walk', async () => {
    serve({
      [pageUrl(0)]: listingPage(['x', 'y'], pageUrl(20)),
      [pageUrl(20)]: listingPage(['y', 'z']),
    })

    const stock = await fetchMoccazStock()

    expect(stock.listings.map((l) => l.slug)).toEqual(['x', 'y', 'z'])
    expect(stock.complete).toBe(true)
  })

  it('stops at 15 pages even if M-OCCAZ keeps offering a next page', async () => {
    fetchMock.mockImplementation(async (url: string) => {
      const offset = url === LISTING_PAGE ? 0 : Number(url.split('/').pop())
      return new Response(listingPage(slugsOf(20, `p${offset}`), pageUrl(offset + 20)))
    })

    const stock = await fetchMoccazStock()

    expect(fetchMock).toHaveBeenCalledTimes(15)
    expect(stock.listings).toHaveLength(300)
    expect(stock.complete).toBe(false)
  })

  it('keeps the pages already read when a later page fails', async () => {
    serve({
      [pageUrl(0)]: listingPage(slugsOf(20, 'a'), pageUrl(20)),
      [pageUrl(20)]: listingPage(slugsOf(20, 'b'), pageUrl(40)),
      // pageUrl(40) → 404
    })

    const stock = await fetchMoccazStock()

    expect(requested()).toEqual([pageUrl(0), pageUrl(20), pageUrl(40)])
    expect(stock.listings).toHaveLength(40)
    expect(stock.complete).toBe(false)
  })

  it('keeps the pages already read when the network drops', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(listingPage(slugsOf(20, 'a'), pageUrl(20))))
      .mockRejectedValueOnce(new TypeError('fetch failed'))

    const stock = await fetchMoccazStock()

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(stock.listings).toHaveLength(20)
    expect(stock.complete).toBe(false)
  })

  it('returns nothing, flagged partial, when the first page fails', async () => {
    serve({})

    expect(await fetchMoccazStock()).toEqual({ listings: [], complete: false })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('only follows next links that stay on the M-OCCAZ listing pages', async () => {
    serve({
      [pageUrl(0)]: listingPage(slugsOf(20, 'a'), 'https://evil.example/notre-parc-de-vehicules/20'),
    })

    const stock = await fetchMoccazStock()

    expect(requested()).toEqual([pageUrl(0)])
    expect(stock.listings).toHaveLength(20)
  })
})

describe('getMoccazStock', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it('walks M-OCCAZ once per cache window, however many visitors ask', async () => {
    const fetchMock = vi.fn(async (url: string) =>
      new Response(url === LISTING_PAGE ? listingPage(['a', 'b'], pageUrl(20)) : listingPage(['c']))
    )
    vi.stubGlobal('fetch', fetchMock)
    vi.resetModules()
    const { getMoccazStock, getMoccazListings } = await import('../moccaz')

    // Concurrent visitors during the first walk share it…
    const [first, second] = await Promise.all([getMoccazStock(), getMoccazStock()])
    // …and later ones are served from the cache.
    const listings = await getMoccazListings()

    expect(fetchMock).toHaveBeenCalledTimes(2) // 2 pages, one walk
    expect(first).toBe(second)
    expect(listings.map((l) => l.slug)).toEqual(['a', 'b', 'c'])
  })
})
