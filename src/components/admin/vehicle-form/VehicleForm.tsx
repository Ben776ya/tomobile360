'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useWatch } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { createVehicle, updateVehicle } from '@/lib/actions/admin/vehicles'
import { createPromotion } from '@/lib/actions/admin/promotions'
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import type { Brand, Model, VehicleNew } from '@/lib/types'

import type { VehicleFormValues } from './types'
import { buildDefaultValues, buildVehiclePayload } from './form-helpers'
import { BasicInfoSection } from './BasicInfoSection'
import { PricingSection } from './PricingSection'
import { VariantsSection } from './VariantsSection'
import { ImageManagerSection } from './ImageManagerSection'
import { FlagsSection } from './FlagsSection'
import { CoupDeCoeurSection } from './CoupDeCoeurSection'
import { EngineSection } from './EngineSection'
import { EfficiencySection } from './EfficiencySection'
import { BodySection } from './BodySection'
import { DimensionsSection } from './DimensionsSection'
import { FeaturesSection } from './FeaturesSection'
import { PromotionSection } from './PromotionSection'

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

function SectionToggle({ label, open, onToggle }: { label: string; open: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center justify-between w-full py-3 px-4 bg-dark-600/50 rounded-lg hover:bg-dark-600/80 transition font-medium text-white text-sm"
    >
      {label}
      {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
    </button>
  )
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

  // Preserve structured-object features (from CSV import) — don't overwrite with an array on edit.
  const [structuredFeatures] = useState<Record<string, unknown> | null>(
    vehicle?.features && !Array.isArray(vehicle.features) ? (vehicle.features as Record<string, unknown>) : null
  )

  const dims = vehicle?.dimensions as Record<string, number> | null | undefined

  // Section-collapsed UI state (transient, not part of submitted data).
  const [showEngine, setShowEngine] = useState(!!vehicle?.horsepower)
  const [showEfficiency, setShowEfficiency] = useState(!!vehicle?.fuel_consumption_combined)
  const [showBody, setShowBody] = useState(!!vehicle?.doors || !!dims)
  const [showFeatures, setShowFeatures] = useState(!!vehicle?.features?.length)
  const [showPromo, setShowPromo] = useState(false)
  const [showDimensions, setShowDimensions] = useState(!!dims)

  const form = useForm<VehicleFormValues>({
    defaultValues: buildDefaultValues(vehicle, defaultBrandId, defaultModelId),
  })
  const { control, handleSubmit, register, setValue } = form

  // Subscribe to brand_id so the model dropdown can react.
  const brandId = useWatch({ control, name: 'brand_id' })

  const filteredModels = useMemo(() => {
    if (!brandId) return []
    return models.filter((m) => m.brand_id === brandId)
  }, [brandId, models])

  const onSubmit = async (values: VehicleFormValues) => {
    setLoading(true)
    setError('')
    setSuccess('')

    if (!values.brand_id || !values.model_id || !values.year) {
      setError('Marque, modèle et année sont obligatoires')
      setLoading(false)
      return
    }

    const vehicleData = buildVehiclePayload(values, structuredFeatures)

    const result: { error?: string; success?: boolean; vehicleId?: string } =
      mode === 'create'
        ? await createVehicle(vehicleData)
        : await updateVehicle(vehicle!.id, vehicleData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    // Optionally create a promotion (create-mode only).
    const promoNum = Number(values.promo_percentage) || 0
    const newVehicleId = result.vehicleId
    if (mode === 'create' && promoNum > 0 && newVehicleId) {
      const promoResult = await createPromotion({
        vehicle_id: newVehicleId,
        title: values.promo_title || `Promotion ${promoNum}%`,
        discount_percentage: promoNum,
        valid_from: new Date().toISOString(),
        valid_until:
          values.promo_valid_until || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <BasicInfoSection
        control={control}
        register={register}
        brands={brands}
        filteredModels={filteredModels}
        defaultBrandId={defaultBrandId}
        defaultModelId={defaultModelId}
        onBrandChange={() => setValue('model_id', '')}
      />

      <PricingSection register={register} />

      <VariantsSection control={control} />

      <ImageManagerSection control={control} onUploadError={(msg) => setError(msg)} />

      <FlagsSection register={register} />

      <CoupDeCoeurSection register={register} />

      <div className="bg-dark-700 rounded-lg shadow-dark-card border border-white/10 overflow-hidden">
        <div className="p-4">
          <SectionToggle label="Moteur et performances" open={showEngine} onToggle={() => setShowEngine(!showEngine)} />
        </div>
        {showEngine && <EngineSection register={register} />}
      </div>

      <div className="bg-dark-700 rounded-lg shadow-dark-card border border-white/10 overflow-hidden">
        <div className="p-4">
          <SectionToggle
            label="Consommation"
            open={showEfficiency}
            onToggle={() => setShowEfficiency(!showEfficiency)}
          />
        </div>
        {showEfficiency && <EfficiencySection register={register} />}
      </div>

      <div className="bg-dark-700 rounded-lg shadow-dark-card border border-white/10 overflow-hidden">
        <div className="p-4">
          <SectionToggle
            label="Carrosserie et intérieur"
            open={showBody}
            onToggle={() => setShowBody(!showBody)}
          />
        </div>
        {showBody && <BodySection register={register} />}
      </div>

      <div className="bg-dark-700 rounded-lg shadow-dark-card border border-white/10 overflow-hidden">
        <div className="p-4">
          <SectionToggle
            label="Dimensions (mm)"
            open={showDimensions}
            onToggle={() => setShowDimensions(!showDimensions)}
          />
        </div>
        {showDimensions && <DimensionsSection register={register} />}
      </div>

      <div className="bg-dark-700 rounded-lg shadow-dark-card border border-white/10 overflow-hidden">
        <div className="p-4">
          <SectionToggle
            label="Équipements et sécurité"
            open={showFeatures}
            onToggle={() => setShowFeatures(!showFeatures)}
          />
        </div>
        {showFeatures && <FeaturesSection control={control} />}
      </div>

      {mode === 'create' && (
        <div className="bg-dark-700 rounded-lg shadow-dark-card border border-white/10 overflow-hidden">
          <div className="p-4">
            <SectionToggle
              label="Promotion (optionnel)"
              open={showPromo}
              onToggle={() => setShowPromo(!showPromo)}
            />
          </div>
          {showPromo && <PromotionSection register={register} />}
        </div>
      )}

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

      <div className="flex items-center gap-4">
        <Button
          type="submit"
          disabled={loading}
          className="px-8 shadow-dark-card hover:shadow-dark-elevated hover:-translate-y-0.5 transition-all duration-300"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {mode === 'create' ? 'Création...' : 'Modification...'}
            </span>
          ) : mode === 'create' ? (
            'Créer le véhicule'
          ) : (
            'Enregistrer les modifications'
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => (onCancel ? onCancel() : router.push('/admin/brands'))}
          className="shadow-dark-card hover:shadow-dark-elevated transition-all duration-300 border-white/10 text-dark-200 hover:text-white hover:bg-dark-600/50"
        >
          Annuler
        </Button>
      </div>
    </form>
  )
}
