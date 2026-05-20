import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GDPR / loi 09-08 art. 7 right of access. Returns a JSON dump of every
// row attributable to the calling user across:
//   - Direct ownership (FK to auth.users.id)
//   - Email-matched anonymous submissions (contact_messages, newsletter_subscribers)
//
// Authentication is required. Rate-limited to 3 exports per user per 24h to
// avoid abuse (the dump can be heavy for forum-active users).
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Non authentifié' }, { status: 401 })
  }

  if (!rateLimit(`export:${user.id}`, { maxRequests: 3, windowMs: 24 * 60 * 60 * 1000 })) {
    return Response.json(
      { error: 'Trop de demandes — réessayez dans 24h.' },
      { status: 429 },
    )
  }

  const userEmail = user.email ?? null

  const [
    profileRes,
    vehiclesUsedRes,
    comparisonsRes,
    forumTopicsRes,
    forumPostsRes,
    articlesRes,
    videoLikesRes,
    favoritesRes,
    contactMessagesRes,
    newsletterRes,
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    supabase.from('vehicles_used').select('*').eq('user_id', user.id),
    supabase.from('comparisons').select('*').eq('user_id', user.id),
    supabase.from('forum_topics').select('*').eq('user_id', user.id),
    supabase.from('forum_posts').select('*').eq('user_id', user.id),
    supabase.from('articles').select('*').eq('author_id', user.id),
    // `video_likes` was a planned table that never landed in the schema —
    // export an empty array so the JSON shape stays stable.
    Promise.resolve({ data: [], error: null }),
    supabase.from('favorites').select('*').eq('user_id', user.id),
    userEmail
      ? supabase.from('contact_messages').select('*').eq('email', userEmail)
      : Promise.resolve({ data: [], error: null }),
    userEmail
      ? supabase.from('newsletter_subscribers').select('*').eq('email', userEmail)
      : Promise.resolve({ data: [], error: null }),
  ])

  const dump = {
    schema_version: 1,
    generated_at: new Date().toISOString(),
    user: {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
    },
    profile: profileRes.data ?? null,
    vehicles_used: vehiclesUsedRes.data ?? [],
    comparisons: comparisonsRes.data ?? [],
    forum_topics: forumTopicsRes.data ?? [],
    forum_posts: forumPostsRes.data ?? [],
    articles_authored: articlesRes.data ?? [],
    video_likes: videoLikesRes.data ?? [],
    favorites: favoritesRes.data ?? [],
    contact_messages_by_email: contactMessagesRes.data ?? [],
    newsletter_subscriptions_by_email: newsletterRes.data ?? [],
  }

  const filename = `tomobile360-account-export-${user.id}-${Date.now()}.json`
  return new Response(JSON.stringify(dump, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
