// Liveness + DB-connectivity probe for external uptime monitors (UptimeRobot,
// BetterStack, etc). Hits a 1-row count on the smallest table to verify the
// app can reach Supabase. Robots.txt already disallows /api/ so this stays
// out of search engines.

import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const TIMEOUT_MS = 4000

export async function GET() {
  const start = Date.now()
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !anonKey) {
      return Response.json(
        { status: 'error', reason: 'supabase-env-missing' },
        { status: 503 },
      )
    }

    const client = createClient(url, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const probe = client
      .from('brands')
      .select('id', { count: 'exact', head: true })

    const timeout = new Promise<{ error: Error }>((resolve) =>
      setTimeout(() => resolve({ error: new Error('db-timeout') }), TIMEOUT_MS),
    )

    const result = await Promise.race([probe, timeout])
    if ('error' in result && result.error) {
      throw result.error
    }

    return Response.json({
      status: 'ok',
      ts: new Date().toISOString(),
      latencyMs: Date.now() - start,
    })
  } catch (err) {
    return Response.json(
      {
        status: 'error',
        ts: new Date().toISOString(),
        latencyMs: Date.now() - start,
        reason: err instanceof Error ? err.message : 'unknown',
      },
      { status: 503 },
    )
  }
}
