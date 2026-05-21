import type { ManagedImage } from '@/components/admin/BlogImageManager'

/**
 * Form-state shape consumed by useForm<BlogPostFormValues>().
 *
 * Mirrors the original BlogPostForm useState slots 1:1; only difference is that
 * `inline_images` is now lifted into the form (was a useState in the original
 * orchestrator). UI-only state (loading/error/success/previewMode/activeInsertId)
 * stays in local useState — it's not submitted.
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

  // Content
  content: string

  // Publishing flags
  featured: boolean

  // Inline images (managed via BlogImageManager). Each entry mirrors the
  // ManagedImage shape; the submit handler converts to the DB row shape.
  inline_images: ManagedImage[]
}
