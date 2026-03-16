'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { X, SlidersHorizontal } from 'lucide-react'
import type { CoupDeCoeurCategory } from '@/lib/types'

interface CoupsDeCoeurFiltersProps {
  brands: Array<{ id: string; name: string }>
  activeCategory: CoupDeCoeurCategory
  currentFilters: {
    brand?: string
    fuel?: string
    transmission?: string
    priceMin?: string
    priceMax?: string
    sort?: string
  }
}

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
  { value: 'price-asc', label: 'Prix croissant' },
  { value: 'price-desc', label: 'Prix décroissant' },
]

export function CoupsDeCoeurFilters({
  brands,
  activeCategory,
  currentFilters,
}: CoupsDeCoeurFiltersProps) {
  const router = useRouter()
  const [filters, setFilters] = useState(currentFilters)

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handlePriceRangeChange = (min?: string, max?: string) => {
    setFilters(prev => ({ ...prev, priceMin: min, priceMax: max }))
  }

  const applyFilters = () => {
    const params = new URLSearchParams({ categorie: activeCategory })
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') params.set(key, value)
    })
    router.push(`/coups-de-coeur?${params.toString()}`)
  }

  const clearFilters = () => {
    setFilters({})
    router.push(`/coups-de-coeur?categorie=${activeCategory}`)
  }

  const hasActiveFilters = Object.values(filters).some(v => v && v !== '')

  return (
    <div className="bg-white backdrop-blur-sm rounded-lg shadow-card border border-gray-200 sticky top-20 max-h-[calc(100vh-6rem)] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-secondary" />
          <h3 className="font-bold text-slate-700">Filtres</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-secondary flex items-center gap-1 transition-all duration-300"
          >
            <X className="h-4 w-4" />
            Effacer
          </button>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="overflow-y-auto flex-1 p-6 pt-4 space-y-6">
        {/* Sort */}
        <div>
          <Label className="mb-2 block">Trier par</Label>
          <select
            value={filters.sort || 'newest'}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary hover:border-secondary/50 transition-all duration-300 cursor-pointer"
          >
            {sortOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <hr className="border-gray-200" />

        {/* Brand */}
        <div>
          <Label className="mb-2 block">Marque</Label>
          <select
            value={filters.brand || ''}
            onChange={(e) => handleFilterChange('brand', e.target.value)}
            className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary hover:border-secondary/50 transition-all duration-300 cursor-pointer"
          >
            <option value="">Toutes les marques</option>
            {brands.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <Label className="mb-2 block">Gamme de prix</Label>
          <div className="space-y-2">
            {priceRanges.map((range, index) => (
              <label key={index} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded-md transition-all duration-300">
                <input
                  type="radio"
                  name="priceRange"
                  checked={filters.priceMin === range.min && filters.priceMax === range.max}
                  onChange={() => handlePriceRangeChange(range.min, range.max)}
                  className="w-4 h-4 text-secondary focus:ring-secondary cursor-pointer"
                />
                <span className="text-sm text-gray-700">{range.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Fuel Type */}
        <div>
          <Label className="mb-2 block">Carburant</Label>
          <select
            value={filters.fuel || ''}
            onChange={(e) => handleFilterChange('fuel', e.target.value)}
            className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary hover:border-secondary/50 transition-all duration-300 cursor-pointer"
          >
            <option value="">Tous les carburants</option>
            {fuelTypes.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        {/* Transmission */}
        <div>
          <Label className="mb-2 block">Transmission</Label>
          <select
            value={filters.transmission || ''}
            onChange={(e) => handleFilterChange('transmission', e.target.value)}
            className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary hover:border-secondary/50 transition-all duration-300 cursor-pointer"
          >
            <option value="">Toutes les transmissions</option>
            {transmissionTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Apply Button */}
      <div className="p-6 pt-4 border-t border-gray-200 flex-shrink-0 bg-white">
        <Button
          onClick={applyFilters}
          className="w-full bg-secondary hover:bg-secondary-600 text-white font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
          size="lg"
        >
          Appliquer les filtres
        </Button>
      </div>
    </div>
  )
}
