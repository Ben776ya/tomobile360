import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function checkAdmin() {
  const supabase = await createClient()
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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 200)
}

// POST — create blog post
export async function POST(request: NextRequest) {
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

    if (!title || !content || !category) {
      return NextResponse.json(
        { error: 'Titre, contenu et catégorie sont obligatoires' },
        { status: 400 },
      )
    }

    const finalSlug = slug || slugify(title)
    const isPublished = status === 'published'

    const { data: post, error } = await supabase
      .from('blog_posts')
      .insert({
        title,
        slug: finalSlug,
        subtitle: subtitle || null,
        meta_description: meta_description || null,
        category,
        tags: tags && tags.length > 0 ? tags : null,
        content,
        hero_image_url: hero_image_url || null,
        hero_image_caption: hero_image_caption || null,
        author: author || 'Rédaction Tomobile360',
        status: isPublished ? 'published' : 'draft',
        published_at: isPublished ? new Date().toISOString() : null,
        featured: featured ?? false,
      })
      .select('id, slug')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Save inline images to blog_images table
    const inlineImages = body.inline_images
    if (inlineImages && Array.isArray(inlineImages) && inlineImages.length > 0 && post) {
      const imageRows = inlineImages.map((img: {
        image_url: string
        alt_text: string | null
        caption: string | null
        display_order: number
        size: string
        float_position: string
      }) => ({
        blog_post_id: post.id,
        image_url: img.image_url,
        alt_text: img.alt_text,
        caption: img.caption,
        display_order: img.display_order,
        size: img.size || 'full',
        float_position: img.float_position || 'none',
      }))

      const { error: imgError } = await supabase.from('blog_images').insert(imageRows)
      if (imgError) console.error('Failed to save blog images:', imgError.message)
    }

    revalidatePath('/actu')
    revalidatePath('/admin/blog')

    return NextResponse.json({ success: true, post }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
  }
}
