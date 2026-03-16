'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { X, SlidersHorizontal } from 'lucide-react'

interface UsedVehicleFiltersProps {
  brands: Array<{ id: string; name: string }>
  categories: string[]
  cities: string[]
  currentFilters: {
    brand?: string
    category?: string
    yearMin?: string
    yearMax?: string
    mileageMax?: string
    priceMin?: string
    priceMax?: string
    fuel?: string
    transmission?: string
    city?: string
    sellerType?: string
    sort?: string
  }
}

export function UsedVehicleFilters({
  brands,
  categories,
  cities,
  currentFilters,
}: UsedVehicleFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [filters, setFilters] = useState(currentFilters)

  const fuelTypes = ['Essence', 'Diesel', 'Hybrid', 'Electric']
  const transmissionTypes = ['Manual', 'Automatic']
  const sellerTypes = [
    { value: 'individual', label: 'Particulier' },
    { value: 'professional', label: 'Professionnel' },
  ]

  const priceRanges = [
    { label: 'Moins de 50 000 DH', max: '50000' },
    { label: '50 000 - 100 000 DH', min: '50000', max: '100000' },
    { label: '100 000 - 150 000 DH', min: '100000', max: '150000' },
    { label: '150 000 - 200 000 DH', min: '150000', max: '200000' },
    { label: 'Plus de 200 000 DH', min: '200000' },
  ]

  const mileageRanges = [
    { label: 'Moins de 50 000 km', value: '50000' },
    { label: 'Moins de 100 000 km', value: '100000' },
    { label: 'Moins de 150 000 km', value: '150000' },
    { label: 'Moins de 200 000 km', value: '200000' },
  ]

  const sortOptions = [
    { value: 'newest', label: 'Plus récentes' },
    { value: 'price-asc', label: 'Prix croissant' },
    { value: 'price-desc', label: 'Prix décroissant' },
    { value: 'mileage-asc', label: 'Kilométrage croissant' },
    { value: 'year-desc', label: 'Plus récents (année)' },
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i)

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
  }

  const handlePriceRangeChange = (min?: string, max?: string) => {
    const newFilters = { ...filters, priceMin: min, priceMax: max }
    setFilters(newFilters)
  }

  const applyFilters = () => {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key, value)
      }
    })

    router.push(`/occasion?${params.toString()}`)
  }

  const clearFilters = () => {
    setFilters({})
    router.push('/occasion')
  }

  const hasActiveFilters = Object.values(filters).some((v) => v && v !== '')

  return (
    <div className="bg-white backdrop-blur-sm rounded-lg shadow-card border border-gray-200 p-6 sticky top-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-secondary" />
          <h3 className="font-bold text-slate-700">Filtres</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-secondary flex items-center gap-1 transition-all"
          >
            <X className="h-4 w-4" />
            Effacer
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Sort */}
        <div>
          <Label className="mb-2 block">Trier par</Label>
          <select
            value={filters.sort || 'newest'}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary hover:border-secondary/50 transition-all duration-300 cursor-pointer"
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
            value={filters.brand || ''}
            onChange={(e) => handleFilterChange('brand', e.target.value)}
            className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary hover:border-secondary/50 transition-all duration-300 cursor-pointer"
          >
            <option value="">Toutes les marques</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <Label className="mb-2 block">Catégorie</Label>
          <select
            value={filters.category || ''}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary hover:border-secondary/50 transition-all duration-300 cursor-pointer"
          >
            <option value="">Toutes les catégories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Year Range */}
        <div>
          <Label className="mb-2 block">Année</Label>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={filters.yearMin || ''}
              onChange={(e) => handleFilterChange('yearMin', e.target.value)}
              className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary hover:border-secondary/50 transition-all duration-300 cursor-pointer"
            >
              <option value="">Min</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <select
              value={filters.yearMax || ''}
              onChange={(e) => handleFilterChange('yearMax', e.target.value)}
              className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary hover:border-secondary/50 transition-all duration-300 cursor-pointer"
            >
              <option value="">Max</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mileage */}
        <div>
          <Label className="mb-2 block">Kilométrage maximum</Label>
          <select
            value={filters.mileageMax || ''}
            onChange={(e) => handleFilterChange('mileageMax', e.target.value)}
            className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary hover:border-secondary/50 transition-all duration-300 cursor-pointer"
          >
            <option value="">Tous</option>
            {mileageRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
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
                  checked={
                    filters.priceMin === range.min && filters.priceMax === range.max
                  }
                  onChange={() => handlePriceRangeChange(range.min, range.max)}
                  className="w-4 h-4 text-secondary focus:ring-secondary cursor-pointer"
                />
                <span className="text-sm text-gray-700">{range.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* City */}
        <div>
          <Label className="mb-2 block">Ville</Label>
          <select
            value={filters.city || ''}
            onChange={(e) => handleFilterChange('city', e.target.value)}
            className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary hover:border-secondary/50 transition-all duration-300 cursor-pointer"
          >
            <option value="">Toutes les villes</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
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
            {fuelTypes.map((fuel) => (
              <option key={fuel} value={fuel}>
                {fuel}
              </option>
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
            {transmissionTypes.map((transmission) => (
              <option key={transmission} value={transmission}>
                {transmission}
              </option>
            ))}
          </select>
        </div>

        {/* Seller Type */}
        <div>
          <Label className="mb-2 block">Type de vendeur</Label>
          <select
            value={filters.sellerType || ''}
            onChange={(e) => handleFilterChange('sellerType', e.target.value)}
            className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary hover:border-secondary/50 transition-all duration-300 cursor-pointer"
          >
            <option value="">Tous</option>
            {sellerTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Apply Button */}
        <Button onClick={applyFilters} className="w-full bg-secondary hover:bg-secondary-600 text-white font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300" size="lg">
          Appliquer les filtres
        </Button>
      </div>
    </div>
  )
}
