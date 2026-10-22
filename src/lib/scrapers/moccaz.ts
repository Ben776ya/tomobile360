import * as cheerio from 'cheerio'

/** Strip HTML tags and limit length for scraped text */
function cleanText(text: string, maxLen = 200): string {
  return text.replace(/<[^>]*>/g, '').trim().slice(0, maxLen)
}

export type MoccazListing = {
  title: string
  subtitle: string
  year: string
  power: string
  mileage: string
  gearbox: string
  fuel: string
  price: string
  slug: string
  url: string
  image: string | null
}

/** Every listing M-OCCAZ shows, newest first. */
export type MoccazStock = {
  listings: MoccazListing[]
  /**
   * True when the walk reached the end of M-OCCAZ's pagination. False when a
   * failed page or MAX_PAGES cut it short: the listings are then the newest only.
   */
  complete: boolean
}

const BASE_URL = 'https://m-occaz.ma'
const LISTING_PAGE = `${BASE_URL}/notre-parc-de-vehicules`
const CACHE_TTL = 30 * 60 * 1000 // 30 minutes
const MAX_PAGES = 15 // 20 cars per page; ~170 cars = 9 pages (2026-10-22)

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept-Language': 'fr-FR,fr;q=0.9',
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
}

let cache: MoccazStock | null = null
let cacheTime: number = 0
let refreshing: Promise<MoccazStock> | null = null

/** Extract spec value by matching the icon src keyword within a .car-card */
function getSpec(
  $card: cheerio.Cheerio<any>,
  $: cheerio.CheerioAPI,
  keyword: string
): string {
  let value = ''
  $card.find('.spec-item').each((_, item) => {
    if (value) return
    const imgSrc = $(item).find('img').attr('src') || ''
    if (imgSrc.toLowerCase().includes(keyword.toLowerCase())) {
      value = $(item).find('span').text().trim()
    }
  })
  return value
}

/** One listing page: its car cards and the URL of the next page, if any. */
function parseListingPage(html: string): { listings: MoccazListing[]; next: string | null } {
  const $ = cheerio.load(html)

  const result: MoccazListing[] = []

  // Each car card: <div class="car-card">
  $('.car-card').each((_, cardEl) => {
    const $card = $(cardEl)

    // Image: first swiper-slide img, use data-src (lazy-loaded)
    const image =
      $card.find('.swiper-slide img').first().attr('data-src') || null

    // The <a> tag with the full listing URL
    const $link = $card.find('a[href*="/annonce/"]').first()
    const href = $link.attr('href') || ''
    if (!href) return

    // Slug from full URL: https://m-occaz.ma/annonce/slug
    const slugMatch = href.match(/\/annonce\/([^/?#]+)/)
    const slug = slugMatch ? slugMatch[1] : ''
    if (!slug) return

    // Title and subtitle
    const title = $link.find('h2.car-title').text().trim()
    if (!title) return

    // Subtitle: first <p> inside the link that isn't empty
    let subtitle = $link.find('p.car-subtitle').text().trim()
    if (!subtitle) {
      $link.find('p').each((_, p) => {
        if (!subtitle) {
          const t = $(p).text().trim()
          if (t) subtitle = t
        }
      })
    }

    // Specs
    const year = getSpec($card, $, 'year')
    const power = getSpec($card, $, 'puissance')
    const mileage = getSpec($card, $, 'kilometrag')
    const gearbox = getSpec($card, $, 'boite')
    const fuel = getSpec($card, $, 'carburant')

    // Price: in .price div (sibling to the <a> container)
    // Clone and remove nested <span> to get the raw number text
    const $priceEl = $card.find('.price').first()
    const priceNumber = $priceEl
      .clone()
      .children()
      .remove()
      .end()
      .text()
      .trim()
    const priceCurrency = $priceEl.find('small').text().trim() || 'Dhs'
    const price = priceNumber ? `${priceNumber} ${priceCurrency}` : ''

    result.push({
      title: cleanText(title),
      subtitle: cleanText(subtitle),
      year: cleanText(year, 20),
      power: cleanText(power, 50),
      mileage: cleanText(mileage, 50),
      gearbox: cleanText(gearbox, 50),
      fuel: cleanText(fuel, 50),
      price: cleanText(price, 50),
      slug: slug.slice(0, 200),
      url: href.startsWith('http') ? href : `${BASE_URL}${href}`,
      image,
    })
  })

  // M-OCCAZ's own pagination: <a rel="next" href=".../notre-parc-de-vehicules/20">
  const nextHref = $('.pagination a[rel="next"]').attr('href')
  const next = nextHref ? new URL(nextHref, LISTING_PAGE).href : null
  return { listings: result, next: next?.startsWith(LISTING_PAGE) ? next : null }
}

async function fetchListingPage(url: string) {
  const res = await fetch(url, {
    headers: HEADERS,
    // @ts-ignore
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return parseListingPage(await res.text())
}

/**
 * Walk M-OCCAZ's pagination one page at a time (never in parallel), following
 * each page's "next" link. Stops after the last page, on a page with no new
 * listing, or at MAX_PAGES. A failed page ends the walk with what was read.
 */
export async function fetchMoccazStock(): Promise<MoccazStock> {
  const listings: MoccazListing[] = []
  const seen = new Set<string>()
  let url = LISTING_PAGE

  for (let page = 1; page <= MAX_PAGES; page++) {
    let parsed
    try {
      parsed = await fetchListingPage(url)
    } catch (err) {
      console.error('[moccaz] Failed to fetch listing page:', url, err)
      return { listings, complete: false }
    }

    const fresh = parsed.listings.filter((l) => !seen.has(l.slug))
    // An empty page is past the end; a page of repeats means the pagination isn't advancing.
    if (fresh.length === 0) return { listings, complete: parsed.listings.length === 0 }
    for (const l of fresh) {
      seen.add(l.slug)
      listings.push(l)
    }

    if (!parsed.next) return { listings, complete: true }
    url = parsed.next
  }

  return { listings, complete: false }
}

/** The whole M-OCCAZ stock, fetched from M-OCCAZ at most once per CACHE_TTL. */
export async function getMoccazStock(): Promise<MoccazStock> {
  // Return cache if still valid
  if (cache !== null && Date.now() - cacheTime < CACHE_TTL) {
    return cache
  }

  // Visitors arriving during a refresh wait for it rather than starting another.
  if (!refreshing) {
    refreshing = fetchMoccazStock()
      .then((stock) => {
        // Not even the first page loaded: keep serving the last stock we had.
        if (stock.listings.length === 0 && !stock.complete) return cache ?? stock
        cache = stock
        cacheTime = Date.now()
        return stock
      })
      .finally(() => {
        refreshing = null
      })
  }
  return refreshing
}

export async function getMoccazListings(): Promise<MoccazListing[]> {
  return (await getMoccazStock()).listings
}
