import * as cheerio from 'cheerio'

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

const BASE_URL = 'https://m-occaz.ma'
const LISTING_PAGE = `${BASE_URL}/notre-parc-de-vehicules`
const CACHE_TTL = 30 * 60 * 1000 // 30 minutes

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept-Language': 'fr-FR,fr;q=0.9',
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
}

let cache: MoccazListing[] | null = null
let cacheTime: number = 0

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

export async function getMoccazListings(): Promise<MoccazListing[]> {
  // Return cache if still valid
  if (cache !== null && Date.now() - cacheTime < CACHE_TTL) {
    console.log('[moccaz] Returning cached listings:', cache.length)
    return cache
  }

  try {
    console.log('[moccaz] Fetching listing page...')
    const res = await fetch(LISTING_PAGE, {
      headers: HEADERS,
      // @ts-ignore
      cache: 'no-store',
    })

    if (!res.ok) {
      console.error('[moccaz] Failed to fetch listing page:', res.status)
      return cache ?? []
    }

    const html = await res.text()
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
        title,
        subtitle,
        year,
        power,
        mileage,
        gearbox,
        fuel,
        price,
        slug,
        url: href.startsWith('http') ? href : `${BASE_URL}${href}`,
        image,
      })
    })

    cache = result
    cacheTime = Date.now()
    console.log(
      `[moccaz] Done. ${result.filter((r) => r.image).length}/${result.length} with images.`
    )
    return result
  } catch (err) {
    console.error('[moccaz] Scrape error:', err)
    return cache ?? []
  }
}
