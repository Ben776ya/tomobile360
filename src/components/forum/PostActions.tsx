'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Edit, Trash2 } from 'lucide-react'
import { deletePost } from '@/lib/actions/forum'

interface PostActionsProps {
  postId: string
  isAuthor: boolean
  isAdmin: boolean
}

export function PostActions({ postId, isAuthor, isAdmin }: PostActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  if (!isAuthor && !isAdmin) {
    return null
  }

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce message?')) {
      return
    }

    setLoading(true)
    const result = await deletePost(postId)

    if (result.error) {
      alert(result.error)
    } else {
      alert('Message supprimé avec succès')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="flex gap-2 ml-auto">
      {isAuthor && (
        <button
          className="text-sm text-muted-foreground hover:text-accent transition"
          disabled
        >
          Modifier
        </button>
      )}
      <button
        onClick={handleDelete}
        disabled={loading}
        className="text-sm text-[#d4921f] hover:text-[#b97316] transition"
      >
        Supprimer
      </button>
    </div>
  )
}
