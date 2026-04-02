import { NextRequest, NextResponse } from 'next/server'
import { getMoccazListings } from '@/lib/scrapers/moccaz'
import { rateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

  if (!rateLimit(`moccaz:${ip}`, { maxRequests: 10, windowMs: 60_000 })) {
    return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 })
  }

  const listings = await getMoccazListings()
  return NextResponse.json(listings)
}
