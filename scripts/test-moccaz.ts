import { getMoccazListings } from '../src/lib/scrapers/moccaz'

async function main() {
  console.log('=== M-OCCAZ Scraper Test ===\n')
  console.log('Fetching listings...')

  const listings = await getMoccazListings()

  console.log(`\nTotal listings returned: ${listings.length}`)
  console.log(`Listings with images: ${listings.filter((l) => l.image !== null).length}`)

  console.log('\n--- First 3 listings ---')
  console.log(JSON.stringify(listings.slice(0, 3), null, 2))

  const missingFields = listings.filter(
    (l) => !l.title || !l.price || !l.slug
  )
  if (missingFields.length > 0) {
    console.warn(`\n⚠ ${missingFields.length} listings have missing required fields`)
  } else {
    console.log('\n✓ All listings have required fields (title, price, slug)')
  }
}

main().catch((err) => {
  console.error('Test failed:', err)
  process.exit(1)
})
