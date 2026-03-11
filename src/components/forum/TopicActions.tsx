'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Edit, Trash2 } from 'lucide-react'
import { deleteTopic } from '@/lib/actions/forum'

interface TopicActionsProps {
  topicId: string
  isAuthor: boolean
  isAdmin: boolean
}

export function TopicActions({ topicId, isAuthor, isAdmin }: TopicActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  if (!isAuthor && !isAdmin) {
    return null
  }

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce sujet? Tous les messages seront également supprimés.')) {
      return
    }

    setLoading(true)
    const result = await deleteTopic(topicId)

    if (result.error) {
      alert(result.error)
      setLoading(false)
    } else {
      alert('Sujet supprimé avec succès')
      router.push('/forum')
    }
  }

  return (
    <div className="flex gap-2">
      {isAuthor && (
        <Button variant="ghost" size="sm" className="shadow-sm border border-border hover:shadow-md hover:bg-primary/5 hover:text-primary transition-all" disabled>
          <Edit className="h-4 w-4 mr-1" />
          Modifier
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        disabled={loading}
        className="text-[#d4921f] hover:text-[#b97316] shadow-sm border border-border hover:shadow-md hover:bg-[#fef3c7] hover:border-[#fde68a] transition-all"
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Supprimer
      </Button>
    </div>
  )
}
