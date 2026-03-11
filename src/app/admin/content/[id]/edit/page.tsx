import { createClient } from '@/lib/supabase/server'
import { ArticleForm } from '@/components/admin/ArticleForm'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function EditArticlePage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!article) {
    notFound()
  }

  return (
    <>
      <div className="mb-6">
        <Link
          href="/admin/content"
          className="inline-flex items-center gap-1 text-sm text-dark-300 hover:text-secondary transition mb-3"
        >
          <ChevronLeft className="h-4 w-4" />
          Retour au contenu
        </Link>
        <h1 className="text-3xl font-bold text-white">Modifier l&apos;article</h1>
        <p className="text-dark-200 mt-1">
          Modifiez le contenu de l&apos;article
        </p>
      </div>
      <ArticleForm article={article} mode="edit" />
    </>
  )
}
