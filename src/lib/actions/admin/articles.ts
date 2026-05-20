'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { checkAdmin } from '@/lib/auth/check-admin'
import { validateAction, ArticleSchema } from '@/lib/validations'

export async function createArticle(data: {
  title: string
  slug: string
  excerpt: string
  content: string
  featured_image?: string
  category: string
  tags?: string[]
  is_published: boolean
}) {
  const adminCheck = await checkAdmin()
  if (adminCheck.error) return { error: adminCheck.error }

  const validated = validateAction(ArticleSchema, data)
  if (!validated.success) return { error: validated.error }

  const supabase = await createClient()

  const { data: article, error } = await supabase
    .from('articles')
    .insert({
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      featured_image: data.featured_image || null,
      category: data.category.toLowerCase(),
      tags: data.tags || [],
      is_published: data.is_published,
      author_id: adminCheck.user!.id,
      published_at: data.is_published ? new Date().toISOString() : null,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/actu')
  revalidatePath('/admin/content')
  return { success: true, articleId: article.id }
}

export async function updateArticle(id: string, data: {
  title: string
  slug: string
  excerpt: string
  content: string
  featured_image?: string
  category: string
  tags?: string[]
  is_published: boolean
}) {
  const adminCheck = await checkAdmin()
  if (adminCheck.error) return { error: adminCheck.error }

  const validated = validateAction(ArticleSchema, data)
  if (!validated.success) return { error: validated.error }

  const supabase = await createClient()

  const { error } = await supabase
    .from('articles')
    .update({
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      featured_image: data.featured_image || null,
      category: data.category.toLowerCase(),
      tags: data.tags || [],
      is_published: data.is_published,
      published_at: data.is_published ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/actu')
  revalidatePath(`/actu/${data.slug}`)
  revalidatePath('/admin/content')
  return { success: true }
}

export async function deleteArticle(id: string) {
  const adminCheck = await checkAdmin()
  if (adminCheck.error) return { error: adminCheck.error }

  const supabase = await createClient()

  const { error } = await supabase.from('articles').delete().eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/actu')
  revalidatePath('/admin/content')
  return { success: true }
}
