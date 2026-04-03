'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Search, Car, Truck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'

const HERO_IMAGE = '/hero-section.png'

interface HeroSectionProps {
  brands: Array<{ id: string; name: string }>
  models?: Array<{ id: string; name: string; brand_id: string }>
}

const budgetRanges = [
  { value: '', label: 'BUDGET' },
  { value: '0-100000', label: 'Moins de 100 000 DH' },
  { value: '100000-200000', label: '100 000 - 200 000 DH' },
  { value: '200000-400000', label: '200 000 - 400 000 DH' },
  { value: '400000-600000', label: '400 000 - 600 000 DH' },
  { value: '600000-1000000', label: '600 000 - 1 000 000 DH' },
  { value: '1000000+', label: 'Plus de 1 000 000 DH' },
]

const vehicleTypes = [
  { id: 'Citadine', label: 'Citadine' },
  { id: 'Berline', label: 'Berline' },
  { id: 'SUV', label: 'SUV/4x4' },
  { id: 'Monospace', label: 'Sportive' },
  { id: 'Utilitaire', label: 'VUL' },
]

const fuelTypes = [
  { value: '', label: 'ÉNERGIE' },
  { value: 'Essence', label: 'Essence' },
  { value: 'Diesel', label: 'Diesel' },
  { value: 'Hybrid', label: 'Hybride' },
  { value: 'Electric', label: 'Électrique' },
]

const fiscalPowerOptions = [
  { value: '', label: 'PUISS. FISCALE' },
  { value: '4', label: '4 CV' },
  { value: '5', label: '5 CV' },
  { value: '6', label: '6 CV' },
  { value: '7', label: '7 CV' },
  { value: '8', label: '8 CV' },
  { value: '9', label: '9 CV' },
  { value: '10+', label: '10 CV+' },
]

const fiscalPowerToHP: Record<string, { min: number; max: number }> = {
  '4': { min: 0, max: 70 },
  '5': { min: 71, max: 90 },
  '6': { min: 91, max: 110 },
  '7': { min: 111, max: 130 },
  '8': { min: 131, max: 150 },
  '9': { min: 151, max: 180 },
  '10+': { min: 181, max: 99999 },
}

const selectStyle = {
  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
  backgroundPosition: 'right 0.5rem center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '1.25em 1.25em',
  paddingRight: '2rem',
}

export function HeroSection({ brands }: HeroSectionProps) {
  const router = useRouter()
  const [vehicleCondition, setVehicleCondition] = useState<'neuf' | 'occasion'>('neuf')
  const [selectedType, setSelectedType] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedBudget, setSelectedBudget] = useState('')
  const [selectedFuel, setSelectedFuel] = useState('')
  const [selectedFiscalPower, setSelectedFiscalPower] = useState('')
  const [priceRange, setPriceRange] = useState([0, 1000000])
  const [resultCount, setResultCount] = useState<number | null>(null)

  // Fetch result count reactively
  useEffect(() => {
    const fetchCount = async () => {
      try {
        if (vehicleCondition === 'occasion') {
          const params = new URLSearchParams()
          const brandName = selectedBrand ? brands.find(b => b.id === selectedBrand)?.name : ''
          if (brandName) params.set('brand', brandName)
          if (selectedFuel) params.set('fuel', selectedFuel)
          const res = await fetch(`/api/search/moccaz?${params.toString()}`)
          const data = await res.json()
          setResultCount(Array.isArray(data) ? data.length : 0)
          return
        }

        const supabase = createClient()

        const selectStr = selectedType ? '*, models!inner(*)' : '*'
        let query = supabase.from('vehicles_new').select(selectStr, { count: 'exact', head: true })

        if (selectedBrand) query = query.eq('brand_id', selectedBrand)
        if (selectedFuel) query = query.eq('fuel_type', selectedFuel)
        if (selectedType) query = query.eq('models.category', selectedType)

        if (selectedBudget) {
          const parts = selectedBudget.split('-')
          const min = parseInt(parts[0])
          const max = parts[1] ? parseInt(parts[1]) : null
          if (vehicleCondition === 'neuf') {
            if (min > 0) query = query.gte('price_min', min)
            if (max && !selectedBudget.includes('+')) query = query.lte('price_min', max)
          } else {
            if (min > 0) query = query.gte('price', min)
            if (max && !selectedBudget.includes('+')) query = query.lte('price', max)
          }
        }

        if (priceRange[0] > 0) {
          if (vehicleCondition === 'neuf') query = query.gte('price_min', priceRange[0])
          else query = query.gte('price', priceRange[0])
        }
        if (priceRange[1] < 1000000) {
          if (vehicleCondition === 'neuf') query = query.lte('price_min', priceRange[1])
          else query = query.lte('price', priceRange[1])
        }

        if (selectedFiscalPower && fiscalPowerToHP[selectedFiscalPower]) {
          const hpRange = fiscalPowerToHP[selectedFiscalPower]
          query = query.gte('horsepower', hpRange.min)
          if (hpRange.max < 99999) query = query.lte('horsepower', hpRange.max)
        }

        const { count } = await query
        setResultCount(count)
      } catch {
        // Silently handle errors
      }
    }

    const timer = setTimeout(fetchCount, 300)
    return () => clearTimeout(timer)
  }, [vehicleCondition, selectedBrand, selectedType, selectedFuel, selectedBudget, selectedFiscalPower, priceRange, brands])

  const handleSearch = () => {
    const params = new URLSearchParams()

    if (vehicleCondition === 'occasion') {
      const brandName = selectedBrand ? brands.find(b => b.id === selectedBrand)?.name : ''
      if (brandName) params.set('brand', brandName)
      if (selectedFuel) params.set('fuel', selectedFuel)
      router.push(`/occasion?${params.toString()}`)
      return
    }

    if (selectedBrand) params.set('brand', selectedBrand)
    if (selectedType) params.set('category', selectedType)
    if (selectedFuel) params.set('fuel', selectedFuel)

    if (selectedBudget) {
      const [min, max] = selectedBudget.split('-')
      if (min && min !== '0') params.set('priceMin', min.replace('+', ''))
      if (max && !selectedBudget.includes('+')) params.set('priceMax', max)
    }

    if (priceRange[0] > 0) params.set('priceMin', priceRange[0].toString())
    if (priceRange[1] < 1000000) params.set('priceMax', priceRange[1].toString())

    if (selectedFiscalPower && fiscalPowerToHP[selectedFiscalPower]) {
      const hpRange = fiscalPowerToHP[selectedFiscalPower]
      params.set('hpMin', hpRange.min.toString())
      if (hpRange.max < 99999) params.set('hpMax', hpRange.max.toString())
    }

    router.push(`/neuf?${params.toString()}`)
  }

  const selectClassName = 'w-full px-2.5 py-2 bg-white/10 border border-white/20 rounded-xl text-xs text-white focus:border-[#006EFE] focus:ring-1 focus:ring-[#006EFE]/40 outline-none transition-all duration-200 appearance-none cursor-pointer placeholder-white/50'
  const sliderThumbClass = 'absolute w-full h-6 appearance-none bg-transparent cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#006EFE] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#006EFE] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer'

  return (
    <section className="relative min-h-[55vh] sm:min-h-[60vh] flex items-center overflow-hidden">

      {/* Static hero background */}
      <div className="absolute inset-0">
        <Image
          src={HERO_IMAGE}
          alt="Guide d'achat automobile Maroc — recherche de voitures neuves et occasion"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </div>

      {/* Dark gradient overlay — left darker, right lighter so car is visible */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20 pointer-events-none" />

      {/* Content */}
      <div className="container mx-auto px-4 lg:px-8 relative z-10 pt-6 lg:pt-8 pb-14 lg:pb-16">
        {/* Search panel — dark overlay card anchored left */}
        <div className="w-full max-w-xl bg-black/50 backdrop-blur-md rounded-2xl border border-white/10 p-4 sm:p-5 lg:p-6">

          {/* Title */}
          <h2 className="font-display text-lg lg:text-xl font-bold text-white leading-tight mb-0.5 text-center">
            Trouvez la voiture idéale au Maroc
          </h2>
          <p className="text-white/60 text-[11px] mb-3 text-center">
            Neuf et occasion — comparez les prix, faites le bon choix
          </p>

          {/* NEUF / OCCASION Toggle */}
          <div className="flex justify-center mb-3">
          <div className="inline-flex rounded-xl bg-white/10 p-0.5">
            <button
              onClick={() => setVehicleCondition('neuf')}
              className={`px-4 sm:px-5 py-2 sm:py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                vehicleCondition === 'neuf'
                  ? 'bg-[#006EFE] text-white shadow-sm'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              NEUF
            </button>
            <button
              onClick={() => setVehicleCondition('occasion')}
              className={`px-4 sm:px-5 py-2 sm:py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                vehicleCondition === 'occasion'
                  ? 'bg-[#006EFE] text-white shadow-sm'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              OCCAZ
            </button>
          </div>
          </div>

          {/* Vehicle Type Icons */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1 mb-2">
            {vehicleTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(selectedType === type.id ? '' : type.id)}
                className={`flex flex-col items-center py-1 px-1 rounded-lg transition-all duration-200 border ${
                  selectedType === type.id
                    ? 'bg-[#006EFE]/20 text-[#006EFE] border-[#006EFE]/50 scale-[1.03]'
                    : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white hover:border-white/25'
                }`}
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  {type.id === 'Utilitaire' ? (
                    <Truck className="w-3.5 h-3.5" />
                  ) : (
                    <Car className="w-3.5 h-3.5" />
                  )}
                </div>
                <span className="text-[8px] font-medium leading-tight mt-0.5">{type.label}</span>
              </button>
            ))}
          </div>

          {/* Filter Dropdowns */}
          <div className="grid grid-cols-2 gap-1.5 mb-2">
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className={selectClassName}
              style={selectStyle}
            >
              <option value="" className="bg-gray-900 text-white">MARQUE</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id} className="bg-gray-900 text-white">{brand.name}</option>
              ))}
            </select>
            <select
              value={selectedBudget}
              onChange={(e) => setSelectedBudget(e.target.value)}
              className={selectClassName}
              style={selectStyle}
            >
              {budgetRanges.map((range) => (
                <option key={range.value} value={range.value} className="bg-gray-900 text-white">{range.label}</option>
              ))}
            </select>
            <select
              value={selectedFuel}
              onChange={(e) => setSelectedFuel(e.target.value)}
              className={selectClassName}
              style={selectStyle}
            >
              {fuelTypes.map((fuel) => (
                <option key={fuel.value} value={fuel.value} className="bg-gray-900 text-white">{fuel.label}</option>
              ))}
            </select>
            <select
              value={selectedFiscalPower}
              onChange={(e) => setSelectedFiscalPower(e.target.value)}
              className={selectClassName}
              style={selectStyle}
            >
              {fiscalPowerOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-gray-900 text-white">{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Price Slider + Search Button */}
          <div className="flex flex-col gap-1.5">
            {/* Price Range Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-white/70">{formatPrice(priceRange[0])}</span>
                <span className="text-xs font-medium text-white/40">Prix</span>
                <span className="text-xs font-medium text-white/70">{formatPrice(priceRange[1])}</span>
              </div>
              <div className="relative h-6 flex items-center">
                <div className="absolute left-0 right-0 h-1.5 bg-white/20 rounded-full" />
                <div
                  className="absolute h-1.5 bg-gradient-to-r from-[#006EFE] to-[#006EFE] rounded-full"
                  style={{
                    left: `${(priceRange[0] / 1000000) * 100}%`,
                    right: `${100 - (priceRange[1] / 1000000) * 100}%`,
                  }}
                />
                <input
                  type="range"
                  min="0"
                  max="1000000"
                  step="10000"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Math.min(Number(e.target.value), priceRange[1] - 10000), priceRange[1]])}
                  className={`${sliderThumbClass} z-30`}
                />
                <input
                  type="range"
                  min="0"
                  max="1000000"
                  step="10000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Math.max(Number(e.target.value), priceRange[0] + 10000)])}
                  className={`${sliderThumbClass} z-40`}
                />
              </div>
            </div>

            {/* Search Button + Result Count */}
            <div className="flex flex-col gap-1">
              {resultCount !== null && (
                <p className="text-sm text-white/60 text-center">
                  {resultCount.toLocaleString('fr-FR')} résultat{resultCount !== 1 ? 's' : ''}
                </p>
              )}
              <button
                onClick={handleSearch}
                className="w-full px-6 py-2 bg-[#006EFE] hover:bg-[#005BD4] text-white text-sm font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 justify-center"
              >
                <Search className="h-4 w-4" />
                Rechercher
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
