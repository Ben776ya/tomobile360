import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Sign out and return to the homepage. The @supabase/ssr server client clears
// the session cookies during signOut (allowed in a Route Handler).
export async function GET(request: Request) {
  const supabase = createClient()
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL('/', request.url))
}
