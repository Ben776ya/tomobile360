'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, Eye } from 'lucide-react'
import { deleteArticle, deleteVideo } from '@/lib/actions/admin'

interface ContentActionsProps {
  itemId: string
  type: 'article' | 'video'
  slug?: string
}

export function ContentActions({ itemId, type, slug }: ContentActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ce ${type === 'article' ? 'article' : 'vidéo'}?`)) {
      return
    }

    setLoading(true)

    const result = type === 'article'
      ? await deleteArticle(itemId)
      : await deleteVideo(itemId)

    if (result.error) {
      alert(result.error)
    } else {
      alert('Supprimé avec succès')
      router.refresh()
    }
    setLoading(false)
  }

  const viewUrl = type === 'article' ? `/actu/${slug}` : `/videos/${itemId}`

  return (
    <div className="flex items-center justify-end gap-2">
      <a href={viewUrl} target="_blank" rel="noopener noreferrer">
        <Button variant="ghost" size="sm" className="shadow-sm border border-border hover:shadow-md hover:bg-primary/5 hover:text-primary">
          <Eye className="h-4 w-4" />
        </Button>
      </a>
      {type === 'article' && (
        <Link href={`/admin/content/${itemId}/edit`}>
          <Button variant="ghost" size="sm" className="shadow-sm border border-border hover:shadow-md hover:bg-primary/5 hover:text-primary">
            <Edit className="h-4 w-4" />
          </Button>
        </Link>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        disabled={loading}
        className="shadow-sm border border-border hover:shadow-md hover:bg-[#fef3c7] hover:border-[#fde68a]"
      >
        <Trash2 className="h-4 w-4 text-[#d4921f]" />
      </Button>
    </div>
  )
}
