'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createPromotion, updatePromotion } from '@/lib/actions/admin'
import { Loader2, Car, Search, Check } from 'lucide-react'
import type { Promotion } from '@/lib/types'

interface VehicleOption {
  id: string
  brand_name: string
  model_name: string
  year: number
  images: string[] | null
  price_min: number | null
}

interface PromotionFormProps {
  vehicles: VehicleOption[]
  promotion?: Promotion & { vehicles_new?: { id: string; brands?: { name: string }; models?: { name: string }; images?: string[] } }
  mode: 'create' | 'edit'
}

export function PromotionForm({ vehicles, promotion, mode }: PromotionFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [vehicleId, setVehicleId] = useState(promotion?.vehicle_id || '')
  const [title, setTitle] = useState(promotion?.title || '')
  const [description, setDescription] = useState(promotion?.description || '')
  const [discountPercentage, setDiscountPercentage] = useState(promotion?.discount_percentage ? String(promotion.discount_percentage) : '')
  const [discountAmount, setDiscountAmount] = useState(promotion?.discount_amount || '')
  const [validFrom, setValidFrom] = useState(
    promotion?.valid_from ? new Date(promotion.valid_from).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  )
  const [validUntil, setValidUntil] = useState(
    promotion?.valid_until ? new Date(promotion.valid_until).toISOString().split('T')[0] : ''
  )
  const [terms, setTerms] = useState(promotion?.terms || '')
  const [isActive, setIsActive] = useState(promotion?.is_active ?? true)

  const [searchQuery, setSearchQuery] = useState('')
  const [showVehicleList, setShowVehicleList] = useState(false)

  const filteredVehicles = vehicles.filter(v => {
    const q = searchQuery.toLowerCase()
    return `${v.brand_name} ${v.model_name} ${v.year}`.toLowerCase().includes(q)
  })

  const selectedVehicle = vehicles.find(v => v.id === vehicleId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (!vehicleId) {
      setError('Veuillez sélectionner un véhicule')
      setLoading(false)
      return
    }

    if (!title) {
      setError('Le titre est obligatoire')
      setLoading(false)
      return
    }

    if (!validUntil) {
      setError('La date de fin est obligatoire')
      setLoading(false)
      return
    }

    const numOrNull = (val: any) => {
      const n = Number(val)
      return val !== '' && !isNaN(n) && n > 0 ? n : undefined
    }

    const promoData = {
      vehicle_id: vehicleId,
      title,
      description: description || undefined,
      discount_percentage: numOrNull(discountPercentage),
      discount_amount: numOrNull(discountAmount),
      valid_from: new Date(validFrom).toISOString(),
      valid_until: new Date(validUntil).toISOString(),
      terms: terms || undefined,
      is_active: isActive,
    }

    let result
    if (mode === 'create') {
      result = await createPromotion(promoData)
    } else {
      result = await updatePromotion(promotion!.id, promoData)
    }

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setSuccess(mode === 'create' ? 'Promotion créée avec succès!' : 'Promotion modifiée avec succès!')
    setLoading(false)

    setTimeout(() => {
      router.push('/admin/promotions')
      router.refresh()
    }, 1000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Vehicle Selection */}
      <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg shadow-dark-card border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Véhicule concerné *</h3>

        {selectedVehicle && (
          <div className="flex items-center gap-4 p-4 bg-secondary/10 rounded-lg mb-4 border border-secondary/20">
            <div className="relative w-20 h-14 bg-dark-600/50 rounded overflow-hidden flex-shrink-0">
              {selectedVehicle.images?.[0] ? (
                <Image src={selectedVehicle.images[0]} alt="Vehicle" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Car className="h-6 w-6 text-dark-300" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-white">
                {selectedVehicle.brand_name} {selectedVehicle.model_name}
              </p>
              <p className="text-sm text-dark-300">{selectedVehicle.year}</p>
            </div>
            <Check className="h-5 w-5 text-green-400" />
          </div>
        )}

        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-300" />
              <Input
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowVehicleList(true) }}
                onFocus={() => setShowVehicleList(true)}
                placeholder="Rechercher un véhicule..."
                className="pl-10 bg-dark-700/80 border-white/10 text-white placeholder-dark-400 focus:ring-secondary/50"
              />
            </div>
          </div>

          {showVehicleList && (
            <div className="absolute z-10 w-full mt-1 bg-dark-700 border border-white/10 rounded-lg shadow-dark-elevated max-h-60 overflow-y-auto">
              {filteredVehicles.length > 0 ? filteredVehicles.map(v => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => { setVehicleId(v.id); setShowVehicleList(false); setSearchQuery('') }}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition text-left ${vehicleId === v.id ? 'bg-secondary/10' : ''}`}
                >
                  <div className="relative w-12 h-8 bg-dark-600/50 rounded overflow-hidden flex-shrink-0">
                    {v.images?.[0] ? (
                      <Image src={v.images[0]} alt="" fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Car className="h-3 w-3 text-dark-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{v.brand_name} {v.model_name}</p>
                    <p className="text-xs text-dark-300">{v.year}</p>
                  </div>
                  {vehicleId === v.id && <Check className="h-4 w-4 text-green-400 flex-shrink-0" />}
                </button>
              )) : (
                <div className="px-4 py-3 text-sm text-dark-300 text-center">
                  Aucun véhicule trouvé
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Promotion Details */}
      <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg shadow-dark-card border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Détails de la promotion</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="promoTitle" className="text-dark-100">Titre *</Label>
            <Input
              id="promoTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex: Offre spéciale été 2025"
              className="mt-1 bg-dark-700/80 border-white/10 text-white placeholder-dark-400 focus:ring-secondary/50"
              required
            />
          </div>
          <div>
            <Label htmlFor="promoDesc" className="text-dark-100">Description</Label>
            <textarea
              id="promoDesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description de la promotion..."
              className="mt-1 flex w-full rounded-md border border-white/10 bg-dark-700/80 px-3 py-2 text-sm text-white placeholder-dark-400 min-h-[80px] resize-y focus:ring-secondary/50 focus:ring-2 focus:outline-none"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-dark-100">Réduction (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(e.target.value)}
                placeholder="ex: 15"
                className="mt-1 bg-dark-700/80 border-white/10 text-white placeholder-dark-400 focus:ring-secondary/50"
              />
            </div>
            <div>
              <Label className="text-dark-100">Réduction (montant DH)</Label>
              <Input
                type="number"
                min={0}
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
                placeholder="Optionnel"
                className="mt-1 bg-dark-700/80 border-white/10 text-white placeholder-dark-400 focus:ring-secondary/50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Period & Status */}
      <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg shadow-dark-card border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Période et statut</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label className="text-dark-100">Date de début</Label>
            <Input
              type="date"
              value={validFrom}
              onChange={(e) => setValidFrom(e.target.value)}
              className="mt-1 bg-dark-700/80 border-white/10 text-white focus:ring-secondary/50"
            />
          </div>
          <div>
            <Label className="text-dark-100">Date de fin *</Label>
            <Input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="mt-1 bg-dark-700/80 border-white/10 text-white focus:ring-secondary/50"
              required
            />
          </div>
        </div>
        <div>
          <Label className="text-dark-100">Conditions</Label>
          <textarea
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            placeholder="Conditions applicables..."
            className="mt-1 flex w-full rounded-md border border-white/10 bg-dark-700/80 px-3 py-2 text-sm text-white placeholder-dark-400 min-h-[60px] resize-y focus:ring-secondary/50 focus:ring-2 focus:outline-none"
            rows={2}
          />
        </div>
        <div className="mt-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-white/10 h-4 w-4"
            />
            <span className="text-sm text-dark-100">Promotion active</span>
          </label>
        </div>
      </div>

      {/* Error/Success */}
      {error && (
        <div className="bg-[#78350f]/30 border border-[#32B75C]/30 text-[#32B75C] text-sm px-4 py-3 rounded-lg">{error}</div>
      )}
      {success && (
        <div className="bg-green-900/30 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-lg">{success}</div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={loading} className="px-8 shadow-dark-card hover:shadow-dark-elevated hover:-translate-y-0.5 transition-all duration-300">
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {mode === 'create' ? 'Création...' : 'Modification...'}
            </span>
          ) : (
            mode === 'create' ? 'Créer la promotion' : 'Enregistrer les modifications'
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/admin/promotions')} className="shadow-dark-card hover:shadow-dark-elevated transition-all duration-300 border-white/10 text-dark-200 hover:text-white hover:bg-dark-600/50">
          Annuler
        </Button>
      </div>
    </form>
  )
}
