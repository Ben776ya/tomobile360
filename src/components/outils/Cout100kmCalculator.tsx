'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Fuel, Zap, Leaf, Droplet, TrendingDown, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  computeAll,
  parseEnergyKind,
  ENERGY_KINDS,
  ENERGY_KIND_LABELS,
  ENERGY_KIND_UNITS,
  SEGMENT_DEFAULTS,
  DEFAULT_ANNUAL_KM,
  type EnergyKind,
  type EnergyRates,
  type ElectricSource,
} from '@/lib/outils/cout-100km'

interface Cout100kmCalculatorProps {
  initialRates: EnergyRates
  effectiveDate: string
  isFallback: boolean
}

const KIND_ICON: Record<EnergyKind, typeof Fuel> = {
  essence: Fuel,
  diesel: Droplet,
  hybride: Leaf,
  electrique: Zap,
}

const KIND_ACCENT: Record<EnergyKind, string> = {
  essence: 'text-[#4488ee] bg-[#EBF1FD]',
  diesel: 'text-amber-600 bg-amber-50',
  hybride: 'text-green-600 bg-green-50',
  electrique: 'text-secondary bg-blue-50',
}

const nf1 = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const nf0 = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })
const formatPer100 = (v: number) => `${nf1.format(v)} DH`
const formatYear = (v: number) => `${nf0.format(v)} DH`

/** Parse a user-typed number, tolerating a comma decimal separator. */
function toNum(s: string): number {
  const n = parseFloat(s.replace(',', '.'))
  return isFinite(n) && n >= 0 ? n : 0
}

export function Cout100kmCalculator({ initialRates, effectiveDate, isFallback }: Cout100kmCalculatorProps) {
  const searchParams = useSearchParams()

  const [consumption, setConsumption] = useState<Record<EnergyKind, string>>({
    essence: String(SEGMENT_DEFAULTS.essence),
    diesel: String(SEGMENT_DEFAULTS.diesel),
    hybride: String(SEGMENT_DEFAULTS.hybride),
    electrique: String(SEGMENT_DEFAULTS.electrique),
  })
  const [rates, setRates] = useState({
    essence: String(initialRates.essence),
    diesel: String(initialRates.diesel),
    kwhHome: String(initialRates.kwh_home),
    kwhPublic: String(initialRates.kwh_public),
  })
  const [electricSource, setElectricSource] = useState<ElectricSource>('home')
  const [annualKm, setAnnualKm] = useState(String(DEFAULT_ANNUAL_KM))
  const [ratesOpen, setRatesOpen] = useState(false)
  const [prefilled, setPrefilled] = useState<EnergyKind | null>(null)

  // Deep-link pre-fill (e.g. ?conso=5&energie=essence&km=20000) — read once on
  // mount so a model page can hand off its own consumption. Client-side so the
  // page shell stays statically rendered.
  useEffect(() => {
    const energie = parseEnergyKind(searchParams.get('energie'))
    const conso = searchParams.get('conso')
    const km = searchParams.get('km')
    if (energie && conso) {
      const n = toNum(conso)
      if (n > 0) {
        setConsumption((c) => ({ ...c, [energie]: conso }))
        setPrefilled(energie)
      }
    } else if (energie) {
      setPrefilled(energie)
    }
    if (km) {
      const n = toNum(km)
      if (n > 0) setAnnualKm(km)
    }
    // Read query params a single time on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const result = useMemo(() => {
    const kwh = electricSource === 'home' ? toNum(rates.kwhHome) : toNum(rates.kwhPublic)
    return computeAll({
      consumption: {
        essence: toNum(consumption.essence),
        diesel: toNum(consumption.diesel),
        hybride: toNum(consumption.hybride),
        electrique: toNum(consumption.electrique),
      },
      rates: { essence: toNum(rates.essence), diesel: toNum(rates.diesel), kwh },
      annualKm: toNum(annualKm),
    })
  }, [consumption, rates, electricSource, annualKm])

  const cheapest = useMemo(() => {
    let best: EnergyKind = ENERGY_KINDS[0]
    for (const k of ENERGY_KINDS) {
      if (result[k].per100km < result[best].per100km) best = k
    }
    return best
  }, [result])

  const inputClass =
    'w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base font-semibold text-dark-800 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20'

  return (
    <div className="space-y-8">
      {/* Consumption + distance inputs */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-card">
        <h2 className="text-lg font-bold text-primary mb-1">Consommation de votre véhicule</h2>
        <p className="text-sm text-gray-500 mb-5">
          Ajustez chaque valeur — pré-remplie avec une moyenne par segment.
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {ENERGY_KINDS.map((kind) => {
            const Icon = KIND_ICON[kind]
            return (
              <div
                key={kind}
                className={cn(
                  'rounded-xl border p-3 sm:p-4',
                  prefilled === kind ? 'border-secondary ring-2 ring-secondary/20' : 'border-gray-200',
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn('inline-flex h-7 w-7 items-center justify-center rounded-lg', KIND_ACCENT[kind])}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-semibold text-dark-800">{ENERGY_KIND_LABELS[kind]}</span>
                </div>
                <label htmlFor={`conso-${kind}`} className="sr-only">
                  Consommation {ENERGY_KIND_LABELS[kind]} en {ENERGY_KIND_UNITS[kind]}
                </label>
                <input
                  id={`conso-${kind}`}
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={0.1}
                  value={consumption[kind]}
                  onChange={(e) => setConsumption((c) => ({ ...c, [kind]: e.target.value }))}
                  className={inputClass}
                />
                <p className="mt-1 text-xs text-gray-400">{ENERGY_KIND_UNITS[kind]}</p>
                {kind === 'electrique' && (
                  <div className="mt-3 flex rounded-lg bg-gray-100 p-0.5 text-xs font-medium">
                    <button
                      type="button"
                      onClick={() => setElectricSource('home')}
                      className={cn(
                        'flex-1 rounded-md px-2 py-1 transition-colors',
                        electricSource === 'home' ? 'bg-white text-secondary shadow-sm' : 'text-gray-500',
                      )}
                    >
                      Domicile
                    </button>
                    <button
                      type="button"
                      onClick={() => setElectricSource('public')}
                      className={cn(
                        'flex-1 rounded-md px-2 py-1 transition-colors',
                        electricSource === 'public' ? 'bg-white text-secondary shadow-sm' : 'text-gray-500',
                      )}
                    >
                      Borne
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <label htmlFor="annual-km" className="text-sm font-semibold text-dark-800 sm:w-56">
            Distance annuelle (km)
          </label>
          <input
            id="annual-km"
            type="number"
            inputMode="numeric"
            min={0}
            step={1000}
            value={annualKm}
            onChange={(e) => setAnnualKm(e.target.value)}
            className={cn(inputClass, 'sm:max-w-[200px]')}
          />
        </div>
      </div>

      {/* Results */}
      <div>
        <h2 className="text-lg font-bold text-primary mb-4">Coût comparé</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {ENERGY_KINDS.map((kind) => {
            const Icon = KIND_ICON[kind]
            const isCheapest = kind === cheapest
            return (
              <div
                key={kind}
                className={cn(
                  'relative rounded-2xl border p-4 sm:p-5 text-center transition-shadow',
                  isCheapest
                    ? 'border-green-300 bg-green-50/60 shadow-card'
                    : 'border-gray-200 bg-white',
                )}
              >
                {isCheapest && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-green-600 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                    <TrendingDown className="h-3 w-3" /> Le moins cher
                  </span>
                )}
                <span className={cn('mx-auto inline-flex h-9 w-9 items-center justify-center rounded-xl', KIND_ACCENT[kind])}>
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-2 text-sm font-semibold text-dark-800">{ENERGY_KIND_LABELS[kind]}</p>
                <p className="mt-1 text-2xl font-bold text-primary">{formatPer100(result[kind].per100km)}</p>
                <p className="text-xs text-gray-400">aux 100 km</p>
                <p className="mt-2 pt-2 border-t border-gray-100 text-sm font-semibold text-secondary">
                  {formatYear(result[kind].perYear)}
                </p>
                <p className="text-xs text-gray-400">par an</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Editable rates (advanced) */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-card overflow-hidden">
        <button
          type="button"
          onClick={() => setRatesOpen((o) => !o)}
          className="flex w-full items-center justify-between px-5 py-4 text-left"
          aria-expanded={ratesOpen}
        >
          <span>
            <span className="block text-sm font-bold text-primary">Tarifs de l&apos;énergie</span>
            <span className="block text-xs text-gray-400">
              Tarifs du {effectiveDate}
              {isFallback ? ' (valeurs par défaut, à titre indicatif)' : ''} — modifiables
            </span>
          </span>
          <ChevronDown className={cn('h-5 w-5 text-gray-400 transition-transform', ratesOpen && 'rotate-180')} />
        </button>
        {ratesOpen && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 border-t border-gray-100 px-5 py-5">
            <RateField label="Essence" unit="DH/L" value={rates.essence} onChange={(v) => setRates((r) => ({ ...r, essence: v }))} inputClass={inputClass} />
            <RateField label="Diesel" unit="DH/L" value={rates.diesel} onChange={(v) => setRates((r) => ({ ...r, diesel: v }))} inputClass={inputClass} />
            <RateField label="Électricité domicile" unit="DH/kWh" value={rates.kwhHome} onChange={(v) => setRates((r) => ({ ...r, kwhHome: v }))} inputClass={inputClass} />
            <RateField label="Électricité borne" unit="DH/kWh" value={rates.kwhPublic} onChange={(v) => setRates((r) => ({ ...r, kwhPublic: v }))} inputClass={inputClass} />
          </div>
        )}
      </div>
    </div>
  )
}

function RateField({
  label,
  unit,
  value,
  onChange,
  inputClass,
}: {
  label: string
  unit: string
  value: string
  onChange: (v: string) => void
  inputClass: string
}) {
  const id = `rate-${label.replace(/\s+/g, '-').toLowerCase()}`
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-dark-800 mb-1">
        {label}
      </label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={0}
        step={0.01}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
      <p className="mt-1 text-xs text-gray-400">{unit}</p>
    </div>
  )
}
