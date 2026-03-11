import { VehicleNew } from '@/lib/types'
import {
  Fuel,
  Gauge,
  Zap,
  Wind,
  Cog,
  Users,
  Package,
  Ruler,
  Shield,
  Sofa,
  Paintbrush,
  Check,
  X,
  Car,
} from 'lucide-react'

interface VehicleSpecsProps {
  vehicle: VehicleNew
}

// Icons for each spec category
const CATEGORY_CONFIG: Record<string, { icon: any; color: string }> = {
  'MOTEUR & INFOS TECHNIQUES': { icon: Cog, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  'DIMENSIONS & VOLUMES': { icon: Ruler, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  'SÉCURITÉ': { icon: Shield, color: 'text-[#d4921f] bg-[#fef3c7] border-[#fde68a]' },
  'CONFORT': { icon: Sofa, color: 'text-green-600 bg-green-50 border-green-200' },
  'ESTHÉTIQUE': { icon: Paintbrush, color: 'text-amber-600 bg-amber-50 border-amber-200' },
}

// Category display order
const CATEGORY_ORDER = [
  'MOTEUR & INFOS TECHNIQUES',
  'DIMENSIONS & VOLUMES',
  'SÉCURITÉ',
  'CONFORT',
  'ESTHÉTIQUE',
]

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

export function VehicleSpecs({ vehicle }: VehicleSpecsProps) {
  // The full spec data is stored in features as a structured object
  const specs = vehicle.features as Record<string, Record<string, unknown>> | null

  // If we have structured spec data (from fiches), render it
  if (specs && typeof specs === 'object' && !Array.isArray(specs) && CATEGORY_ORDER.some(cat => specs[cat])) {
    return (
      <div className="space-y-8">
        <h3 className="text-xl font-semibold">Fiche Technique</h3>

        {CATEGORY_ORDER.map((categoryName) => {
          const categoryData = specs[categoryName]
          if (!categoryData || typeof categoryData !== 'object') return null

          const entries = Object.entries(categoryData)
          if (entries.length === 0) return null

          const config = CATEGORY_CONFIG[categoryName] || { icon: Car, color: 'text-gray-600 bg-gray-50 border-gray-200' }
          const Icon = config.icon
          const colorClasses = config.color.split(' ')

          return (
            <div key={categoryName} className="border border-border rounded-xl overflow-hidden">
              {/* Category Header */}
              <div className={`flex items-center gap-3 px-5 py-3.5 ${colorClasses[1]} border-b ${colorClasses[2]}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClasses[1]}`}>
                  <Icon className={`h-5 w-5 ${colorClasses[0]}`} />
                </div>
                <h4 className={`text-base font-bold ${colorClasses[0]}`}>
                  {categoryName}
                </h4>
              </div>

              {/* Spec Rows */}
              <div className="divide-y divide-border">
                {entries.map(([key, value], index) => (
                  <div
                    key={key}
                    className={`flex items-center justify-between px-5 py-3 ${index % 2 === 0 ? 'bg-white' : 'bg-muted/30'} hover:bg-muted/50 transition-colors`}
                  >
                    <span className="text-sm text-muted-foreground">{key}</span>
                    <span className="text-sm text-right max-w-[60%]">
                      {renderValue(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {/* Source URL if available */}
        {vehicle.source_url && (
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Source:{' '}
              <a
                href={vehicle.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Voir la fiche complète
              </a>
            </p>
          </div>
        )}
      </div>
    )
  }

  // Fallback: render from individual columns (legacy data)
  const legacySpecs = [
    {
      category: 'Motorisation',
      items: [
        { icon: Fuel, label: 'Carburant', value: vehicle.fuel_type },
        { icon: Gauge, label: 'Transmission', value: vehicle.transmission },
        { icon: Cog, label: 'Cylindrée', value: vehicle.engine_size ? `${vehicle.engine_size}L` : null },
        { icon: Wind, label: 'Cylindres', value: vehicle.cylinders },
        { icon: Zap, label: 'Puissance', value: vehicle.horsepower ? `${vehicle.horsepower} ch` : null },
        { icon: Zap, label: 'Couple', value: vehicle.torque ? `${vehicle.torque} Nm` : null },
      ].filter((item) => item.value),
    },
    {
      category: 'Capacités',
      items: [
        { icon: Users, label: 'Places', value: vehicle.seating_capacity },
        { icon: Package, label: 'Volume coffre', value: vehicle.cargo_capacity ? `${vehicle.cargo_capacity} L` : null },
      ].filter((item) => item.value),
    },
  ]

  const visibleSpecs = legacySpecs.filter((cat) => cat.items.length > 0)

  if (visibleSpecs.length === 0) {
    return (
      <div className="p-4 bg-muted rounded-md">
        <p className="text-sm text-muted-foreground text-center">
          Les spécifications techniques seront bientôt disponibles.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Spécifications Techniques</h3>
      {visibleSpecs.map((category) => (
        <div key={category.category}>
          <h4 className="text-lg font-semibold text-primary mb-3">{category.category}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {category.items.map((item, index) => {
              const Icon = item.icon
              return (
                <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
                  <div className="flex-shrink-0 w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                    <Icon className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="font-semibold">{item.value}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
