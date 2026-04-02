import type { VehicleCategory } from '@/lib/types'

export const VEHICLE_CATEGORIES: VehicleCategory[] = [
  'Citadine',
  'Compacte',
  'Berline',
  'SUV',
  'Monospace',
  'Break',
  'Coupé',
  'Cabriolet',
  'Pick-up',
  'Utilitaire',
]

export const CATEGORY_COLORS: Record<VehicleCategory, string> = {
  Citadine: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  Compacte: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Berline: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  SUV: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  Monospace: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  Break: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  'Coupé': 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  Cabriolet: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  'Pick-up': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  Utilitaire: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
}
