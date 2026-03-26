'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, Star, Sparkles, Heart, Tag } from 'lucide-react'
import { deleteVehicle, toggleVehicleBadge, setCoupDeCoeur } from '@/lib/actions/admin'
import type { CoupDeCoeurCategory } from '@/lib/types'

interface VehicleActionsProps {
  vehicleId: string
  vehicleType: 'new' | 'used'
  isPopular?: boolean
  isNewRelease?: boolean
  isCoupDeCoeur?: boolean
  coupDeCoeurCategory?: string | null
  isFeaturedOffer?: boolean
}

const CDC_CATEGORIES: { value: CoupDeCoeurCategory; label: string }[] = [
  { value: 'voiture', label: '🚗 Voiture' },
  { value: 'suv', label: '🏔️ SUV & 4×4' },
  { value: 'pickup', label: '🚛 Pick-up' },
]

export function VehicleActions({
  vehicleId,
  vehicleType,
  isPopular,
  isNewRelease,
  isCoupDeCoeur,
  coupDeCoeurCategory,
  isFeaturedOffer,
}: VehicleActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showCdcMenu, setShowCdcMenu] = useState(false)

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
    if (result.error) alert(result.error)
    else router.refresh()
    setLoading(false)
  }

  const handleToggleNewRelease = async () => {
    setLoading(true)
    const result = await toggleVehicleBadge(vehicleId, 'is_new_release', !isNewRelease)
    if (result.error) alert(result.error)
    else router.refresh()
    setLoading(false)
  }

  const handleToggleFeaturedOffer = async () => {
    setLoading(true)
    const result = await toggleVehicleBadge(vehicleId, 'is_featured_offer', !isFeaturedOffer)
    if (result.error) alert(result.error)
    else router.refresh()
    setLoading(false)
  }

  const handleSetCoupDeCoeur = async (category: CoupDeCoeurCategory) => {
    setLoading(true)
    setShowCdcMenu(false)
    const result = await setCoupDeCoeur(vehicleId, true, category)
    if (result.error) alert(result.error)
    else router.refresh()
    setLoading(false)
  }

  const handleRemoveCoupDeCoeur = async () => {
    setLoading(true)
    const result = await setCoupDeCoeur(vehicleId, false, null)
    if (result.error) alert(result.error)
    else router.refresh()
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
            title="Populaire"
            className={`shadow-sm border border-border hover:shadow-md ${isPopular ? 'bg-yellow-100 border-yellow-300 hover:bg-yellow-200' : 'hover:bg-yellow-50'}`}
          >
            <Star className={`h-4 w-4 ${isPopular ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleNewRelease}
            disabled={loading}
            title="Nouveauté"
            className={`shadow-sm border border-border hover:shadow-md ${isNewRelease ? 'bg-green-100 border-green-300 hover:bg-green-200' : 'hover:bg-green-50'}`}
          >
            <Sparkles className={`h-4 w-4 ${isNewRelease ? 'fill-green-500 text-green-500' : 'text-muted-foreground'}`} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleFeaturedOffer}
            disabled={loading}
            title="Offre Spéciale"
            className={`shadow-sm border border-border hover:shadow-md ${isFeaturedOffer ? 'bg-emerald-100 border-emerald-300 hover:bg-emerald-200' : 'hover:bg-emerald-50'}`}
          >
            <Tag className={`h-4 w-4 ${isFeaturedOffer ? 'fill-emerald-500 text-emerald-500' : 'text-muted-foreground'}`} />
          </Button>

          {/* Coup de Cœur toggle */}
          <div className="relative">
            {isCoupDeCoeur ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveCoupDeCoeur}
                disabled={loading}
                title={`Coup de cœur: ${coupDeCoeurCategory} — cliquer pour retirer`}
                className="bg-pink-100 border-pink-300 hover:bg-pink-200 shadow-sm border"
              >
                <Heart className="h-4 w-4 fill-pink-500 text-pink-500" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCdcMenu(!showCdcMenu)}
                disabled={loading}
                title="Marquer comme Coup de Cœur"
                className="shadow-sm border border-border hover:bg-pink-50 hover:shadow-md"
              >
                <Heart className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
            {showCdcMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 min-w-[170px] py-1">
                <p className="text-xs text-gray-400 px-3 py-1.5 font-semibold border-b border-gray-100 uppercase tracking-wide">
                  Catégorie
                </p>
                {CDC_CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => handleSetCoupDeCoeur(cat.value)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link href={`/admin/vehicles/${vehicleId}/edit`}>
            <Button variant="ghost" size="sm" className="shadow-sm border border-border hover:shadow-md hover:bg-primary/5 hover:text-primary">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
        </>
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
