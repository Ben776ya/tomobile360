import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { checkAdminApi } from '@/lib/auth/check-admin'

export async function POST(request: NextRequest) {
  try {
    // Single shared authorization rule — see src/lib/auth/check-admin.ts
    const auth = await checkAdminApi()
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')

    if (!path) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 })
    }

    // Validate path format and whitelist
    const ALLOWED_PREFIXES = ['/', '/actu', '/neuf', '/occasion', '/videos', '/coups-de-coeur', '/forum', '/services', '/admin']
    if (!path.startsWith('/') || path.includes('..') || path.length > 255) {
      return NextResponse.json({ error: 'Invalid path format' }, { status: 400 })
    }
    if (!ALLOWED_PREFIXES.some(prefix => path === prefix || path.startsWith(prefix + '/'))) {
      return NextResponse.json({ error: 'Path not allowed' }, { status: 400 })
    }

    revalidatePath(path)

    return NextResponse.json({
      revalidated: true,
      path,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error('Revalidation error:', error)
    return NextResponse.json(
      { error: 'Error revalidating path' },
      { status: 500 }
    )
  }
}
