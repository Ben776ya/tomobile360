import { createClient } from '@/lib/supabase/server'
import { BlogPostForm } from '@/components/admin/BlogPostForm'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { BlogPost } from '@/lib/types/blog'

export default async function EditBlogPostPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()

  const { data: post } = await supabase
    .from('blog_posts')
    .select('id, title, slug, subtitle, meta_description, category, tags, content, hero_image_url, hero_image_caption, author, status, published_at, created_at, updated_at, views, featured')
    .eq('id', params.id)
    .single()

  if (!post) {
    notFound()
  }

  return (
    <>
      <div className="mb-6">
        <Link
          href="/admin/blog"
          className="inline-flex items-center gap-1 text-sm text-dark-300 hover:text-secondary transition mb-3"
        >
          <ChevronLeft className="h-4 w-4" />
          Retour au blog
        </Link>
        <h1 className="text-3xl font-bold text-white">Modifier le post</h1>
        <p className="text-dark-200 mt-1">
          Modifiez le contenu de l&apos;article
        </p>
      </div>
      <BlogPostForm post={post as BlogPost} mode="edit" />
    </>
  )
}
