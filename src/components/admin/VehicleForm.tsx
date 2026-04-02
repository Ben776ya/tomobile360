'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createVehicle, updateVehicle, createPromotion } from '@/lib/actions/admin'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { Loader2, ChevronDown, ChevronUp, Plus, X, Upload } from 'lucide-react'
import type { Brand, Model, VehicleNew } from '@/lib/types'

interface VehicleFormProps {
  brands: Brand[]
  models: Model[]
  vehicle?: VehicleNew
  mode: 'create' | 'edit'
  onSuccess?: () => void
  onCancel?: () => void
  defaultBrandId?: string
  defaultModelId?: string
}

export function VehicleForm({
  brands,
  models,
  vehicle,
  mode,
  onSuccess,
  onCancel,
  defaultBrandId,
  defaultModelId,
}: VehicleFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Basic info
  const [brandId, setBrandId] = useState(vehicle?.brand_id || defaultBrandId || '')
  const [modelId, setModelId] = useState(vehicle?.model_id || defaultModelId || '')
  const [version, setVersion] = useState(vehicle?.version || '')
  const [year, setYear] = useState(vehicle?.year || new Date().getFullYear())

  // Pricing
  const [priceMin, setPriceMin] = useState(vehicle?.price_min || '')
  const [priceMax, setPriceMax] = useState(vehicle?.price_max || '')

  // Engine
  const [fuelType, setFuelType] = useState(vehicle?.fuel_type || '')
  const [transmission, setTransmission] = useState(vehicle?.transmission || '')
  const [engineSize, setEngineSize] = useState(vehicle?.engine_size || '')
  const [cylinders, setCylinders] = useState(vehicle?.cylinders || '')
  const [horsepower, setHorsepower] = useState(vehicle?.horsepower || '')
  const [torque, setTorque] = useState(vehicle?.torque || '')
  const [acceleration, setAcceleration] = useState(vehicle?.acceleration || '')
  const [topSpeed, setTopSpeed] = useState(vehicle?.top_speed || '')

  // Efficiency
  const [fuelCity, setFuelCity] = useState(vehicle?.fuel_consumption_city || '')
  const [fuelHighway, setFuelHighway] = useState(vehicle?.fuel_consumption_highway || '')
  const [fuelCombined, setFuelCombined] = useState(vehicle?.fuel_consumption_combined || '')
  const [co2, setCo2] = useState(vehicle?.co2_emissions || '')

  // Body
  const [doors, setDoors] = useState(vehicle?.doors || '')
  const [seats, setSeats] = useState(vehicle?.seating_capacity || '')
  const [cargo, setCargo] = useState(vehicle?.cargo_capacity || '')
  const [extColor, setExtColor] = useState(vehicle?.exterior_color || '')
  const [intColor, setIntColor] = useState(vehicle?.interior_color || '')

  // Features
  const [features, setFeatures] = useState<string[]>(
    Array.isArray(vehicle?.features) ? vehicle.features : []
  )
  const [safetyFeatures, setSafetyFeatures] = useState<string[]>(
    Array.isArray(vehicle?.safety_features) ? vehicle.safety_features : []
  )
  // Preserve structured features object (from CSV import) — don't overwrite with array on edit
  const [structuredFeatures] = useState<Record<string, unknown> | null>(
    vehicle?.features && !Array.isArray(vehicle.features) ? vehicle.features as Record<string, unknown> : null
  )
  const [newFeature, setNewFeature] = useState('')
  const [newSafety, setNewSafety] = useState('')

  // Images
  const [images, setImages] = useState<string[]>(vehicle?.images || [])
  const [newImageUrl, setNewImageUrl] = useState('')

  // Flags
  const [isAvailable, setIsAvailable] = useState(vehicle?.is_available ?? true)
  const [isPopular, setIsPopular] = useState(vehicle?.is_popular ?? false)
  const [isNewRelease, setIsNewRelease] = useState(vehicle?.is_new_release ?? false)
  const [isComingSoon, setIsComingSoon] = useState(vehicle?.is_coming_soon ?? false)
  const [isFeaturedOffer, setIsFeaturedOffer] = useState(vehicle?.is_featured_offer ?? false)

  // Coup de Cœur
  const [coupDeCoeurReason, setCoupDeCoeurReason] = useState(vehicle?.coup_de_coeur_reason ?? '')

  // Promotion
  const [promoPercentage, setPromoPercentage] = useState('')
  const [promoTitle, setPromoTitle] = useState('')
  const [promoValidUntil, setPromoValidUntil] = useState('')

  // Section toggles
  const [showEngine, setShowEngine] = useState(!!vehicle?.horsepower)
  const [showEfficiency, setShowEfficiency] = useState(!!vehicle?.fuel_consumption_combined)
  const [showBody, setShowBody] = useState(!!vehicle?.doors)
  const [showFeatures, setShowFeatures] = useState(!!(vehicle?.features?.length))
  const [showPromo, setShowPromo] = useState(false)

  // Filter models by selected brand
  const filteredModels = useMemo(() => {
    if (!brandId) return []
    return models.filter(m => m.brand_id === brandId)
  }, [brandId, models])

  const [uploading, setUploading] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    const supabase = createClient()

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const filePath = `vehicles/${fileName}`

      const { error } = await supabase.storage
        .from('images')
        .upload(filePath, file)

      if (error) {
        setError(`Erreur upload: ${error.message}`)
        continue
      }

      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)

      if (urlData?.publicUrl) {
        setImages(prev => [...prev, urlData.publicUrl])
      }
    }

    setUploading(false)
    e.target.value = ''
  }

  const addFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()])
      setNewFeature('')
    }
  }

  const addSafetyFeature = () => {
    if (newSafety.trim()) {
      setSafetyFeatures([...safetyFeatures, newSafety.trim()])
      setNewSafety('')
    }
  }

  const addImage = () => {
    if (newImageUrl.trim()) {
      setImages([...images, newImageUrl.trim()])
      setNewImageUrl('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (!brandId || !modelId || !year) {
      setError('Marque, modèle et année sont obligatoires')
      setLoading(false)
      return
    }

    const numOrNull = (val: any) => {
      const n = Number(val)
      return val !== '' && !isNaN(n) ? n : undefined
    }

    const vehicleData = {
      brand_id: brandId,
      model_id: modelId,
      year: Number(year),
      version: version || undefined,
      price_min: numOrNull(priceMin),
      price_max: numOrNull(priceMax),
      fuel_type: fuelType || undefined,
      transmission: transmission || undefined,
      engine_size: numOrNull(engineSize),
      cylinders: numOrNull(cylinders),
      horsepower: numOrNull(horsepower),
      torque: numOrNull(torque),
      acceleration: numOrNull(acceleration),
      top_speed: numOrNull(topSpeed),
      fuel_consumption_city: numOrNull(fuelCity),
      fuel_consumption_highway: numOrNull(fuelHighway),
      fuel_consumption_combined: numOrNull(fuelCombined),
      co2_emissions: numOrNull(co2),
      doors: numOrNull(doors),
      seating_capacity: numOrNull(seats),
      cargo_capacity: numOrNull(cargo),
      exterior_color: extColor || undefined,
      interior_color: intColor || undefined,
      features: features.length > 0 ? features : (structuredFeatures ?? []),
      safety_features: safetyFeatures,
      images: images,
      is_available: isAvailable,
      is_popular: isPopular,
      is_new_release: isNewRelease,
      is_coming_soon: isComingSoon,
      is_featured_offer: isFeaturedOffer,
      coup_de_coeur_reason: coupDeCoeurReason || null,
    }

    let result: any
    if (mode === 'create') {
      result = await createVehicle(vehicleData)
    } else {
      result = await updateVehicle(vehicle!.id, vehicleData)
    }

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    // Create promotion if percentage > 0 and mode is create
    const promoNum = Number(promoPercentage) || 0
    if (mode === 'create' && promoNum > 0 && result.vehicleId) {
      const promoResult = await createPromotion({
        vehicle_id: result.vehicleId,
        title: promoTitle || `Promotion ${promoNum}%`,
        discount_percentage: promoNum,
        valid_from: new Date().toISOString(),
        valid_until: promoValidUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true,
      })
      if (promoResult.error) {
        setError(`Véhicule créé mais erreur promotion: ${promoResult.error}`)
        setLoading(false)
        return
      }
    }

    setSuccess(mode === 'create' ? 'Véhicule créé avec succès!' : 'Véhicule modifié avec succès!')
    setLoading(false)

    if (onSuccess) {
      setTimeout(() => onSuccess(), 800)
    } else {
      setTimeout(() => {
        router.push('/admin/vehicles')
        router.refresh()
      }, 1000)
    }
  }

  const SectionToggle = ({ label, open, onToggle }: { label: string; open: boolean; onToggle: () => void }) => (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center justify-between w-full py-3 px-4 bg-dark-600/50 rounded-lg hover:bg-dark-600/80 transition font-medium text-white text-sm"
    >
      {label}
      {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
    </button>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info - Always visible */}
      <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg shadow-dark-card border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Informations de base</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!defaultBrandId && (
          <div>
            <Label htmlFor="brand" className="text-dark-100">Marque *</Label>
            <select
              id="brand"
              value={brandId}
              onChange={(e) => { setBrandId(e.target.value); setModelId('') }}
              className="mt-1 flex h-10 w-full rounded-md border border-white/10 bg-dark-700/80 px-3 py-2 text-sm text-white focus:ring-secondary/50 focus:ring-2 focus:outline-none"
              required
            >
              <option value="">Sélectionner une marque</option>
              {brands.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          )}
          {!defaultModelId && (
          <div>
            <Label htmlFor="model" className="text-dark-100">Modèle *</Label>
            <select
              id="model"
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              className="mt-1 flex h-10 w-full rounded-md border border-white/10 bg-dark-700/80 px-3 py-2 text-sm text-white focus:ring-secondary/50 focus:ring-2 focus:outline-none"
              required
              disabled={!brandId}
            >
              <option value="">Sélectionner un modèle</option>
              {filteredModels.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          )}
          <div>
            <Label htmlFor="version" className="text-dark-100">Version</Label>
            <Input
              id="version"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="ex: GT Line, Active..."
              className="mt-1 bg-dark-700/80 border-white/10 text-white placeholder-dark-400 focus:ring-secondary/50"
            />
          </div>
          <div>
            <Label htmlFor="year" className="text-dark-100">Année *</Label>
            <Input
              id="year"
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              min={1990}
              max={2030}
              className="mt-1 bg-dark-700/80 border-white/10 text-white focus:ring-secondary/50"
              required
            />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg shadow-dark-card border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Prix</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="priceMin" className="text-dark-100">Prix minimum (DH)</Label>
            <Input
              id="priceMin"
              type="number"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              placeholder="ex: 150000"
              className="mt-1 bg-dark-700/80 border-white/10 text-white placeholder-dark-400 focus:ring-secondary/50"
            />
          </div>
          <div>
            <Label htmlFor="priceMax" className="text-dark-100">Prix maximum (DH)</Label>
            <Input
              id="priceMax"
              type="number"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              placeholder="ex: 250000"
              className="mt-1 bg-dark-700/80 border-white/10 text-white placeholder-dark-400 focus:ring-secondary/50"
            />
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg shadow-dark-card border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Images</h3>
        <div className="space-y-3">
          {/* File Upload */}
          <div>
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
              <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md border border-white/10 bg-dark-700/80 text-sm text-dark-100 hover:bg-dark-600/50 transition cursor-pointer w-full justify-center">
                {uploading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Upload en cours...</>
                ) : (
                  <><Upload className="h-4 w-4" /> Importer des images</>
                )}
              </span>
            </label>
          </div>
          {/* URL Input (alternative) */}
          <div className="flex gap-2">
            <Input
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Ou coller une URL d'image..."
              className="flex-1 bg-dark-700/80 border-white/10 text-white placeholder-dark-400 focus:ring-secondary/50"
            />
            <Button type="button" variant="outline" onClick={addImage} className="border-white/10 text-dark-200 hover:text-white hover:bg-dark-600/50">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {/* Image List */}
          {images.length > 0 && (
            <div className="space-y-2">
              {images.map((url, i) => (
                <div key={i} className="flex items-center gap-2 bg-dark-600/50 rounded px-3 py-2">
                  <div className="w-10 h-10 rounded overflow-hidden bg-dark-600/50 flex-shrink-0 relative">
                    <Image src={url} alt="" fill className="object-cover" sizes="40px" />
                  </div>
                  <span className="text-sm truncate flex-1 text-dark-200">{url.split('/').pop()}</span>
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((_, j) => j !== i))}
                    className="text-[#32B75C] hover:text-[#fcd34d]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tags/Flags */}
      <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg shadow-dark-card border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Tags et statut</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
              className="rounded border-white/10 h-4 w-4"
            />
            <span className="text-sm text-dark-100">Disponible</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPopular}
              onChange={(e) => setIsPopular(e.target.checked)}
              className="rounded border-white/10 h-4 w-4"
            />
            <span className="text-sm text-dark-100">Populaire</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isNewRelease}
              onChange={(e) => setIsNewRelease(e.target.checked)}
              className="rounded border-white/10 h-4 w-4"
            />
            <span className="text-sm text-dark-100">Nouveauté</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isComingSoon}
              onChange={(e) => setIsComingSoon(e.target.checked)}
              className="rounded border-white/10 h-4 w-4"
            />
            <span className="text-sm text-dark-100">Bientôt disponible</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isFeaturedOffer}
              onChange={(e) => setIsFeaturedOffer(e.target.checked)}
              className="rounded border-white/10 h-4 w-4"
            />
            <span className="text-sm text-dark-100">Offre Spéciale</span>
          </label>
        </div>
      </div>

      {/* Coup de Cœur — editorial reason */}
      <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg shadow-dark-card border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Coup de Cœur</h3>
        <div>
          <label className="block text-sm font-medium text-dark-200 mb-1">
            Raison éditoriale
            <span className="text-dark-400 font-normal ml-1">(affiché sur la page d&apos;accueil)</span>
          </label>
          <textarea
            value={coupDeCoeurReason}
            onChange={(e) => setCoupDeCoeurReason(e.target.value)}
            rows={3}
            placeholder="Ex: Meilleur rapport qualité/prix du segment, finition exemplaire..."
            className="w-full px-3 py-2 bg-dark-700 border border-white/10 rounded-lg text-white placeholder-dark-400 text-sm focus:outline-none focus:border-secondary resize-none"
          />
        </div>
      </div>

      {/* Engine & Performance - Collapsible */}
      <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg shadow-dark-card border border-white/10 overflow-hidden">
        <div className="p-4">
          <SectionToggle label="Moteur et performances" open={showEngine} onToggle={() => setShowEngine(!showEngine)} />
        </div>
        {showEngine && (
          <div className="px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label className="text-dark-100">Carburant</Label>
                <select
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value)}
                  className="mt-1 flex h-10 w-full rounded-md border border-white/10 bg-dark-700/80 px-3 py-2 text-sm text-white focus:ring-secondary/50 focus:ring-2 focus:outline-none"
                >
                  <option value="">--</option>
                  <option value="Essence">Essence</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Hybrid">Hybride</option>
                  <option value="Electric">Électrique</option>
                  <option value="PHEV">PHEV</option>
                </select>
              </div>
              <div>
                <Label className="text-dark-100">Transmission</Label>
                <select
                  value={transmission}
                  onChange={(e) => setTransmission(e.target.value)}
                  className="mt-1 flex h-10 w-full rounded-md border border-white/10 bg-dark-700/80 px-3 py-2 text-sm text-white focus:ring-secondary/50 focus:ring-2 focus:outline-none"
                >
                  <option value="">--</option>
                  <option value="Manual">Manuelle</option>
                  <option value="Automatic">Automatique</option>
                  <option value="CVT">CVT</option>
                  <option value="DCT">DCT</option>
                </select>
              </div>
              <div>
                <Label className="text-dark-100">Cylindrée (L)</Label>
                <Input type="number" step="0.1" value={engineSize} onChange={(e) => setEngineSize(e.target.value)} className="mt-1 bg-dark-700/80 border-white/10 text-white focus:ring-secondary/50" />
              </div>
              <div>
                <Label className="text-dark-100">Cylindres</Label>
                <Input type="number" value={cylinders} onChange={(e) => setCylinders(e.target.value)} className="mt-1 bg-dark-700/80 border-white/10 text-white focus:ring-secondary/50" />
              </div>
              <div>
                <Label className="text-dark-100">Puissance (ch)</Label>
                <Input type="number" value={horsepower} onChange={(e) => setHorsepower(e.target.value)} className="mt-1 bg-dark-700/80 border-white/10 text-white focus:ring-secondary/50" />
              </div>
              <div>
                <Label className="text-dark-100">Couple (Nm)</Label>
                <Input type="number" value={torque} onChange={(e) => setTorque(e.target.value)} className="mt-1 bg-dark-700/80 border-white/10 text-white focus:ring-secondary/50" />
              </div>
              <div>
                <Label className="text-dark-100">0-100 km/h (s)</Label>
                <Input type="number" step="0.1" value={acceleration} onChange={(e) => setAcceleration(e.target.value)} className="mt-1 bg-dark-700/80 border-white/10 text-white focus:ring-secondary/50" />
              </div>
              <div>
                <Label className="text-dark-100">Vitesse max (km/h)</Label>
                <Input type="number" value={topSpeed} onChange={(e) => setTopSpeed(e.target.value)} className="mt-1 bg-dark-700/80 border-white/10 text-white focus:ring-secondary/50" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fuel Efficiency - Collapsible */}
      <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg shadow-dark-card border border-white/10 overflow-hidden">
        <div className="p-4">
          <SectionToggle label="Consommation" open={showEfficiency} onToggle={() => setShowEfficiency(!showEfficiency)} />
        </div>
        {showEfficiency && (
          <div className="px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label className="text-dark-100">Ville (L/100km)</Label>
                <Input type="number" step="0.1" value={fuelCity} onChange={(e) => setFuelCity(e.target.value)} className="mt-1 bg-dark-700/80 border-white/10 text-white focus:ring-secondary/50" />
              </div>
              <div>
                <Label className="text-dark-100">Autoroute (L/100km)</Label>
                <Input type="number" step="0.1" value={fuelHighway} onChange={(e) => setFuelHighway(e.target.value)} className="mt-1 bg-dark-700/80 border-white/10 text-white focus:ring-secondary/50" />
              </div>
              <div>
                <Label className="text-dark-100">Mixte (L/100km)</Label>
                <Input type="number" step="0.1" value={fuelCombined} onChange={(e) => setFuelCombined(e.target.value)} className="mt-1 bg-dark-700/80 border-white/10 text-white focus:ring-secondary/50" />
              </div>
              <div>
                <Label className="text-dark-100">CO2 (g/km)</Label>
                <Input type="number" value={co2} onChange={(e) => setCo2(e.target.value)} className="mt-1 bg-dark-700/80 border-white/10 text-white focus:ring-secondary/50" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Body & Interior - Collapsible */}
      <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg shadow-dark-card border border-white/10 overflow-hidden">
        <div className="p-4">
          <SectionToggle label="Carrosserie et intérieur" open={showBody} onToggle={() => setShowBody(!showBody)} />
        </div>
        {showBody && (
          <div className="px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label className="text-dark-100">Portes</Label>
                <Input type="number" value={doors} onChange={(e) => setDoors(e.target.value)} className="mt-1 bg-dark-700/80 border-white/10 text-white focus:ring-secondary/50" />
              </div>
              <div>
                <Label className="text-dark-100">Places</Label>
                <Input type="number" value={seats} onChange={(e) => setSeats(e.target.value)} className="mt-1 bg-dark-700/80 border-white/10 text-white focus:ring-secondary/50" />
              </div>
              <div>
                <Label className="text-dark-100">Coffre (L)</Label>
                <Input type="number" value={cargo} onChange={(e) => setCargo(e.target.value)} className="mt-1 bg-dark-700/80 border-white/10 text-white focus:ring-secondary/50" />
              </div>
              <div>
                <Label className="text-dark-100">Couleur extérieure</Label>
                <Input value={extColor} onChange={(e) => setExtColor(e.target.value)} className="mt-1 bg-dark-700/80 border-white/10 text-white focus:ring-secondary/50" />
              </div>
              <div>
                <Label className="text-dark-100">Couleur intérieure</Label>
                <Input value={intColor} onChange={(e) => setIntColor(e.target.value)} className="mt-1 bg-dark-700/80 border-white/10 text-white focus:ring-secondary/50" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Features - Collapsible */}
      <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg shadow-dark-card border border-white/10 overflow-hidden">
        <div className="p-4">
          <SectionToggle label="Équipements et sécurité" open={showFeatures} onToggle={() => setShowFeatures(!showFeatures)} />
        </div>
        {showFeatures && (
          <div className="px-6 pb-6 space-y-4">
            <div>
              <Label className="mb-2 block text-dark-100">Équipements</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="ex: Climatisation automatique"
                  className="flex-1 bg-dark-700/80 border-white/10 text-white placeholder-dark-400 focus:ring-secondary/50"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFeature() } }}
                />
                <Button type="button" variant="outline" onClick={addFeature} className="border-white/10 text-dark-200 hover:text-white hover:bg-dark-600/50">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {features.map((f, i) => (
                  <span key={i} className="inline-flex items-center gap-1 bg-secondary/20 text-secondary text-sm px-3 py-1 rounded-full">
                    {f}
                    <button type="button" onClick={() => setFeatures(features.filter((_, j) => j !== i))}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <div>
              <Label className="mb-2 block text-dark-100">Sécurité</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newSafety}
                  onChange={(e) => setNewSafety(e.target.value)}
                  placeholder="ex: ABS, ESP, Airbags..."
                  className="flex-1 bg-dark-700/80 border-white/10 text-white placeholder-dark-400 focus:ring-secondary/50"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSafetyFeature() } }}
                />
                <Button type="button" variant="outline" onClick={addSafetyFeature} className="border-white/10 text-dark-200 hover:text-white hover:bg-dark-600/50">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {safetyFeatures.map((f, i) => (
                  <span key={i} className="inline-flex items-center gap-1 bg-green-900/30 text-green-400 text-sm px-3 py-1 rounded-full">
                    {f}
                    <button type="button" onClick={() => setSafetyFeatures(safetyFeatures.filter((_, j) => j !== i))}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Promotion - Collapsible (only for create mode) */}
      {mode === 'create' && (
        <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg shadow-dark-card border border-white/10 overflow-hidden">
          <div className="p-4">
            <SectionToggle label="Promotion (optionnel)" open={showPromo} onToggle={() => setShowPromo(!showPromo)} />
          </div>
          {showPromo && (
            <div className="px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-dark-100">Réduction (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={promoPercentage}
                    onChange={(e) => setPromoPercentage(e.target.value)}
                    placeholder="0"
                    className="mt-1 bg-dark-700/80 border-white/10 text-white placeholder-dark-400 focus:ring-secondary/50"
                  />
                  <p className="text-xs text-dark-300 mt-1">Vide ou 0 = pas de promotion</p>
                </div>
                <div>
                  <Label className="text-dark-100">Titre de la promotion</Label>
                  <Input
                    value={promoTitle}
                    onChange={(e) => setPromoTitle(e.target.value)}
                    placeholder="ex: Offre de lancement"
                    className="mt-1 bg-dark-700/80 border-white/10 text-white placeholder-dark-400 focus:ring-secondary/50"
                  />
                </div>
                <div>
                  <Label className="text-dark-100">Valide jusqu&apos;au</Label>
                  <Input
                    type="date"
                    value={promoValidUntil}
                    onChange={(e) => setPromoValidUntil(e.target.value)}
                    className="mt-1 bg-dark-700/80 border-white/10 text-white focus:ring-secondary/50"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-900/30 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-900/30 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-lg">
          {success}
        </div>
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
            mode === 'create' ? 'Créer le véhicule' : 'Enregistrer les modifications'
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => onCancel ? onCancel() : router.push('/admin/vehicles')}
          className="shadow-dark-card hover:shadow-dark-elevated transition-all duration-300 border-white/10 text-dark-200 hover:text-white hover:bg-dark-600/50"
        >
          Annuler
        </Button>
      </div>
    </form>
  )
}
