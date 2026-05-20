import type { BlogPost } from '@/lib/types/blog'
import type { ManagedImage } from '@/components/admin/BlogImageManager'
import type { BlogPostFormValues } from './types'

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
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 200)
}

type BlogPostWithImages = BlogPost & {
  images?: Array<{
    id: string
    image_url: string
    alt_text: string | null
    caption: string | null
    display_order: number | null
    size: string | null
    float_position: string | null
  }>
}

/**
 * Build the `defaultValues` for useForm() from the optional existing post.
 * Mirrors the original BlogPostForm `useState(post?.x ?? '')` initialisation.
 */
export function buildDefaultValues(
  post: BlogPostWithImages | undefined,
): BlogPostFormValues {
  return {
    title: post?.title || '',
    slug: post?.slug || '',
    subtitle: post?.subtitle || '',
    meta_description: post?.meta_description || '',
    category: post?.category || '',
    author: post?.author || 'Rédaction Tomobile360',
    tags: post?.tags || [],
    hero_image_url: post?.hero_image_url || '',
    hero_image_caption: post?.hero_image_caption || '',
    content: post?.content || '',
    featured: post?.featured ?? false,
    inline_images: post?.images
      ? post.images.map(
          (img): ManagedImage => ({
            id: img.id,
            url: img.image_url,
            alt: img.alt_text || '',
            caption: img.caption || '',
            size: (img.size as ManagedImage['size']) || 'full',
            float: (img.float_position as ManagedImage['float']) || 'none',
          }),
        )
      : [],
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
    inline_images: values.inline_images.map((img, i) => ({
      image_url: img.url,
      alt_text: img.alt || null,
      caption: img.caption || null,
      display_order: i,
      size: img.size,
      float_position: img.float,
    })),
  }
}
