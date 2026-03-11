'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, Power } from 'lucide-react'
import { deletePromotion, togglePromotionStatus } from '@/lib/actions/admin'

interface PromotionActionsProps {
  promotionId: string
  isActive: boolean
}

export function PromotionActions({ promotionId, isActive }: PromotionActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette promotion?')) {
      return
    }

    setLoading(true)
    const result = await deletePromotion(promotionId)

    if (result.error) {
      alert(result.error)
    } else {
      alert('Promotion supprimée avec succès')
      router.refresh()
    }
    setLoading(false)
  }

  const handleToggleStatus = async () => {
    setLoading(true)
    const result = await togglePromotionStatus(promotionId, !isActive)

    if (result.error) {
      alert(result.error)
    } else {
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggleStatus}
        disabled={loading}
        className={`shadow-sm border hover:shadow-md transition-all ${isActive ? 'bg-green-100 border-green-300 hover:bg-green-200' : 'bg-gray-50 border-border hover:bg-gray-100'}`}
      >
        <Power className={`h-4 w-4 ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
      </Button>
      <Link href={`/admin/promotions/${promotionId}/edit`}>
        <Button variant="ghost" size="sm" className="shadow-sm border border-border hover:shadow-md hover:bg-primary/5 hover:text-primary transition-all">
          <Edit className="h-4 w-4" />
        </Button>
      </Link>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        disabled={loading}
        className="shadow-sm border border-border hover:shadow-md hover:bg-[#fef3c7] hover:border-[#fde68a] transition-all"
      >
        <Trash2 className="h-4 w-4 text-[#d4921f]" />
      </Button>
    </div>
  )
}
