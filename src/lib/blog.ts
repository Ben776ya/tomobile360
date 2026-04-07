import { createClient } from '@/lib/supabase/server'
import type { BlogPost, BlogListItem, BlogCategory, BlogImage } from '@/lib/types/blog'

const LIST_COLUMNS = 'id, title, slug, subtitle, category, tags, hero_image_url, author, published_at, views, featured' as const

export async function getPublishedPosts(
  category?: string,
  limit = 18,
  offset = 0,
): Promise<{ posts: BlogListItem[]; count: number }> {
  const supabase = await createClient()

  let query = supabase
    .from('blog_posts')
    .select(LIST_COLUMNS, { count: 'exact' })
    .eq('status', 'published')

  if (category) {
    query = query.eq('category', category)
  }

  const { data, count, error } = await query
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error

  return { posts: (data as BlogListItem[]) ?? [], count: count ?? 0 }
}

export async function getPostBySlug(
  slug: string,
): Promise<(BlogPost & { images: BlogImage[] }) | null> {
  const supabase = await createClient()

  const { data: post, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error || !post) return null

  const { data: images } = await supabase
    .from('blog_images')
    .select('id, blog_post_id, image_url, alt_text, caption, display_order, created_at')
    .eq('blog_post_id', post.id)
    .order('display_order', { ascending: true })

  return { ...(post as BlogPost), images: (images as BlogImage[]) ?? [] }
}

export async function getFeaturedPost(): Promise<BlogListItem | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('blog_posts')
    .select(LIST_COLUMNS)
    .eq('status', 'published')
    .eq('featured', true)
    .order('published_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) return null
  return data as BlogListItem
}

export async function getRelatedPosts(
  postId: string,
  category: string,
  limit = 3,
): Promise<BlogListItem[]> {
  const supabase = await createClient()

  // Try same category first
  const { data, error } = await supabase
    .from('blog_posts')
    .select(LIST_COLUMNS)
    .eq('status', 'published')
    .eq('category', category)
    .neq('id', postId)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) return []
  const posts = (data as BlogListItem[]) ?? []

  // Fall back to recent posts from any category if not enough same-category results
  if (posts.length < limit) {
    const excludeIds = [postId, ...posts.map((p) => p.id)]
    const { data: fallback } = await supabase
      .from('blog_posts')
      .select(LIST_COLUMNS)
      .eq('status', 'published')
      .not('id', 'in', `(${excludeIds.join(',')})`)
      .order('published_at', { ascending: false })
      .limit(limit - posts.length)

    if (fallback) {
      posts.push(...(fallback as BlogListItem[]))
    }
  }

  return posts
}

export async function incrementViews(postId: string): Promise<void> {
  const supabase = await createClient()
  void supabase.rpc('increment_blog_post_views', { post_id: postId })
}

export async function getCategories(): Promise<BlogCategory[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('blog_posts')
    .select('category')
    .eq('status', 'published')

  if (error || !data) return []

  const counts: Record<string, number> = {}
  for (const row of data) {
    counts[row.category] = (counts[row.category] || 0) + 1
  }

  return Object.entries(counts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
}
