'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { addToFavorites, removeFromFavorites } from '@/lib/actions/favorites'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'

interface FavoriteButtonProps {
  vehicleId: string
  vehicleType: 'new' | 'used'
  initialIsFavorite: boolean
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showText?: boolean
}

export function FavoriteButton({
  vehicleId,
  vehicleType,
  initialIsFavorite,
  size = 'icon',
  showText = false,
}: FavoriteButtonProps) {
  const router = useRouter()
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const [loading, setLoading] = useState(false)

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setLoading(true)

    try {
      if (isFavorite) {
        const result = await removeFromFavorites(vehicleId, vehicleType)
        if (result.error) {
          toast({
            title: '❌ Erreur',
            description: result.error,
          })
          return
        }
        setIsFavorite(false)
        toast({
          title: '✓ Succès',
          description: 'Véhicule retiré des favoris',
        })
      } else {
        const result = await addToFavorites(vehicleId, vehicleType)
        if (result.error) {
          if (result.error.includes('connecté')) {
            toast({
              title: '🔒 Connexion requise',
              description: 'Vous devez être connecté pour ajouter aux favoris',
            })
            setTimeout(() => router.push('/login'), 1500)
          } else {
            toast({
              title: '❌ Erreur',
              description: result.error,
            })
          }
          return
        }
        setIsFavorite(true)
        toast({
          title: '✓ Succès',
          description: 'Véhicule ajouté aux favoris',
        })
      }
      router.refresh()
    } catch {
      toast({
        title: '❌ Erreur',
        description: 'Une erreur est survenue',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={handleToggleFavorite}
      disabled={loading}
      className={
        isFavorite
          ? 'text-[#FFC358] hover:text-[#FFC358] hover:bg-[#FFC358]/10 shadow-sm border border-[#FFC358]/30 hover:shadow-md transition-all'
          : 'text-gray-500 shadow-sm border border-gray-200 hover:shadow-md hover:bg-[#FFC358]/10 hover:text-[#FFC358] hover:border-[#FFC358]/30 transition-all'
      }
    >
      <Heart
        className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''} ${showText ? 'mr-2' : ''}`}
      />
      {showText && (isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris')}
    </Button>
  )
}
