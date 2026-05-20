import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { checkAdminApi as checkAdmin } from '@/lib/auth/check-admin'
import { extractInternalLinks } from '../../../../../../scripts/lib/extract-internal-links'
import { validateInternalHref } from '../../../../../../scripts/lib/validate-route'

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

    // Reject any content update that contains broken internal links —
    // mirrors the POST handler validator so admins can't introduce broken
    // hrefs via edit after a clean creation.
    if (typeof content === 'string') {
      const brokenHrefs: string[] = []
      for (const href of extractInternalLinks(content)) {
        const result = validateInternalHref(href)
        if (result.isInternal && !result.valid) brokenHrefs.push(href)
      }
      if (brokenHrefs.length > 0) {
        return NextResponse.json(
          {
            error: 'Liens internes invalides détectés',
            broken_hrefs: brokenHrefs,
          },
          { status: 400 },
        )
      }
    }

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

    // Sync inline images: delete old, insert new
    const inlineImages = body.inline_images
    if (inlineImages && Array.isArray(inlineImages)) {
      await supabase
        .from('blog_images')
        .delete()
        .eq('blog_post_id', params.id)

      if (inlineImages.length > 0) {
        const imageRows = inlineImages.map((img: {
          image_url: string
          alt_text: string | null
          caption: string | null
          display_order: number
          size: string
          float_position: string
        }) => ({
          blog_post_id: params.id,
          image_url: img.image_url,
          alt_text: img.alt_text,
          caption: img.caption,
          display_order: img.display_order,
          size: img.size || 'full',
          float_position: img.float_position || 'none',
        }))

        const { error: imgError } = await supabase.from('blog_images').insert(imageRows)
        if (imgError) console.error('Failed to sync blog images:', imgError.message)
      }
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
