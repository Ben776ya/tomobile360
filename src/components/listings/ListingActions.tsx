'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, Check, RotateCcw } from 'lucide-react'
import { deleteUsedListing, markAsSold, toggleListingStatus } from '@/lib/actions/listings'

interface ListingActionsProps {
  listingId: string
  status: 'active' | 'sold' | 'inactive'
}

export function ListingActions({ listingId, status }: ListingActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce? Cette action est irréversible.')) {
      return
    }

    setLoading(true)
    const result = await deleteUsedListing(listingId)

    if (result.error) {
      alert(result.error)
    } else {
      alert('Annonce supprimée avec succès')
      router.refresh()
    }
    setLoading(false)
  }

  const handleMarkAsSold = async () => {
    if (!confirm('Marquer ce véhicule comme vendu?')) {
      return
    }

    setLoading(true)
    const result = await markAsSold(listingId)

    if (result.error) {
      alert(result.error)
    } else {
      alert('Véhicule marqué comme vendu')
      router.refresh()
    }
    setLoading(false)
  }

  const handleToggleStatus = async () => {
    setLoading(true)
    const result = await toggleListingStatus(listingId)

    if (result.error) {
      alert(result.error)
    } else {
      alert('Statut de l\'annonce modifié')
      router.refresh()
    }
    setLoading(false)
  }

  if (status === 'sold') {
    return (
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 text-[#d4921f] hover:text-[#b97316] shadow-sm border border-border hover:shadow-md hover:bg-[#fef3c7] hover:border-[#fde68a] transition-all"
          onClick={handleDelete}
          disabled={loading}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Supprimer
        </Button>
      </div>
    )
  }

  if (status === 'inactive') {
    return (
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 shadow-sm border border-border hover:shadow-md hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all"
          onClick={handleToggleStatus}
          disabled={loading}
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Réactiver
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-[#d4921f] hover:text-[#b97316] shadow-sm border border-border hover:shadow-md hover:bg-[#fef3c7] hover:border-[#fde68a] transition-all"
          onClick={handleDelete}
          disabled={loading}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  // Active listings
  return (
    <div className="flex gap-2">
      <Button
        variant="ghost"
        size="sm"
        className="flex-1 shadow-sm border border-border hover:shadow-md hover:bg-primary/5 hover:text-primary transition-all"
        disabled
      >
        <Edit className="h-4 w-4 mr-1" />
        Modifier
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="shadow-sm border border-border hover:shadow-md hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all"
        onClick={handleMarkAsSold}
        disabled={loading}
      >
        <Check className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="text-[#d4921f] hover:text-[#b97316] shadow-sm border border-border hover:shadow-md hover:bg-[#fef3c7] hover:border-[#fde68a] transition-all"
        onClick={handleDelete}
        disabled={loading}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
