import { NextResponse } from 'next/server'
import { getMoccazListings } from '@/lib/scrapers/moccaz'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const listings = await getMoccazListings()
  return NextResponse.json(listings)
}
