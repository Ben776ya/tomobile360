'use client'

import { useState } from 'react'
import { useController, type Control } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, X } from 'lucide-react'
import type { VehicleFormValues } from './types'

interface FeaturesSectionProps {
  control: Control<VehicleFormValues>
}

export function FeaturesSection({ control }: FeaturesSectionProps) {
  const {
    field: { value: features, onChange: setFeatures },
  } = useController({ control, name: 'features' })
  const {
    field: { value: safetyFeatures, onChange: setSafetyFeatures },
  } = useController({ control, name: 'safety_features' })

  const [newFeature, setNewFeature] = useState('')
  const [newSafety, setNewSafety] = useState('')

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

  return (
    <div className="px-6 pb-6 space-y-4">
      <div>
        <Label className="mb-2 block text-dark-100">Équipements</Label>
        <div className="flex gap-2 mb-2">
          <Input
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
            placeholder="ex: Climatisation automatique"
            className="flex-1 bg-dark-700/80 border-white/10 text-white placeholder-dark-400 focus:ring-secondary/50"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addFeature()
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={addFeature}
            className="border-white/10 text-dark-200 hover:text-white hover:bg-dark-600/50"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {features.map((f, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 bg-secondary/20 text-secondary text-sm px-3 py-1 rounded-full"
            >
              {f}
              <button
                type="button"
                onClick={() => setFeatures(features.filter((_, j) => j !== i))}
              >
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
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addSafetyFeature()
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={addSafetyFeature}
            className="border-white/10 text-dark-200 hover:text-white hover:bg-dark-600/50"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {safetyFeatures.map((f, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 bg-green-900/30 text-green-400 text-sm px-3 py-1 rounded-full"
            >
              {f}
              <button
                type="button"
                onClick={() => setSafetyFeatures(safetyFeatures.filter((_, j) => j !== i))}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
