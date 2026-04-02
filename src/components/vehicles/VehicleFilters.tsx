'use client'

import { useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Label } from '@/components/ui/label'
import { X, SlidersHorizontal } from 'lucide-react'

interface VehicleFiltersProps {
  brands: Array<{ id: string; name: string }>
  models: Array<{ id: string; brand_id: string; name: string; category: string | null }>
  categories: string[]
  currentFilters: {
    brand?: string
    model?: string
    category?: string
    fuel?: string
    transmission?: string
    priceMin?: string
    priceMax?: string
    sort?: string
  }
}

export function VehicleFilters({
  brands,
  models,
  categories,
}: VehicleFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Read filter values directly from URL
  const brand = searchParams.get('brand') || ''
  const model = searchParams.get('model') || ''
  const category = searchParams.get('category') || ''
  const fuel = searchParams.get('fuel') || ''
  const transmission = searchParams.get('transmission') || ''
  const priceMin = searchParams.get('priceMin') || ''
  const priceMax = searchParams.get('priceMax') || ''
  const sort = searchParams.get('sort') || ''

  // Filter models by selected brand
  const filteredModels = useMemo(() => {
    if (!brand) return []
    return models.filter(m => m.brand_id === brand)
  }, [brand, models])

  const fuelTypes = ['Essence', 'Diesel', 'Hybrid', 'Electric', 'PHEV']
  const transmissionTypes = ['Manual', 'Automatic', 'CVT', 'DCT']
  const priceRanges = [
    { label: 'Moins de 150 000 DH', max: '150000' },
    { label: '150 000 - 250 000 DH', min: '150000', max: '250000' },
    { label: '250 000 - 350 000 DH', min: '250000', max: '350000' },
    { label: '350 000 - 500 000 DH', min: '350000', max: '500000' },
    { label: 'Plus de 500 000 DH', min: '500000' },
  ]

  const sortOptions = [
    { value: 'newest', label: 'Plus récents' },
    { value: 'popular', label: 'Plus populaires' },
    { value: 'price-asc', label: 'Prix croissant' },
    { value: 'price-desc', label: 'Prix décroissant' },
  ]

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    // Reset page when filter changes
    params.delete('page')
    // Clear model when brand changes
    if (key === 'brand') {
      params.delete('model')
    }
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const handlePriceRangeChange = (min?: string, max?: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (min) {
      params.set('priceMin', min)
    } else {
      params.delete('priceMin')
    }
    if (max) {
      params.set('priceMax', max)
    } else {
      params.delete('priceMax')
    }
    params.delete('page')
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const clearPriceRange = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('priceMin')
    params.delete('priceMax')
    params.delete('page')
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const filterLabels: Record<string, (v: string, b: Array<{ id: string; name: string }>) => string> = {
    brand: (v, b) => b.find(br => br.id === v)?.name || v,
    model: (v) => models.find(m => m.id === v)?.name || v,
    category: (v) => v,
    fuel: (v) => v,
    transmission: (v) => v,
    priceMin: (v) => `Min ${parseInt(v).toLocaleString()} DH`,
    priceMax: (v) => `Max ${parseInt(v).toLocaleString()} DH`,
    sort: (v) => {
      const labels: Record<string, string> = { newest: 'Plus récents', popular: 'Plus populaires', 'price-asc': 'Prix ↑', 'price-desc': 'Prix ↓' }
      return labels[v] || v
    },
  }

  const activeFilters = Object.entries({ brand, model, category, fuel, transmission, priceMin, priceMax }).filter(([, v]) => v)

  const selectClass = 'w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:border-[#006EFE] focus:ring-1 focus:ring-[#006EFE]/20 outline-none transition-all duration-200'

  return (
    <div className="bg-white rounded-xl border-0 lg:border border-gray-200 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] overflow-hidden flex flex-col">
      {/* Header - Fixed */}
      <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-[#006EFE]" />
          <h3 className="font-bold text-slate-700">Filtres</h3>
        </div>
      </div>

      {/* Active filter chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 px-6 pt-4 pb-2">
          {activeFilters.map(([key, value]) => (
            <button
              key={key}
              onClick={() => handleFilterChange(key, '')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#006EFE]/10 text-[#006EFE] text-sm font-medium rounded-full border border-[#006EFE]/20 hover:bg-[#006EFE]/20 transition-colors duration-150"
            >
              {filterLabels[key]?.(value, brands) || value}
              <X className="h-3.5 w-3.5" />
            </button>
          ))}
          {activeFilters.length > 1 && (
            <button
              onClick={() => router.replace('?', { scroll: false })}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors duration-150"
            >
              Tout effacer
            </button>
          )}
        </div>
      )}

      {/* Scrollable Content */}
      <div className="overflow-y-auto flex-1 p-6 pt-4 space-y-6 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/40">
        {/* Sort */}
        <div>
          <Label className="mb-2 block">Trier par</Label>
          <select
            value={sort || 'newest'}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className={selectClass}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <hr className="border-gray-200" />

        {/* Brand */}
        <div>
          <Label className="mb-2 block">Marque</Label>
          <select
            value={brand}
            onChange={(e) => handleFilterChange('brand', e.target.value)}
            className={selectClass}
          >
            <option value="">Toutes les marques</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Model — only shown when brand is selected */}
        {brand && filteredModels.length > 0 && (
          <div>
            <Label className="mb-2 block">Modèle</Label>
            <select
              value={model}
              onChange={(e) => handleFilterChange('model', e.target.value)}
              className={selectClass}
            >
              <option value="">Tous les modèles</option>
              {filteredModels.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Category */}
        <div>
          <Label className="mb-2 block">Catégorie</Label>
          <select
            value={category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className={selectClass}
          >
            <option value="">Toutes les catégories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <Label className="mb-2 block">Gamme de prix</Label>
          <div className="space-y-2">
            {priceRanges.map((range, index) => (
              <label key={index} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded-md transition-all duration-200">
                <input
                  type="radio"
                  name="priceRange"
                  checked={
                    priceMin === (range.min || '') && priceMax === (range.max || '')
                  }
                  onChange={() => handlePriceRangeChange(range.min, range.max)}
                  className="w-4 h-4 text-[#006EFE] focus:ring-[#006EFE] cursor-pointer"
                />
                <span className="text-sm text-gray-700">{range.label}</span>
              </label>
            ))}
            {/* Clear price option */}
            {(priceMin || priceMax) && (
              <button
                onClick={clearPriceRange}
                className="flex items-center gap-1.5 text-sm text-[#006EFE] hover:underline pl-2 pt-1"
              >
                <X className="h-3.5 w-3.5" />
                Effacer le prix
              </button>
            )}
          </div>
        </div>

        {/* Fuel Type */}
        <div>
          <Label className="mb-2 block">Carburant</Label>
          <select
            value={fuel}
            onChange={(e) => handleFilterChange('fuel', e.target.value)}
            className={selectClass}
          >
            <option value="">Tous les carburants</option>
            {fuelTypes.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        {/* Transmission */}
        <div>
          <Label className="mb-2 block">Transmission</Label>
          <select
            value={transmission}
            onChange={(e) => handleFilterChange('transmission', e.target.value)}
            className={selectClass}
          >
            <option value="">Toutes les transmissions</option>
            {transmissionTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

      </div>
    </div>
  )
}
