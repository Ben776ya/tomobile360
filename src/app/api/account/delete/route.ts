import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GDPR / loi 09-08 art. 9 right to erasure.
//
// Cascade plan:
//   1. Email-matched anon rows in contact_messages + newsletter_subscribers
//      are deleted explicitly (no FK to auth.users so ON DELETE CASCADE
//      does not catch them).
//   2. auth.admin.deleteUser(user.id) cascades the 7 user-FK tables
//      (profiles, vehicles_used, comparisons, forum_topics, forum_posts,
//      video_likes, favorites) via ON DELETE CASCADE on their FK to auth.users.
//   3. The `articles` table uses ON DELETE SET NULL on author_id, so any
//      articles authored by this user are retained but anonymised
//      (legally acceptable — editorial content is not personal data once
//      the author identifier is severed).
//
// Confirmation: the request body must contain {"confirm_email": "..."} that
// exactly matches the caller's auth email. This prevents accidental
// one-click deletion from XSS or CSRF.
//
// Service-role key is required for auth.admin.deleteUser. The same key is
// already used by other admin server actions in this codebase.
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Non authentifié' }, { status: 401 })
  }

  if (!rateLimit(`delete:${user.id}`, { maxRequests: 3, windowMs: 60 * 60 * 1000 })) {
    return Response.json(
      { error: 'Trop de tentatives — réessayez dans 1h.' },
      { status: 429 },
    )
  }

  let body: { confirm_email?: unknown } = {}
  try {
    body = await request.json()
  } catch {
    return Response.json(
      { error: 'Corps de requête invalide — JSON attendu.' },
      { status: 400 },
    )
  }

  const confirmEmail = typeof body.confirm_email === 'string' ? body.confirm_email.trim().toLowerCase() : ''
  const userEmail = (user.email ?? '').trim().toLowerCase()

  if (!userEmail || confirmEmail !== userEmail) {
    return Response.json(
      { error: 'Confirmation incorrecte — saisissez votre adresse e-mail exacte pour confirmer.' },
      { status: 400 },
    )
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!serviceKey || !supabaseUrl) {
    return Response.json(
      { error: 'Configuration serveur incomplète.' },
      { status: 500 },
    )
  }

  const serviceClient = createServiceClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const userId = user.id

  const { error: contactErr } = await serviceClient
    .from('contact_messages')
    .delete()
    .eq('email', userEmail)

  const { error: newsletterErr } = await serviceClient
    .from('newsletter_subscribers')
    .delete()
    .eq('email', userEmail)

  const { error: authErr } = await serviceClient.auth.admin.deleteUser(userId)

  if (authErr) {
    return Response.json(
      {
        error: 'Échec de la suppression du compte.',
        details: authErr.message,
        partial_cleanup: { contact_messages: !contactErr, newsletter_subscribers: !newsletterErr },
      },
      { status: 500 },
    )
  }

  return Response.json({
    success: true,
    message: 'Compte supprimé. Vos données ont été effacées des tables liées; les articles éventuellement publiés ont été anonymisés.',
    cleaned: {
      contact_messages: !contactErr,
      newsletter_subscribers: !newsletterErr,
      auth_user: true,
    },
  })
}
