import type { BlogPost } from '@/lib/types/blog'
import type { BlogPostFormValues } from './types'
import { DEFAULT_AUTHOR } from '@/lib/blog/authors'
import { extractContentImages } from '@/lib/blog/article-blocks'

/**
 * Slug-from-title generator. Mirrors the implementation that lived inline in
 * the original BlogPostForm component. Lower-case, accent-strip, dash-join.
 */
export function slugify(text: string): string {
  // Mirrors the server slugify at src/app/api/admin/blog/route.ts to keep
  // client- and server-generated slugs byte-identical:
  //   lowercase → NFD normalize → strip diacritics → non-alnum→dash
  //   → trim dashes → cap at 200 chars.
  // The diacritic class uses \u-escapes so the file's source encoding can't
  // shift the codepoints under us.
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 200)
}

/**
 * Build the `defaultValues` for useForm() from the optional existing post.
 * Mirrors the original BlogPostForm `useState(post?.x ?? '')` initialisation.
 */
export function buildDefaultValues(post: BlogPost | undefined): BlogPostFormValues {
  return {
    title: post?.title || '',
    slug: post?.slug || '',
    subtitle: post?.subtitle || '',
    meta_description: post?.meta_description || '',
    category: post?.category || '',
    author: post?.author || DEFAULT_AUTHOR,
    tags: post?.tags || [],
    hero_image_url: post?.hero_image_url || '',
    hero_image_caption: post?.hero_image_caption || '',
    content: post?.content || '',
    featured: post?.featured ?? false,
  }
}

/**
 * Convert form values into the JSON payload expected by the
 * POST /api/admin/blog and PUT /api/admin/blog/:id endpoints.
 */
export function buildBlogPostPayload(
  values: BlogPostFormValues,
  status: 'draft' | 'published',
) {
  return {
    title: values.title,
    slug: values.slug || slugify(values.title),
    subtitle: values.subtitle || null,
    meta_description: values.meta_description || null,
    category: values.category,
    tags: values.tags,
    content: values.content,
    hero_image_url: values.hero_image_url || null,
    hero_image_caption: values.hero_image_caption || null,
    author: values.author,
    status,
    featured: values.featured,
    // blog_images mirrors every image in the body (standalone and galleries).
    inline_images: extractContentImages(values.content).map((img, i) => ({
      image_url: img.url,
      alt_text: img.alt || null,
      caption: img.caption || null,
      display_order: i,
      size: img.size,
      float_position: img.float,
    })),
  }
}
