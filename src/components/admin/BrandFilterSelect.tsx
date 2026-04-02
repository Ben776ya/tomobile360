'use client'

interface Brand {
  id: string
  name: string
}

interface BrandFilterSelectProps {
  brands: Brand[]
  currentBrand?: string
  tab: string
}

export function BrandFilterSelect({ brands, currentBrand, tab }: BrandFilterSelectProps) {
  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value
    const params = new URLSearchParams()
    params.set('tab', tab)
    if (value) params.set('brand', value)
    window.location.href = `/admin/vehicles?${params.toString()}`
  }

  return (
    <select
      defaultValue={currentBrand || ''}
      onChange={handleChange}
      className="h-9 rounded-md border border-white/10 bg-dark-700/80 px-3 text-sm text-white focus:ring-secondary/50 focus:ring-2 focus:outline-none"
    >
      <option value="">Toutes les marques</option>
      {brands.map((brand) => (
        <option key={brand.id} value={brand.id}>
          {brand.name}
        </option>
      ))}
    </select>
  )
}
