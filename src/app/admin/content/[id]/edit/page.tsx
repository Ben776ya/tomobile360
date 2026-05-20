import { createClient } from '@/lib/supabase/server'
import { ArticleForm } from '@/components/admin/ArticleForm'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { toStringArray } from '@/lib/json-utils'
import type { Article } from '@/lib/types'
import type { Tables } from '@/lib/database.types'

export default async function EditArticlePage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  const { data: row } = await supabase
    .from('articles')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!row) {
    notFound()
  }

  // articles.tags is stored as `Json | null` in Postgres but the application
  // treats it as `string[] | null`. Narrow it explicitly so the value the
  // form receives matches our domain type.
  const dbRow: Tables<'articles'> = row
  const article: Article = {
    ...dbRow,
    tags: toStringArray(dbRow.tags),
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
