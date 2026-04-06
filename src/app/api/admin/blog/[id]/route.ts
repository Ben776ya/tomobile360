import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function checkAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié', status: 401, supabase }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) return { error: 'Accès non autorisé', status: 403, supabase }
  return { supabase, user }
}

// PUT — update blog post
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await checkAdmin()
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  const { supabase } = auth

  try {
    const body = await request.json()
    const {
      title,
      slug,
      subtitle,
      meta_description,
      category,
      tags,
      content,
      hero_image_url,
      hero_image_caption,
      author,
      status,
      featured,
    } = body

    const isPublished = status === 'published'

    // If publishing for the first time, fetch current to check published_at
    let publishedAt: string | null | undefined
    if (isPublished) {
      const { data: existing } = await supabase
        .from('blog_posts')
        .select('published_at')
        .eq('id', params.id)
        .single()
      // Keep original publish date if already published
      publishedAt = existing?.published_at || new Date().toISOString()
    } else {
      publishedAt = null
    }

    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title
    if (slug !== undefined) updateData.slug = slug
    if (subtitle !== undefined) updateData.subtitle = subtitle || null
    if (meta_description !== undefined) updateData.meta_description = meta_description || null
    if (category !== undefined) updateData.category = category
    if (tags !== undefined) updateData.tags = tags && tags.length > 0 ? tags : null
    if (content !== undefined) updateData.content = content
    if (hero_image_url !== undefined) updateData.hero_image_url = hero_image_url || null
    if (hero_image_caption !== undefined) updateData.hero_image_caption = hero_image_caption || null
    if (author !== undefined) updateData.author = author || 'Rédaction Tomobile360'
    if (status !== undefined) updateData.status = isPublished ? 'published' : 'draft'
    if (publishedAt !== undefined) updateData.published_at = publishedAt
    if (featured !== undefined) updateData.featured = featured

    const { data: post, error } = await supabase
      .from('blog_posts')
      .update(updateData)
      .eq('id', params.id)
      .select('id, slug')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    revalidatePath('/actu')
    revalidatePath(`/actu/${post.slug}`)
    revalidatePath('/admin/blog')

    return NextResponse.json({ success: true, post })
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
  }
}

// DELETE — delete blog post
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await checkAdmin()
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  const { supabase } = auth

  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  revalidatePath('/actu')
  revalidatePath('/admin/blog')

  return NextResponse.json({ success: true })
}
