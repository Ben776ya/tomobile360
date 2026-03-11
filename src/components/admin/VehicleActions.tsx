'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, Star, Sparkles } from 'lucide-react'
import { deleteVehicle, toggleVehicleBadge } from '@/lib/actions/admin'

interface VehicleActionsProps {
  vehicleId: string
  vehicleType: 'new' | 'used'
  isPopular?: boolean
  isNewRelease?: boolean
}

export function VehicleActions({
  vehicleId,
  vehicleType,
  isPopular,
  isNewRelease,
}: VehicleActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce véhicule?')) {
      return
    }

    setLoading(true)
    const result = await deleteVehicle(vehicleId, vehicleType)

    if (result.error) {
      alert(result.error)
    } else {
      alert('Véhicule supprimé avec succès')
      router.refresh()
    }
    setLoading(false)
  }

  const handleTogglePopular = async () => {
    setLoading(true)
    const result = await toggleVehicleBadge(vehicleId, 'is_popular', !isPopular)

    if (result.error) {
      alert(result.error)
    } else {
      router.refresh()
    }
    setLoading(false)
  }

  const handleToggleNewRelease = async () => {
    setLoading(true)
    const result = await toggleVehicleBadge(vehicleId, 'is_new_release', !isNewRelease)

    if (result.error) {
      alert(result.error)
    } else {
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {vehicleType === 'new' && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleTogglePopular}
            disabled={loading}
            className={`shadow-sm border border-border hover:shadow-md ${isPopular ? 'bg-yellow-100 border-yellow-300 hover:bg-yellow-200' : 'hover:bg-yellow-50'}`}
          >
            <Star className={`h-4 w-4 ${isPopular ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleNewRelease}
            disabled={loading}
            className={`shadow-sm border border-border hover:shadow-md ${isNewRelease ? 'bg-green-100 border-green-300 hover:bg-green-200' : 'hover:bg-green-50'}`}
          >
            <Sparkles className={`h-4 w-4 ${isNewRelease ? 'fill-green-500 text-green-500' : 'text-muted-foreground'}`} />
          </Button>
        </>
      )}
      {vehicleType === 'new' && (
        <Link href={`/admin/vehicles/${vehicleId}/edit`}>
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
