export type BlogPost = {
  id: string
  title: string
  slug: string
  subtitle: string | null
  meta_description: string | null
  category: string
  tags: string[] | null
  content: string
  hero_image_url: string | null
  hero_image_caption: string | null
  author: string
  status: 'draft' | 'published'
  published_at: string | null
  created_at: string
  updated_at: string
  views: number
  featured: boolean
}

export type BlogImage = {
  id: string
  blog_post_id: string
  image_url: string
  alt_text: string | null
  caption: string | null
  display_order: number
  created_at: string
}

export type BlogListItem = Pick<
  BlogPost,
  | 'id'
  | 'title'
  | 'slug'
  | 'subtitle'
  | 'category'
  | 'tags'
  | 'hero_image_url'
  | 'author'
  | 'published_at'
  | 'views'
  | 'featured'
>

export type BlogCategory = {
  category: string
  count: number
}
