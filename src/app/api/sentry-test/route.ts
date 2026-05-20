import * as Sentry from '@sentry/nextjs'

export const dynamic = 'force-dynamic'
export const revalidate = 0

class SentryAuditTestError extends Error {
  constructor() {
    super('Sentry audit test 2026-05-20 — safe to ignore')
    this.name = 'SentryAuditTestError'
  }
}

export async function GET() {
  try {
    throw new SentryAuditTestError()
  } catch (err) {
    const eventId = Sentry.captureException(err, {
      tags: { test: 'true', source: 'audit-2026-05-20' },
      extra: { intent: 'verify Sentry pipeline post-deploy' },
    })
    await Sentry.flush(2000)
    return Response.json({ status: 'sent', eventId })
  }
}
