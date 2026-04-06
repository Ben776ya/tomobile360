import Link from 'next/link'
import { FileX, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ArticleNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 shadow-card p-8 text-center">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileX className="h-8 w-8 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-primary font-display mb-3">
          Article introuvable
        </h2>
        <p className="text-gray-500 mb-6">
          Cet article n&apos;existe pas ou a été supprimé.
        </p>
        <Link href="/actu">
          <Button className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Retour aux actualités
          </Button>
        </Link>
      </div>
    </div>
  )
}
