import { ArticleForm } from '@/components/admin/ArticleForm'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewArticlePage() {
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
        <h1 className="text-3xl font-bold text-white">Nouvel article</h1>
        <p className="text-dark-200 mt-1">
          Rédigez votre article en Markdown ou importez un fichier .md
        </p>
      </div>
      <ArticleForm mode="create" />
    </>
  )
}
