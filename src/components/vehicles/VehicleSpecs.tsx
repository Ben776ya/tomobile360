import Link from 'next/link'
import { VehicleNew, FicheTechnique, Variant } from '@/lib/types'
import { isMeaningfulSpecValue } from '@/lib/vehicles/spec-value'
import {
  SPEC_UNAVAILABLE,
  KEY_SPEC_KEYS,
  VERSION_SPEC_LABELS,
  getVersionSpecs,
  ficheDescribesVariant,
  ficheForVariant,
  rowDescribesVariant,
  variantHasFiche,
  vehicleVariants,
  versionSlug,
  type VersionSpecKey,
} from '@/lib/vehicles/version-specs'
import { SpecSection } from './SpecSection'
import { ExpandAllButton } from './ExpandAllButton'
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
  Tag,
} from 'lucide-react'

interface VehicleSpecsProps {
  vehicle: VehicleNew
  /** Every fiche row of the model (per-version rows and/or the model-level one). */
  fiches?: FicheTechnique[] | null
  /** Selected version. When given, the fiche is only shown for the versions it describes. */
  variant?: Variant
  variants?: Variant[]
  /** Model page path, used to link the versions the fiche does describe. */
  basePath?: string
}

interface KeySpecsStripProps {
  vehicle: VehicleNew
  fiches?: FicheTechnique[] | null
  /** The selected version — every figure in the strip is this version's. */
  variant: Variant
  variants: Variant[]
}

const KEY_SPEC_ICONS: Partial<Record<VersionSpecKey, typeof Car>> = {
  price: Tag,
  power: Zap,
  fuel: Fuel,
  transmission: Cog,
  consumption: Droplets,
  topSpeed: Car,
  trunk: Ruler,
  torque: Gauge,
}

export function KeySpecsStrip({ vehicle, fiches, variant, variants }: KeySpecsStripProps) {
  // Same reader as the fiche below and the comparator: per-version facts come
  // from the variant, fiche figures only when the fiche describes this version.
  const specs = getVersionSpecs({ vehicle, fiches, variant, variants })

  return (
    <div>
      <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-1">Points Clés</h3>
      {variant.version && (
        <p className="text-sm text-gray-500 mb-3">
          Version : <span className="font-semibold text-gray-700">{variant.version}</span>
        </p>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {KEY_SPEC_KEYS.map((key) => {
          const Icon = KEY_SPEC_ICONS[key] ?? Car
          const value = specs[key]
          return (
            <div
              key={key}
              className="flex flex-col items-center text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl"
            >
              <Icon className="h-5 w-5 text-secondary mb-1.5" />
              <span className="text-xs text-muted-foreground">{VERSION_SPEC_LABELS[key]}</span>
              {value ? (
                <span className="text-sm font-bold text-dark-800">{value}</span>
              ) : (
                <span className="text-xs text-gray-400">{SPEC_UNAVAILABLE}</span>
              )}
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

const FICHE_CONTAINER_ID = 'fiche-technique-rubriques'

/** Title row shared by both render paths: heading, tap hint, expand-all. */
function FicheHeading() {
  return (
    <div className="flex items-end justify-between gap-4 flex-wrap">
      <div>
        <h3 className="text-xl font-semibold text-slate-700">Fiche Technique</h3>
        <p className="text-sm text-gray-400 mt-0.5">Appuyez sur une rubrique pour l&apos;afficher.</p>
      </div>
      <ExpandAllButton containerId={FICHE_CONTAINER_ID} />
    </div>
  )
}

export function VehicleSpecs({ vehicle, fiches, variant, variants, basePath }: VehicleSpecsProps) {
  // Same per-version reader as KeySpecsStrip and the comparator. The fiche is
  // the selected version's own row, else the model-level one, which describes
  // one engine: list the versions it can be tied to.
  const allVariants = variants ?? vehicleVariants(vehicle)
  const selected = variant ?? allVariants[0]
  const fiche = ficheForVariant(fiches, selected)
  const ficheVersions = allVariants.filter((v) => ficheDescribesVariant(fiche, v, allVariants))
  const ficheFitsSelected = ficheVersions.includes(selected)
  // Versions shown this very fiche (a version with its own row reads that instead).
  const scopeVersions = ficheVersions.filter((v) => ficheForVariant(fiches, v) === fiche)

  // Priority 1: Render from fiches_techniques table data.
  // Drop placeholder/zero values (e.g. "0 Nm", "", "-") up front so a fiche
  // full of empty cells doesn't render an empty "CARACTÉRISTIQUES" box.
  const meaningfulSpecs = Object.entries(fiche?.specs || {}).filter(([, value]) =>
    isMeaningfulSpecValue(value)
  )
  const hasSpecs = meaningfulSpecs.length > 0
  const hasDetail = fiche && Object.keys(fiche.en_detail || {}).length > 0

  // The fiche describes other versions only: show none of its figures under
  // this version, point to the versions that have one instead.
  if ((hasSpecs || hasDetail) && variant && !ficheFitsSelected && ficheVersions.length > 0) {
    const withFiche = allVariants.filter((v) => variantHasFiche(fiches, v, allVariants))
    return (
      <div className="space-y-3">
        <h3 className="text-xl font-semibold text-slate-700">Fiche Technique</h3>
        <p className="text-sm text-gray-600">
          Fiche détaillée de la version {selected.version} : {SPEC_UNAVAILABLE.toLowerCase()}.
        </p>
        <p className="text-sm text-gray-600">
          Disponible pour :{' '}
          {withFiche.map((v, i) => (
            <span key={`${v.version}-${i}`}>
              {i > 0 && ', '}
              {basePath ? (
                <Link
                  href={`${basePath}?version=${versionSlug(v)}#fiche-technique`}
                  scroll={false}
                  className="font-medium text-secondary hover:underline"
                >
                  {v.version}
                </Link>
              ) : (
                v.version
              )}
            </span>
          ))}
        </p>
      </div>
    )
  }

  if (hasSpecs || hasDetail) {
    const scopeNote = !variant
      ? null
      : !ficheFitsSelected
      ? 'Version décrite non précisée par la source : ces données peuvent différer de la version sélectionnée.'
      : scopeVersions.length === allVariants.length
      ? (allVariants.length > 1 ? 'Données valables pour toutes les versions.' : null)
      : `Données valables pour : ${scopeVersions.map((v) => v.version).join(', ')}.`
    const ficheDate = variant && fiche?.updated_at
      ? new Date(fiche.updated_at).toLocaleDateString('fr-MA', { day: 'numeric', month: 'long', year: 'numeric' })
      : null

    return (
      <div className="space-y-6">
        <FicheHeading />

        {(scopeNote || ficheDate || (variant && hasDetail)) && (
          <div className="text-xs text-gray-500 space-y-0.5 -mt-3">
            {scopeNote && <p>{scopeNote}</p>}
            {variant && hasDetail && (
              <p>Équipements listés d&apos;après la fiche — de série ou en option : {SPEC_UNAVAILABLE.toLowerCase()}.</p>
            )}
            {ficheDate && <p>Fiche mise à jour le {ficheDate}.</p>}
          </div>
        )}

        <div id={FICHE_CONTAINER_ID} className="space-y-3">
        {/* Specs: key-value pairs */}
        {hasSpecs && (
          <SpecSection
            title="CARACTÉRISTIQUES TECHNIQUES"
            icon={Cog}
            color="text-blue-600 bg-blue-50 border-blue-200"
            count={meaningfulSpecs.length}
          >
            {meaningfulSpecs.map(([key, value], index) => (
              <div
                key={key}
                className={`flex items-center justify-between px-5 py-3 ${index % 2 === 0 ? 'bg-white' : 'bg-muted/30'} hover:bg-muted/50 transition-colors`}
              >
                <span className="text-sm text-muted-foreground">{key}</span>
                <span className="text-sm font-semibold text-dark-800 text-right max-w-[60%]">{value}</span>
              </div>
            ))}
          </SpecSection>
        )}

        {/* En Detail: categorized lists */}
        {hasDetail && Object.entries(fiche!.en_detail).map(([category, items]) => {
          if (!items || items.length === 0) return null
          const config = getDetailCategoryConfig(category)
          return (
            <SpecSection
              key={category}
              title={category.toUpperCase()}
              icon={config.icon}
              color={config.color}
              count={items.length}
            >
              {items.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 px-5 py-3 ${index % 2 === 0 ? 'bg-white' : 'bg-muted/30'} hover:bg-muted/50 transition-colors`}
                >
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  <span className="text-sm text-dark-800">{item}</span>
                </div>
              ))}
            </SpecSection>
          )
        })}
        </div>

        {/* External source link intentionally not rendered (internal reference only). */}
      </div>
    )
  }

  // Priority 2: Fallback to individual vehicle columns (legacy data)
  // Organized into categories matching the structured path visual style.
  // Per-version facts come from the selected version; the row's engine
  // columns describe one version only, so they show only for that one.
  const own = getVersionSpecs({ vehicle, fiches: null, variant: selected, variants: allVariants })
  const rowOk = rowDescribesVariant(vehicle, selected, allVariants)
  const engine = <T,>(value: T): T | null => (rowOk ? value : null)
  const legacyCategories = [
    {
      name: 'MOTEUR & PERFORMANCES',
      icon: Cog,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      items: [
        { label: 'Carburant', value: own.fuel },
        { label: 'Transmission', value: own.transmission },
        { label: 'Cylindrée', value: own.engineSize },
        { label: 'Cylindres', value: engine(vehicle.cylinders) },
        { label: 'Puissance', value: own.power },
        { label: 'Puissance (kW)', value: engine(vehicle.power_kw ? `${vehicle.power_kw} kW` : null) },
        { label: 'Couple', value: own.torque },
        { label: '0-100 km/h', value: own.acceleration },
        { label: 'Vitesse max', value: own.topSpeed },
      ].filter((item) => item.value != null),
    },
    {
      name: 'CONSOMMATION & ÉMISSIONS',
      icon: Fuel,
      color: 'text-green-600 bg-green-50 border-green-200',
      items: [
        { label: 'Conso. ville', value: engine(vehicle.fuel_consumption_city ? `${vehicle.fuel_consumption_city} L/100km` : null) },
        { label: 'Conso. autoroute', value: engine(vehicle.fuel_consumption_highway ? `${vehicle.fuel_consumption_highway} L/100km` : null) },
        { label: 'Conso. mixte', value: own.consumption },
        { label: 'Émissions CO2', value: own.co2 },
        { label: 'Norme Euro', value: engine(vehicle.euro_norm) },
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
        { label: 'Places', value: own.seats },
        { label: 'Volume coffre', value: own.trunk },
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
    <div className="space-y-6">
      <FicheHeading />

      <div id={FICHE_CONTAINER_ID} className="space-y-3">
      {visibleCategories.map((category) => (
        <SpecSection
          key={category.name}
          title={category.name}
          icon={category.icon}
          color={category.color}
          count={category.items.length}
        >
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
        </SpecSection>
      ))}
      </div>

      {/* External source link intentionally not rendered (internal reference only). */}
    </div>
  )
}
