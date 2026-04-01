'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'

export default function ValuationPage() {
  const [brands, setBrands] = useState<any[]>([])
  const [models, setModels] = useState<any[]>([])
  const [formData, setFormData] = useState({
    brand_id: '',
    model_id: '',
    year: '',
    mileage: '',
    condition: '',
  })
  const [estimation, setEstimation] = useState<{
    min: number
    max: number
    average: number
  } | null>(null)

  useEffect(() => {
    fetchBrands()
  }, [])

  useEffect(() => {
    if (formData.brand_id) {
      fetchModels(formData.brand_id)
    }
  }, [formData.brand_id])

  const fetchBrands = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('brands').select('id, name').order('name')
    if (data) setBrands(data)
  }

  const fetchModels = async (brandId: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('models')
      .select('id, name')
      .eq('brand_id', brandId)
      .order('name')
    if (data) setModels(data)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setEstimation(null)
  }

  const calculateEstimation = async () => {
    if (!formData.brand_id || !formData.model_id || !formData.year || !formData.mileage || !formData.condition) {
      alert('Veuillez remplir tous les champs')
      return
    }

    const supabase = createClient()

    // Fetch similar vehicles from database
    const { data: similarVehicles } = await supabase
      .from('vehicles_used')
      .select('price, year, mileage')
      .eq('brand_id', formData.brand_id)
      .eq('model_id', formData.model_id)
      .gte('year', parseInt(formData.year) - 2)
      .lte('year', parseInt(formData.year) + 2)
      .eq('is_active', true)

    if (similarVehicles && similarVehicles.length > 0) {
      // Calculate based on real data
      const prices = similarVehicles.map((v) => v.price)
      const min = Math.min(...prices)
      const max = Math.max(...prices)
      const average = prices.reduce((a, b) => a + b, 0) / prices.length

      setEstimation({ min, max, average })
    } else {
      // Calculate based on depreciation algorithm
      const currentYear = new Date().getFullYear()
      const vehicleAge = currentYear - parseInt(formData.year)
      const mileage = parseInt(formData.mileage)

      // Base price estimation (simplified)
      let basePrice = 200000 // Default base price

      // Depreciation by year (15% per year for first 5 years, 10% after)
      let depreciationRate = vehicleAge <= 5 ? 0.15 : 0.10
      let depreciation = Math.pow(1 - depreciationRate, vehicleAge)

      // Depreciation by mileage (reduce price by 1% per 10,000 km)
      let mileageDepreciation = Math.max(0, 1 - (mileage / 1000000))

      // Condition multiplier
      const conditionMultipliers: { [key: string]: number } = {
        'Excellent': 1.1,
        'Très Bon': 1.0,
        'Bon': 0.9,
        'Acceptable': 0.75,
      }
      const conditionMultiplier = conditionMultipliers[formData.condition] || 1.0

      // Calculate estimated price
      const estimatedPrice = basePrice * depreciation * mileageDepreciation * conditionMultiplier

      setEstimation({
        min: Math.round(estimatedPrice * 0.85),
        max: Math.round(estimatedPrice * 1.15),
        average: Math.round(estimatedPrice),
      })
    }
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/occasion"
            className="inline-flex items-center gap-2 text-secondary hover:text-secondary-400 mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            Retour aux annonces
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-700 mb-2">
            Estimez votre Véhicule
          </h1>
          <p className="text-gray-600">
            Obtenez une estimation gratuite de la valeur de votre voiture d&apos;occasion
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-card border border-gray-100 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                <Calculator className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-700">Outil d&apos;estimation</h2>
                <p className="text-sm text-gray-500">
                  Remplissez les informations ci-dessous
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Brand */}
              <div>
                <Label htmlFor="brand">Marque *</Label>
                <select
                  id="brand"
                  value={formData.brand_id}
                  onChange={(e) => handleChange('brand_id', e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-white text-gray-900 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary/50 placeholder-gray-400"
                  required
                >
                  <option value="">Sélectionnez une marque</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Model */}
              <div>
                <Label htmlFor="model">Modèle *</Label>
                <select
                  id="model"
                  value={formData.model_id}
                  onChange={(e) => handleChange('model_id', e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-white text-gray-900 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary/50 placeholder-gray-400"
                  disabled={!formData.brand_id}
                  required
                >
                  <option value="">Sélectionnez un modèle</option>
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year & Mileage */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="year">Année *</Label>
                  <select
                    id="year"
                    value={formData.year}
                    onChange={(e) => handleChange('year', e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-white text-gray-900 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary/50 placeholder-gray-400"
                    required
                  >
                    <option value="">Sélectionnez</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="mileage">Kilométrage *</Label>
                  <Input
                    id="mileage"
                    type="number"
                    placeholder="Ex: 50000"
                    value={formData.mileage}
                    onChange={(e) => handleChange('mileage', e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              {/* Condition */}
              <div>
                <Label htmlFor="condition">État du véhicule *</Label>
                <select
                  id="condition"
                  value={formData.condition}
                  onChange={(e) => handleChange('condition', e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-white text-gray-900 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary/50 placeholder-gray-400"
                  required
                >
                  <option value="">Sélectionnez</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Très Bon">Très Bon</option>
                  <option value="Bon">Bon</option>
                  <option value="Acceptable">Acceptable</option>
                </select>
              </div>

              {/* Calculate Button */}
              <Button onClick={calculateEstimation} className="w-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300" size="lg">
                Calculer l&apos;estimation
              </Button>

              {/* Results */}
              {estimation && (
                <div className="mt-8 p-6 bg-secondary/10 border border-secondary/20 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 text-center text-slate-700">
                    Estimation de votre véhicule
                  </h3>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-1">Prix minimum</p>
                      <p className="text-lg font-bold text-secondary">
                        {formatPrice(estimation.min)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-1">Prix moyen</p>
                      <p className="text-2xl font-bold text-secondary">
                        {formatPrice(estimation.average)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-1">Prix maximum</p>
                      <p className="text-lg font-bold text-secondary">
                        {formatPrice(estimation.max)}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 text-center mb-4">
                    Cette estimation est basée sur les données du marché et l&apos;état de votre véhicule.
                    Le prix réel peut varier selon la demande et d&apos;autres facteurs.
                  </p>

                  <div className="text-center">
                    <a
                      href="https://www.m-occaz.ma/vendez-votre-vehicule"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="lg" className="shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">Vendre ma voiture maintenant</Button>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
