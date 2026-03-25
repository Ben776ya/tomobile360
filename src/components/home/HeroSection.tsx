'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Search, Car, Truck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'

interface HeroSectionProps {
  brands: Array<{ id: string; name: string }>
  models?: Array<{ id: string; name: string; brand_id: string }>
}

const fallbackImages = [
  'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=2574',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2574',
  'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2574',
  'https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=2574',
]

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
  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
  backgroundPosition: 'right 0.5rem center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '1.25em 1.25em',
  paddingRight: '2rem',
}

export function HeroSection({ brands }: HeroSectionProps) {
  const router = useRouter()
  const [heroImages, setHeroImages] = useState<string[]>(fallbackImages)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [vehicleCondition, setVehicleCondition] = useState<'neuf' | 'occasion'>('neuf')
  const [selectedType, setSelectedType] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedBudget, setSelectedBudget] = useState('')
  const [selectedFuel, setSelectedFuel] = useState('')
  const [selectedFiscalPower, setSelectedFiscalPower] = useState('')
  const [priceRange, setPriceRange] = useState([0, 1000000])
  const [resultCount, setResultCount] = useState<number | null>(null)

  // Fetch random images from new vehicles
  useEffect(() => {
    const fetchHeroImages = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('vehicles_new')
          .select('images')
          .not('images', 'is', null)

        if (data && data.length > 0) {
          // Take only the first image (thumbnail) of each car
          const thumbnails: string[] = []
          for (const vehicle of data) {
            if (vehicle.images && vehicle.images.length > 0) {
              thumbnails.push(vehicle.images[0])
            }
          }

          if (thumbnails.length >= 4) {
            const shuffled = thumbnails.sort(() => Math.random() - 0.5)
            setHeroImages(shuffled.slice(0, 4))
          } else if (thumbnails.length > 0) {
            setHeroImages(thumbnails)
          }
        }
      } catch {
        // Keep fallback images on error
      }
    }

    fetchHeroImages()
  }, [])

  // Slider auto-rotation (kept for heroImages state usage)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [heroImages.length])

  // Fetch result count reactively
  useEffect(() => {
    const fetchCount = async () => {
      try {
        // For occasion: count from M-Occaz scraped data
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

        // Use inner join on models when filtering by category
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

        // Price slider (overrides budget)
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
        // Silently handle errors - count is a nice-to-have
      }
    }

    const timer = setTimeout(fetchCount, 300)
    return () => clearTimeout(timer)
  }, [vehicleCondition, selectedBrand, selectedType, selectedFuel, selectedBudget, selectedFiscalPower, priceRange])

  const handleSearch = () => {
    const params = new URLSearchParams()

    if (vehicleCondition === 'occasion') {
      // For M-Occaz: pass brand name (not ID) and fuel as text
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

    // Price slider overrides budget
    if (priceRange[0] > 0) params.set('priceMin', priceRange[0].toString())
    if (priceRange[1] < 1000000) params.set('priceMax', priceRange[1].toString())

    if (selectedFiscalPower && fiscalPowerToHP[selectedFiscalPower]) {
      const hpRange = fiscalPowerToHP[selectedFiscalPower]
      params.set('hpMin', hpRange.min.toString())
      if (hpRange.max < 99999) params.set('hpMax', hpRange.max.toString())
    }

    router.push(`/neuf?${params.toString()}`)
  }

  const selectClassName = 'w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:border-[#006EFE] focus:ring-1 focus:ring-[#006EFE]/20 outline-none transition-all duration-200 appearance-none cursor-pointer'
  const sliderThumbClass = 'absolute w-full h-6 appearance-none bg-transparent cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#006EFE] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#006EFE] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer'

  return (
    <section className="relative bg-gradient-to-br from-gray-50 via-white to-blue-50/30 min-h-[55vh] flex items-center overflow-hidden">
      {/* Decorative accent */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#006EFE]/5 to-transparent pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#006EFE]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center py-12 lg:py-16">
          {/* Left column: headline + search card */}
          <div>
            {/* Headline */}
            <div className="mb-8">
              <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-primary leading-tight mb-3">
                Trouvez votre voiture<br />
                <span className="text-[#006EFE]">au meilleur prix</span>
              </h1>
              <p className="text-gray-500 text-lg">
                Neuf et occasion — comparez les prix au Maroc
              </p>
            </div>

            {/* Floating search card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 shadow-lg">
              {/* NEUF / OCCASION Toggle */}
              <div className="inline-flex rounded-xl bg-gray-100 p-1 mb-6">
                <button
                  onClick={() => setVehicleCondition('neuf')}
                  className={`px-7 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    vehicleCondition === 'neuf'
                      ? 'bg-[#006EFE] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  NEUF
                </button>
                <button
                  onClick={() => setVehicleCondition('occasion')}
                  className={`px-7 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    vehicleCondition === 'occasion'
                      ? 'bg-[#006EFE] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  OCCAZ
                </button>
              </div>

              {/* Vehicle Type Icons */}
              <div className="grid grid-cols-5 gap-2 md:gap-3 mb-4">
                {vehicleTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(selectedType === type.id ? '' : type.id)}
                    className={`flex flex-col items-center py-1 md:py-1.5 px-1.5 rounded-lg transition-all duration-300 border ${
                      selectedType === type.id
                        ? 'bg-white text-[#006EFE] border-[#006EFE] scale-[1.03] shadow-sm'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-white hover:text-[#006EFE] hover:border-[#006EFE]/50'
                    }`}
                  >
                    <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center">
                      {type.id === 'Utilitaire' ? (
                        <Truck className="w-4 h-4 md:w-5 md:h-5" />
                      ) : (
                        <Car className="w-4 h-4 md:w-5 md:h-5" />
                      )}
                    </div>
                    <span className="text-[9px] md:text-[10px] font-medium leading-tight mt-0.5">{type.label}</span>
                  </button>
                ))}
              </div>

              {/* Filter Dropdowns */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className={selectClassName}
                  style={selectStyle}
                >
                  <option value="">MARQUE</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
                <select
                  value={selectedBudget}
                  onChange={(e) => setSelectedBudget(e.target.value)}
                  className={selectClassName}
                  style={selectStyle}
                >
                  {budgetRanges.map((range) => (
                    <option key={range.value} value={range.value}>{range.label}</option>
                  ))}
                </select>
                <select
                  value={selectedFuel}
                  onChange={(e) => setSelectedFuel(e.target.value)}
                  className={selectClassName}
                  style={selectStyle}
                >
                  {fuelTypes.map((fuel) => (
                    <option key={fuel.value} value={fuel.value}>{fuel.label}</option>
                  ))}
                </select>
                <select
                  value={selectedFiscalPower}
                  onChange={(e) => setSelectedFiscalPower(e.target.value)}
                  className={selectClassName}
                  style={selectStyle}
                >
                  {fiscalPowerOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Price Slider + Search Button */}
              <div className="flex flex-col md:flex-row md:items-end gap-3">
                {/* Price Range Slider */}
                <div className="flex-1 flex items-end justify-center">
                  <div className="w-full md:w-4/5">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-medium text-gray-600">{formatPrice(priceRange[0])}</span>
                      <span className="text-xs font-medium text-gray-400">Prix</span>
                      <span className="text-xs font-medium text-gray-600">{formatPrice(priceRange[1])}</span>
                    </div>
                    <div className="relative h-6 flex items-center">
                      <div className="absolute left-0 right-0 h-1.5 bg-gray-200 rounded-full" />
                      <div
                        className="absolute h-1.5 bg-gradient-to-r from-primary to-[#006EFE] rounded-full"
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
                </div>

                {/* Search Button + Result Count */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  {resultCount !== null && (
                    <span className="text-sm text-gray-400 text-center">
                      {resultCount.toLocaleString('fr-FR')} résultat{resultCount !== 1 ? 's' : ''}
                    </span>
                  )}
                  <button
                    onClick={handleSearch}
                    className="w-full px-6 py-3 bg-[#006EFE] hover:bg-[#005BD4] text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Search className="h-4 w-4" />
                    Rechercher
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right column: decorative vehicle image */}
          <div className="hidden lg:block relative">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-elevated">
              <Image
                src={heroImages[0] || fallbackImages[0]}
                alt="Tomobile 360"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 0vw, 50vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
