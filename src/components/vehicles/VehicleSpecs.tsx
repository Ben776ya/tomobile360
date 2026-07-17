import { VehicleNew, FicheTechnique } from '@/lib/types'
import { isMeaningfulSpecValue } from '@/lib/vehicles/spec-value'
import { fuelLabel, transmissionLabel } from '@/lib/vehicles/display-labels'
import {
  Fuel,
  Gauge,
  Zap,
  Wind,
  Cog,
  Ruler,
  Shield,
  Sofa,
  Paintbrush,
  Check,
  X,
  Car,
  Droplets,
} from 'lucide-react'

interface VehicleSpecsProps {
  vehicle: VehicleNew
  fiche?: FicheTechnique | null
}

type KeySpec = {
  icon: any
  label: string
  value: string
}

export function KeySpecsStrip({ vehicle, fiche }: VehicleSpecsProps) {
  const ficheSpecs = fiche?.specs || {}

  // Resolve each key spec (vehicle column preferred, fiche as fallback), then
  // keep only the ones with a meaningful value — this hides placeholder zeros
  // like a fiche "Couple maxi." stored as "0 Nm" and guards against building a
  // "null km/h" string when neither source has the field.
  const makeSpec = (icon: any, label: string, value: string | number | null | undefined): KeySpec | null =>
    isMeaningfulSpecValue(value) ? { icon, label, value: String(value) } : null

  const specs = [
    makeSpec(Zap, 'Puissance', vehicle.horsepower ? `${vehicle.horsepower} ch` : ficheSpecs['Puissance dynamique']),
    makeSpec(Fuel, 'Carburant', vehicle.fuel_type ? fuelLabel(vehicle.fuel_type) : ficheSpecs['Motorisation']),
    makeSpec(Cog, 'Boîte', vehicle.transmission ? transmissionLabel(vehicle.transmission) : ficheSpecs['Boîte à vitesse']),
    makeSpec(Car, 'V. Max', ficheSpecs['Vitesse maxi.'] || (vehicle.top_speed ? `${vehicle.top_speed} km/h` : null)),
    makeSpec(Ruler, 'Coffre', ficheSpecs['Volume de coffre'] || (vehicle.cargo_capacity ? `${vehicle.cargo_capacity} L` : null)),
    makeSpec(Gauge, 'Couple', ficheSpecs['Couple maxi.'] || (vehicle.torque ? `${vehicle.torque} Nm` : null)),
  ].filter((s): s is KeySpec => s !== null)

  if (specs.length === 0) return null

  return (
    <div>
      <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">Points Clés</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {specs.map((spec) => {
          const Icon = spec.icon
          return (
            <div
              key={spec.label}
              className="flex flex-col items-center text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl"
            >
              <Icon className="h-5 w-5 text-secondary mb-1.5" />
              <span className="text-xs text-muted-foreground">{spec.label}</span>
              <span className="text-sm font-bold text-dark-800">{spec.value}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}


function renderValue(value: unknown): React.ReactNode {
  if (value === true) {
    return (
      <span className="inline-flex items-center gap-1 text-green-600 font-semibold">
        <Check className="h-4 w-4" /> Oui
      </span>
    )
  }
  if (value === false) {
    return (
      <span className="inline-flex items-center gap-1 text-muted-foreground">
        <X className="h-4 w-4" /> Non
      </span>
    )
  }
  if (typeof value === 'string') {
    return <span className="font-semibold text-dark-800">{value}</span>
  }
  if (typeof value === 'number') {
    return <span className="font-semibold text-dark-800">{value}</span>
  }
  return <span className="text-muted-foreground">-</span>
}

function getDetailCategoryConfig(category: string): { icon: typeof Car; color: string } {
  const normalized = category.toLowerCase()
  if (normalized.includes('esth'))
    return { icon: Paintbrush, color: 'text-amber-600 bg-amber-50 border-amber-200' }
  if (normalized.includes('confort'))
    return { icon: Sofa, color: 'text-green-600 bg-green-50 border-green-200' }
  if (normalized.includes('connect') || normalized.includes('multim'))
    return { icon: Gauge, color: 'text-blue-600 bg-blue-50 border-blue-200' }
  if (normalized.includes('curit'))
    return { icon: Shield, color: 'text-[#d4921f] bg-[#fef3c7] border-[#fde68a]' }
  if (normalized.includes('suppl') || normalized.includes('option'))
    return { icon: Car, color: 'text-purple-600 bg-purple-50 border-purple-200' }
  return { icon: Car, color: 'text-gray-600 bg-gray-50 border-gray-200' }
}

export function VehicleSpecs({ vehicle, fiche }: VehicleSpecsProps) {
  // Priority 1: Render from fiches_techniques table data.
  // Drop placeholder/zero values (e.g. "0 Nm", "", "-") up front so a fiche
  // full of empty cells doesn't render an empty "CARACTÉRISTIQUES" box.
  const meaningfulSpecs = Object.entries(fiche?.specs || {}).filter(([, value]) =>
    isMeaningfulSpecValue(value)
  )
  const hasSpecs = meaningfulSpecs.length > 0
  const hasDetail = fiche && Object.keys(fiche.en_detail || {}).length > 0

  if (hasSpecs || hasDetail) {
    return (
      <div className="space-y-8">
        <h3 className="text-xl font-semibold text-slate-700">Fiche Technique</h3>

        {/* Specs: key-value pairs */}
        {hasSpecs && (
          <div className="border border-border rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3.5 bg-blue-50 border-b border-blue-200">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50">
                <Cog className="h-5 w-5 text-blue-600" />
              </div>
              <h4 className="text-base font-bold text-blue-600">CARACTÉRISTIQUES TECHNIQUES</h4>
            </div>
            <div className="divide-y divide-border">
              {meaningfulSpecs.map(([key, value], index) => (
                <div
                  key={key}
                  className={`flex items-center justify-between px-5 py-3 ${index % 2 === 0 ? 'bg-white' : 'bg-muted/30'} hover:bg-muted/50 transition-colors`}
                >
                  <span className="text-sm text-muted-foreground">{key}</span>
                  <span className="text-sm font-semibold text-dark-800 text-right max-w-[60%]">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* En Detail: categorized lists */}
        {hasDetail && Object.entries(fiche!.en_detail).map(([category, items]) => {
          if (!items || items.length === 0) return null
          const config = getDetailCategoryConfig(category)
          const Icon = config.icon
          const colorClasses = config.color.split(' ')
          return (
            <div key={category} className="border border-border rounded-xl overflow-hidden">
              <div className={`flex items-center gap-3 px-5 py-3.5 ${colorClasses[1]} border-b ${colorClasses[2]}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClasses[1]}`}>
                  <Icon className={`h-5 w-5 ${colorClasses[0]}`} />
                </div>
                <h4 className={`text-base font-bold ${colorClasses[0]}`}>
                  {category.toUpperCase()}
                </h4>
              </div>
              <div className="divide-y divide-border">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 px-5 py-3 ${index % 2 === 0 ? 'bg-white' : 'bg-muted/30'} hover:bg-muted/50 transition-colors`}
                  >
                    <Check className="h-4 w-4 text-green-500 shrink-0" />
                    <span className="text-sm text-dark-800">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {/* External source link intentionally not rendered (internal reference only). */}
      </div>
    )
  }

  // Priority 2: Fallback to individual vehicle columns (legacy data)
  // Organized into categories matching the structured path visual style
  const legacyCategories = [
    {
      name: 'MOTEUR & PERFORMANCES',
      icon: Cog,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      items: [
        { label: 'Carburant', value: vehicle.fuel_type ? fuelLabel(vehicle.fuel_type) : null },
        { label: 'Transmission', value: vehicle.transmission ? transmissionLabel(vehicle.transmission) : null },
        { label: 'Cylindrée', value: vehicle.engine_size ? `${vehicle.engine_size}L` : null },
        { label: 'Cylindres', value: vehicle.cylinders },
        { label: 'Puissance', value: vehicle.horsepower ? `${vehicle.horsepower} ch` : null },
        { label: 'Puissance (kW)', value: vehicle.power_kw ? `${vehicle.power_kw} kW` : null },
        { label: 'Couple', value: vehicle.torque ? `${vehicle.torque} Nm` : null },
        { label: '0-100 km/h', value: vehicle.acceleration ? `${vehicle.acceleration}s` : null },
        { label: 'Vitesse max', value: vehicle.top_speed ? `${vehicle.top_speed} km/h` : null },
      ].filter((item) => item.value != null),
    },
    {
      name: 'CONSOMMATION & ÉMISSIONS',
      icon: Fuel,
      color: 'text-green-600 bg-green-50 border-green-200',
      items: [
        { label: 'Conso. ville', value: vehicle.fuel_consumption_city ? `${vehicle.fuel_consumption_city} L/100km` : null },
        { label: 'Conso. autoroute', value: vehicle.fuel_consumption_highway ? `${vehicle.fuel_consumption_highway} L/100km` : null },
        { label: 'Conso. mixte', value: vehicle.fuel_consumption_combined ? `${vehicle.fuel_consumption_combined} L/100km` : null },
        { label: 'Émissions CO2', value: vehicle.co2_emissions ? `${vehicle.co2_emissions} g/km` : null },
        { label: 'Norme Euro', value: vehicle.euro_norm },
      ].filter((item) => item.value != null),
    },
    {
      name: 'DIMENSIONS & CAPACITÉS',
      icon: Ruler,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      items: [
        { label: 'Longueur', value: vehicle.dimensions?.length ? `${vehicle.dimensions.length} mm` : null },
        { label: 'Largeur', value: vehicle.dimensions?.width ? `${vehicle.dimensions.width} mm` : null },
        { label: 'Hauteur', value: vehicle.dimensions?.height ? `${vehicle.dimensions.height} mm` : null },
        { label: 'Empattement', value: vehicle.dimensions?.wheelbase ? `${vehicle.dimensions.wheelbase} mm` : null },
        { label: 'Portes', value: vehicle.doors },
        { label: 'Places', value: vehicle.seating_capacity },
        { label: 'Volume coffre', value: vehicle.cargo_capacity ? `${vehicle.cargo_capacity} L` : null },
      ].filter((item) => item.value != null),
    },
    {
      name: 'APPARENCE',
      icon: Paintbrush,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      items: [
        { label: 'Couleur extérieure', value: vehicle.exterior_color },
        { label: 'Couleur intérieure', value: vehicle.interior_color },
      ].filter((item) => item.value != null),
    },
    {
      name: 'GARANTIE & DIVERS',
      icon: Shield,
      color: 'text-[#d4921f] bg-[#fef3c7] border-[#fde68a]',
      items: [
        { label: 'Garantie', value: vehicle.warranty_months ? `${vehicle.warranty_months} mois` : null },
        { label: 'TVA déductible', value: vehicle.vat_deductible != null ? vehicle.vat_deductible : null },
      ].filter((item) => item.value != null),
    },
  ]

  const visibleCategories = legacyCategories.filter((cat) => cat.items.length > 0)

  if (visibleCategories.length === 0) {
    return (
      <div className="p-4 bg-muted rounded-md">
        <p className="text-sm text-muted-foreground text-center">
          Les spécifications techniques seront bientôt disponibles.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-semibold text-slate-700">Fiche Technique</h3>

      {visibleCategories.map((category) => {
        const Icon = category.icon
        const colorClasses = category.color.split(' ')

        return (
          <div key={category.name} className="border border-border rounded-xl overflow-hidden">
            {/* Category Header */}
            <div className={`flex items-center gap-3 px-5 py-3.5 ${colorClasses[1]} border-b ${colorClasses[2]}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClasses[1]}`}>
                <Icon className={`h-5 w-5 ${colorClasses[0]}`} />
              </div>
              <h4 className={`text-base font-bold ${colorClasses[0]}`}>
                {category.name}
              </h4>
            </div>

            {/* Spec Rows */}
            <div className="divide-y divide-border">
              {category.items.map((item, index) => (
                <div
                  key={item.label}
                  className={`flex items-center justify-between px-5 py-3 ${index % 2 === 0 ? 'bg-white' : 'bg-muted/30'} hover:bg-muted/50 transition-colors`}
                >
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="text-sm text-right max-w-[60%]">
                    {renderValue(item.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {/* External source link intentionally not rendered (internal reference only). */}
    </div>
  )
}
