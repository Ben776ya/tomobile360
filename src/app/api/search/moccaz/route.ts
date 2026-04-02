import { getMoccazListings } from '@/lib/scrapers/moccaz'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

  if (!rateLimit(`moccaz-search:${ip}`, { maxRequests: 15, windowMs: 60_000 })) {
    return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 })
  }

  const brand = req.nextUrl.searchParams.get('brand')?.trim().toLowerCase().slice(0, 100) || ''
  const fuel  = req.nextUrl.searchParams.get('fuel')?.trim().toLowerCase().slice(0, 50)  || ''

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
