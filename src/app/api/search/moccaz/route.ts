import { getMoccazListings } from '@/lib/scrapers/moccaz'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const brand = req.nextUrl.searchParams.get('brand')?.trim().toLowerCase() || ''
  const fuel  = req.nextUrl.searchParams.get('fuel')?.trim().toLowerCase()  || ''

  const listings = await getMoccazListings()

  let results = listings

  if (brand) {
    results = results.filter(l => l.title.toLowerCase().includes(brand))
  }

  if (fuel) {
    results = results.filter(l => l.fuel.toLowerCase().includes(fuel))
  }

  return NextResponse.json(results)
}
