// Car Data Importer
// Utilities for importing car data from various sources (including vroom.be)

export interface ImportedCar {
  // Basic Info
  brand: string
  model: string
  version?: string
  year: number

  // Pricing
  price_min?: number
  price_max?: number

  // Technical Specs
  fuel_type?: 'Essence' | 'Diesel' | 'Hybrid' | 'Electric' | 'PHEV'
  transmission?: 'Manual' | 'Automatic' | 'CVT' | 'DCT'
  engine_size?: number
  cylinders?: number
  horsepower?: number
  torque?: number
  acceleration?: number
  top_speed?: number
  power_kw?: number

  // Consumption & Emissions
  fuel_consumption_city?: number
  fuel_consumption_highway?: number
  fuel_consumption_combined?: number
  co2_emissions?: number
  euro_norm?: string

  // Dimensions & Capacity
  dimensions?: {
    length?: number
    width?: number
    height?: number
    wheelbase?: number
  }
  cargo_capacity?: number
  seating_capacity?: number
  doors?: number

  // Colors
  exterior_color?: string
  interior_color?: string

  // Additional Info
  warranty_months?: number
  vat_deductible?: boolean
  mileage?: number
  source_url?: string

  // Features
  features?: string[]
  safety_features?: string[]

  // Media
  images?: string[]

  // Status
  is_available?: boolean
  is_popular?: boolean
  is_new_release?: boolean
  is_coming_soon?: boolean
  launch_date?: string
}

export interface ImportResult {
  success: boolean
  message: string
  imported?: number
  skipped?: number
  failed?: number
  errors?: string[]
}

// Vroom.be scraped data format
interface VroomScrapedCar {
  url: string
  title: string
  specs: {
    'Prix'?: string
    '1ère immatriculation'?: string
    'Type'?: string
    'Kilométrage'?: string
    'Garantie'?: string
    'Moteur'?: string
    'Carrosserie'?: string
    'Portes'?: string
    'TVA déductible'?: string
    'Cylindrée'?: string
    'Puissance'?: string
    'Puissance (hp)'?: string
    'Boîte'?: string
    'Transmission'?: string
    'Couleur extérieure'?: string
    'Couleur intérieure'?: string
    'Émission CO₂'?: string
    'Norme Euro'?: string
    [key: string]: string | undefined
  }
  images: string[]
}

/**
 * Parse price string from vroom.be format (e.g., "111 990 €")
 */
function parseVroomPrice(priceStr: string | undefined): number | undefined {
  if (!priceStr || priceStr === '-') return undefined
  const cleaned = priceStr.replace(/[^\d]/g, '')
  const price = parseInt(cleaned)
  return isNaN(price) ? undefined : price
}

/**
 * Parse engine size from vroom.be format (e.g., "2 999 cc")
 */
function parseEngineSize(sizeStr: string | undefined): number | undefined {
  if (!sizeStr || sizeStr === '-') return undefined
  const cleaned = sizeStr.replace(/[^\d]/g, '')
  const cc = parseInt(cleaned)
  if (isNaN(cc)) return undefined
  // Convert cc to liters (e.g., 2999cc = 3.0L)
  return Math.round(cc / 100) / 10
}

/**
 * Parse horsepower from vroom.be format (e.g., "250 ch")
 */
function parseHorsepower(hpStr: string | undefined): number | undefined {
  if (!hpStr || hpStr === '-') return undefined
  const match = hpStr.match(/(\d+)/)
  return match ? parseInt(match[1]) : undefined
}

/**
 * Parse power in kW from vroom.be format (e.g., "184 kW")
 */
function parsePowerKw(kwStr: string | undefined): number | undefined {
  if (!kwStr || kwStr === '-') return undefined
  const match = kwStr.match(/(\d+)/)
  return match ? parseInt(match[1]) : undefined
}

/**
 * Parse CO2 emissions from vroom.be format (e.g., "223 g/km")
 */
function parseCO2(co2Str: string | undefined): number | undefined {
  if (!co2Str || co2Str === '-') return undefined
  const match = co2Str.match(/(\d+)/)
  return match ? parseInt(match[1]) : undefined
}

/**
 * Parse doors from vroom.be format (e.g., "3" or "5")
 */
function parseDoors(doorsStr: string | undefined): number | undefined {
  if (!doorsStr || doorsStr === '-') return undefined
  const doors = parseInt(doorsStr)
  return isNaN(doors) ? undefined : doors
}

/**
 * Parse warranty months from vroom.be format (e.g., "24")
 */
function parseWarranty(warrantyStr: string | undefined): number | undefined {
  if (!warrantyStr || warrantyStr === '-') return undefined
  const months = parseInt(warrantyStr)
  return isNaN(months) ? undefined : months
}

/**
 * Parse mileage from vroom.be format (e.g., "0 km" or "15 000 km")
 */
function parseMileage(mileageStr: string | undefined): number | undefined {
  if (!mileageStr || mileageStr === '-') return undefined
  const cleaned = mileageStr.replace(/[^\d]/g, '')
  const mileage = parseInt(cleaned)
  return isNaN(mileage) ? undefined : mileage
}

/**
 * Map vroom.be fuel type to our system
 */
function mapFuelType(moteur: string | undefined): ImportedCar['fuel_type'] | undefined {
  if (!moteur || moteur === '-') return undefined

  const fuelMap: { [key: string]: ImportedCar['fuel_type'] } = {
    'diesel': 'Diesel',
    'essence': 'Essence',
    'hybride': 'Hybrid',
    'hybrid': 'Hybrid',
    'électrique': 'Electric',
    'electrique': 'Electric',
    'electric': 'Electric',
    'plug-in hybrid': 'PHEV',
    'phev': 'PHEV',
    'hybride rechargeable': 'PHEV',
  }

  const normalized = moteur.toLowerCase().trim()
  return fuelMap[normalized] || (normalized.includes('diesel') ? 'Diesel' :
         normalized.includes('essence') ? 'Essence' :
         normalized.includes('hybrid') ? 'Hybrid' :
         normalized.includes('electr') ? 'Electric' : undefined)
}

/**
 * Map vroom.be transmission to our system
 */
function mapTransmission(boite: string | undefined): ImportedCar['transmission'] | undefined {
  if (!boite || boite === '-') return undefined

  const transMap: { [key: string]: ImportedCar['transmission'] } = {
    'automatique': 'Automatic',
    'automatic': 'Automatic',
    'auto': 'Automatic',
    'manuelle': 'Manual',
    'manual': 'Manual',
    'cvt': 'CVT',
    'dct': 'DCT',
    'boîte automatique': 'Automatic',
    'boîte manuelle': 'Manual',
  }

  const normalized = boite.toLowerCase().trim()
  return transMap[normalized] || (normalized.includes('auto') ? 'Automatic' :
         normalized.includes('manu') ? 'Manual' : undefined)
}

/**
 * Map vroom.be body type to our category
 */
function mapCategory(carrosserie: string | undefined): string | null {
  if (!carrosserie || carrosserie === '-') return null

  const categoryMap: { [key: string]: string } = {
    'suv': 'SUV',
    'berline': 'Berline',
    'citadine': 'Citadine',
    'compacte': 'Compacte',
    'compact': 'Compacte',
    'break': 'Break',
    'monospace': 'Monospace',
    'coupé': 'Coupé',
    'coupe': 'Coupé',
    'cabriolet': 'Cabriolet',
    'pick-up': 'Pick-up',
    'pickup': 'Pick-up',
    'utilitaire': 'Utilitaire',
    '4x4': 'SUV',
    'crossover': 'SUV',
  }

  const normalized = carrosserie.toLowerCase().trim()
  return categoryMap[normalized] || null
}

/**
 * Extract brand and model from vroom.be title
 * Format: "Land Rover Defender" or "BMW X5" etc.
 */
function extractBrandModel(title: string): { brand: string; model: string } {
  // Common multi-word brands
  const multiWordBrands = [
    'Land Rover', 'Alfa Romeo', 'Aston Martin', 'Mercedes-Benz', 'Mercedes Benz',
    'Rolls Royce', 'Rolls-Royce'
  ]

  for (const brand of multiWordBrands) {
    if (title.toLowerCase().startsWith(brand.toLowerCase())) {
      return {
        brand: brand,
        model: title.slice(brand.length).trim()
      }
    }
  }

  // Single word brand (first word)
  const parts = title.split(' ')
  return {
    brand: parts[0],
    model: parts.slice(1).join(' ')
  }
}

/**
 * Parse vroom.be scraped JSON data to ImportedCar format
 */
function parseVroomCar(vroomCar: VroomScrapedCar): ImportedCar | null {
  try {
    const { brand, model } = extractBrandModel(vroomCar.title)
    const specs = vroomCar.specs

    // Determine year from registration or current year
    let year = new Date().getFullYear()
    if (specs['1ère immatriculation'] && specs['1ère immatriculation'] !== '-') {
      const yearMatch = specs['1ère immatriculation'].match(/(\d{4})/)
      if (yearMatch) {
        year = parseInt(yearMatch[1])
      }
    }

    const importedCar: ImportedCar = {
      brand: normalizeBrandName(brand),
      model: model || 'Unknown',
      year: year,

      // Pricing (convert EUR to MAD approximately - 1 EUR ≈ 11 MAD)
      price_min: parseVroomPrice(specs['Prix']),

      // Technical specs
      fuel_type: mapFuelType(specs['Moteur']),
      transmission: mapTransmission(specs['Boîte']),
      engine_size: parseEngineSize(specs['Cylindrée']),
      horsepower: parseHorsepower(specs['Puissance (hp)']),
      power_kw: parsePowerKw(specs['Puissance']),
      co2_emissions: parseCO2(specs['Émission CO₂']),

      // New fields
      doors: parseDoors(specs['Portes']),
      warranty_months: parseWarranty(specs['Garantie']),
      exterior_color: specs['Couleur extérieure'] !== '-' ? specs['Couleur extérieure'] : undefined,
      interior_color: specs['Couleur intérieure'] !== '-' ? specs['Couleur intérieure'] : undefined,
      euro_norm: specs['Norme Euro'] !== '-' ? specs['Norme Euro'] : undefined,
      vat_deductible: specs['TVA déductible']?.toLowerCase() === 'oui',
      mileage: parseMileage(specs['Kilométrage']),
      source_url: vroomCar.url,

      // Images
      images: vroomCar.images,

      // Status
      is_available: true,
      is_new_release: specs['Type']?.toLowerCase().includes('neuve') || false,
    }

    return importedCar
  } catch (error) {
    console.error('Error parsing vroom car:', error)
    return null
  }
}

/**
 * Check if JSON is in vroom.be format
 */
function isVroomFormat(data: any): data is VroomScrapedCar[] {
  if (!Array.isArray(data)) return false
  if (data.length === 0) return false

  const firstItem = data[0]
  return firstItem.url !== undefined &&
         firstItem.title !== undefined &&
         firstItem.specs !== undefined &&
         firstItem.images !== undefined
}

/**
 * Parse CSV data to car objects
 */
export function parseCSVCars(csvText: string): ImportedCar[] {
  const lines = csvText.trim().split('\n')
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map(h => h.trim())
  const cars: ImportedCar[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim())
    const car: any = {}

    headers.forEach((header, index) => {
      const value = values[index]
      if (value && value !== '') {
        // Map common CSV headers to car properties
        const lowerHeader = header.toLowerCase()

        if (lowerHeader.includes('brand') || lowerHeader.includes('marque')) {
          car.brand = value
        } else if (lowerHeader.includes('model') || lowerHeader.includes('modèle')) {
          car.model = value
        } else if (lowerHeader.includes('year') || lowerHeader.includes('année')) {
          car.year = parseInt(value)
        } else if (lowerHeader.includes('price') || lowerHeader.includes('prix')) {
          car.price_min = parseFloat(value.replace(/[^\d.]/g, ''))
        } else if (lowerHeader.includes('fuel') || lowerHeader.includes('carburant') || lowerHeader.includes('moteur')) {
          car.fuel_type = mapFuelType(value) || value
        } else if (lowerHeader.includes('transmission') || lowerHeader.includes('boîte') || lowerHeader.includes('boite')) {
          car.transmission = mapTransmission(value) || value
        } else if (lowerHeader.includes('horsepower') || lowerHeader.includes('chevaux') || lowerHeader.includes('ch') || lowerHeader.includes('puissance')) {
          car.horsepower = parseInt(value)
        } else if (lowerHeader.includes('doors') || lowerHeader.includes('portes')) {
          car.doors = parseInt(value)
        } else if (lowerHeader.includes('color') || lowerHeader.includes('couleur')) {
          if (lowerHeader.includes('int')) {
            car.interior_color = value
          } else {
            car.exterior_color = value
          }
        } else if (lowerHeader.includes('warranty') || lowerHeader.includes('garantie')) {
          car.warranty_months = parseInt(value)
        } else if (lowerHeader.includes('co2') || lowerHeader.includes('emission')) {
          car.co2_emissions = parseInt(value.replace(/[^\d]/g, ''))
        } else if (lowerHeader.includes('euro') || lowerHeader.includes('norme')) {
          car.euro_norm = value
        }
      }
    })

    if (car.brand && car.model && car.year) {
      cars.push(car as ImportedCar)
    }
  }

  return cars
}

/**
 * Parse JSON data to car objects (supports both standard format and vroom.be format)
 */
export function parseJSONCars(jsonText: string): ImportedCar[] {
  try {
    const data = JSON.parse(jsonText)

    // Check if it's vroom.be scraped format
    if (isVroomFormat(data)) {
      const cars: ImportedCar[] = []
      for (const vroomCar of data) {
        const parsed = parseVroomCar(vroomCar)
        if (parsed) {
          cars.push(parsed)
        }
      }
      return cars
    }

    // Handle standard array of cars
    if (Array.isArray(data)) {
      return data.filter(car => car.brand && car.model && car.year)
    }

    // Handle wrapped data (e.g., { cars: [...] })
    if (data.cars && Array.isArray(data.cars)) {
      // Check if wrapped cars are in vroom format
      if (isVroomFormat(data.cars)) {
        const cars: ImportedCar[] = []
        for (const vroomCar of data.cars) {
          const parsed = parseVroomCar(vroomCar)
          if (parsed) {
            cars.push(parsed)
          }
        }
        return cars
      }
      return data.cars.filter((car: any) => car.brand && car.model && car.year)
    }

    // Handle single car object
    if (data.brand && data.model) {
      return [data]
    }

    // Handle single vroom car
    if (data.url && data.title && data.specs) {
      const parsed = parseVroomCar(data as VroomScrapedCar)
      return parsed ? [parsed] : []
    }

    return []
  } catch (error) {
    console.error('Error parsing JSON:', error)
    return []
  }
}

/**
 * Validate car data before import
 */
export function validateCar(car: ImportedCar): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!car.brand || car.brand.trim() === '') {
    errors.push('Brand is required')
  }

  if (!car.model || car.model.trim() === '') {
    errors.push('Model is required')
  }

  if (!car.year || car.year < 1900 || car.year > new Date().getFullYear() + 2) {
    errors.push('Valid year is required')
  }

  if (car.fuel_type && !['Essence', 'Diesel', 'Hybrid', 'Electric', 'PHEV'].includes(car.fuel_type)) {
    errors.push('Invalid fuel type')
  }

  if (car.transmission && !['Manual', 'Automatic', 'CVT', 'DCT'].includes(car.transmission)) {
    errors.push('Invalid transmission type')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Normalize brand name (handle different spellings/formats)
 */
export function normalizeBrandName(brand: string): string {
  const brandMap: { [key: string]: string } = {
    'mercedes-benz': 'Mercedes',
    'mercedes benz': 'Mercedes',
    'mercedes': 'Mercedes',
    'vw': 'Volkswagen',
    'bmw': 'BMW',
    'citroen': 'Citroën',
    'citroën': 'Citroën',
    'peugeot': 'Peugeot',
    'renault': 'Renault',
    'toyota': 'Toyota',
    'hyundai': 'Hyundai',
    'kia': 'Kia',
    'audi': 'Audi',
    'seat': 'Seat',
    'skoda': 'Skoda',
    'škoda': 'Skoda',
    'mg': 'MG',
    'dacia': 'Dacia',
    'land rover': 'Land Rover',
    'land-rover': 'Land Rover',
    'alfa romeo': 'Alfa Romeo',
    'alfa-romeo': 'Alfa Romeo',
    'aston martin': 'Aston Martin',
    'aston-martin': 'Aston Martin',
    'rolls royce': 'Rolls Royce',
    'rolls-royce': 'Rolls Royce',
    'ford': 'Ford',
    'nissan': 'Nissan',
    'mazda': 'Mazda',
    'honda': 'Honda',
    'fiat': 'Fiat',
    'opel': 'Opel',
    'volvo': 'Volvo',
    'jaguar': 'Jaguar',
    'porsche': 'Porsche',
    'lexus': 'Lexus',
    'infiniti': 'Infiniti',
    'mini': 'Mini',
    'jeep': 'Jeep',
    'tesla': 'Tesla',
    'chevrolet': 'Chevrolet',
    'dodge': 'Dodge',
    'chrysler': 'Chrysler',
    'subaru': 'Subaru',
    'mitsubishi': 'Mitsubishi',
    'suzuki': 'Suzuki',
    'cupra': 'Cupra',
    'genesis': 'Genesis',
    'maserati': 'Maserati',
    'ferrari': 'Ferrari',
    'lamborghini': 'Lamborghini',
    'bentley': 'Bentley',
    'bugatti': 'Bugatti',
  }

  const normalized = brand.toLowerCase().trim()
  return brandMap[normalized] || brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase()
}

