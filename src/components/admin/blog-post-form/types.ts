/**
 * Form-state shape consumed by useForm<BlogPostFormValues>().
 *
 * Images (single, and galleries) live inside `content` as Markdown; the
 * submit payload derives the blog_images bookkeeping rows from it. UI-only
 * state (loading/error/success, editor mode, dialogs) stays in local state.
 */
export interface BlogPostFormValues {
  // Metadata
  title: string
  slug: string
  subtitle: string
  meta_description: string
  category: string
  author: string

  // Tags (array — manipulated via a chip editor)
  tags: string[]

  // Hero
  hero_image_url: string
  hero_image_caption: string

  // Content (Markdown, written by the ArticleEditor)
  content: string

  // Publishing flags
  featured: boolean
}
