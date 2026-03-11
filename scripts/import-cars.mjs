import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Brand slug to display name mapping (same as sync-brands.mjs)
const SLUG_TO_NAME = {
  'abarth': 'Abarth', 'alfa-romeo': 'Alfa Romeo', 'audi': 'Audi', 'baic': 'BAIC',
  'bmw': 'BMW', 'byd': 'BYD', 'changan': 'Changan', 'chery': 'Chery',
  'citroen': 'Citroën', 'cupra': 'Cupra', 'dacia': 'Dacia', 'deepal': 'Deepal',
  'dfsk': 'DFSK', 'dongfeng': 'Dongfeng', 'ds': 'DS', 'exeed': 'Exeed',
  'fiat': 'Fiat', 'ford': 'Ford', 'geely': 'Geely', 'gwm': 'GWM',
  'honda': 'Honda', 'hyundai': 'Hyundai', 'jac': 'JAC', 'jaecoo': 'Jaecoo',
  'jaguar': 'Jaguar', 'jeep': 'Jeep', 'jetour': 'Jetour', 'kgm': 'KGM',
  'kia': 'Kia', 'land-rover': 'Land Rover', 'leapmotor': 'Leapmotor', 'lexus': 'Lexus',
  'lynk--et-co': 'Lynk & Co', 'mahindra': 'Mahindra', 'maserati': 'Maserati',
  'mazda': 'Mazda', 'mercedes': 'Mercedes', 'mg': 'MG', 'mini': 'Mini',
  'mitsubishi': 'Mitsubishi', 'nissan': 'Nissan', 'omoda': 'Omoda', 'opel': 'Opel',
  'peugeot': 'Peugeot', 'porsche': 'Porsche', 'renault': 'Renault', 'rox': 'Rox',
  'seat': 'Seat', 'seres': 'Seres', 'skoda': 'Skoda', 'smart': 'Smart',
  'soueast': 'SouEast', 'suzuki': 'Suzuki', 'toyota': 'Toyota',
  'volkswagen': 'Volkswagen', 'volvo': 'Volvo', 'xpeng': 'XPeng', 'zeekr': 'Zeekr',
}

// Map fiche energy values to DB fuel_type enum
function mapFuelType(energie) {
  if (!energie) return null
  const e = energie.toLowerCase()
  if (e.includes('electrique') || e === 'électrique') return 'Electric'
  if (e.includes('hybride rechargeable') || e.includes('phev')) return 'PHEV'
  if (e.includes('hybride') || e.includes('mhev') || e.includes('hev')) return 'Hybrid'
  if (e.includes('diesel')) return 'Diesel'
  if (e.includes('essence')) return 'Essence'
  return null
}

// Map fiche transmission to DB transmission enum
function mapTransmission(boite) {
  if (!boite) return null
  const b = boite.toLowerCase()
  if (b.includes('automatique') || b.includes('auto')) return 'Automatic'
  if (b.includes('manuelle') || b.includes('manuel')) return 'Manual'
  if (b.includes('cvt')) return 'CVT'
  if (b.includes('double embrayage') || b.includes('dct') || b.includes('dsg')) return 'DCT'
  return 'Automatic' // default for other automatic types
}

// Map fiche category to model category
function mapCategory(categorie, carrosserie) {
  const cat = (categorie || carrosserie || '').toLowerCase()
  if (cat.includes('suv') || cat.includes('4x4') || cat.includes('crossover')) return 'SUV'
  if (cat.includes('citadine')) return 'Citadine'
  if (cat.includes('compacte')) return 'Compacte'
  if (cat.includes('berline')) return 'Berline'
  if (cat.includes('monospace')) return 'Monospace'
  if (cat.includes('break')) return 'Break'
  if (cat.includes('coupé') || cat.includes('coupe')) return 'Coupé'
  if (cat.includes('cabriolet') || cat.includes('roadster') || cat.includes('spider')) return 'Cabriolet'
  if (cat.includes('pick')) return 'Pick-up'
  if (cat.includes('utilitaire') || cat.includes('van') || cat.includes('fourgon')) return 'Utilitaire'
  return 'SUV' // default
}

// Parse horsepower from various formats
function parseHP(specs) {
  const motor = specs['MOTEUR & INFOS TECHNIQUES'] || {}
  // Try "Puissance dynamique" first, then "Puissance cumulée"
  const val = motor['Puissance dynamique'] || motor['Puissance cumulée']
  if (!val) return null
  const match = String(val).match(/(\d+)\s*ch/)
  return match ? parseInt(match[1]) : null
}

// Parse torque
function parseTorque(specs) {
  const motor = specs['MOTEUR & INFOS TECHNIQUES'] || {}
  const val = motor['Couple maxi.']
  if (!val) return null
  const match = String(val).match(/(\d+)\s*Nm/)
  return match ? parseInt(match[1]) : null
}

// Parse number from string like "5", "542 litre", "1.205 kg"
function parseNumber(val) {
  if (val == null) return null
  const s = String(val).replace(/\./g, '').replace(/,/g, '.')
  const match = s.match(/([\d.]+)/)
  return match ? parseInt(match[1]) : null
}

// Convert model slug to display name
function modelSlugToName(slug) {
  return slug
    .split('-')
    .map(word => {
      // Preserve common acronyms
      if (['phev', 'hev', 'ev', 'gt', 'rs', 'amg', 'gtx', 'gti', 'gte', 'tdi'].includes(word.toLowerCase())) {
        return word.toUpperCase()
      }
      // Preserve numbers/series
      if (/^\d+$/.test(word)) return word
      // Capitalize first letter
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}

async function importCars() {
  const fichesDir = path.resolve('fiches')
  const imagesDir = path.resolve('public/vehicles')

  // 1. Fetch all brands from DB
  const { data: brands, error: brandsError } = await supabase
    .from('brands')
    .select('id, name')

  if (brandsError) {
    console.error('Failed to fetch brands:', brandsError)
    process.exit(1)
  }

  const brandByName = {}
  for (const b of brands) brandByName[b.name] = b.id
  console.log(`Loaded ${brands.length} brands from DB`)

  // 2. Delete all existing test data
  console.log('\nDeleting existing test data...')

  // Delete vehicles first (they reference models)
  const { error: delVehicles } = await supabase.from('vehicles_new').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  console.log('Delete vehicles_new:', delVehicles ? delVehicles.message : 'OK')

  // Delete models
  const { error: delModels } = await supabase.from('models').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  console.log('Delete models:', delModels ? delModels.message : 'OK')

  // 3. Process each brand
  let totalModels = 0
  let totalVehicles = 0
  let errors = []

  const brandSlugs = fs.readdirSync(fichesDir).filter(f =>
    fs.statSync(path.join(fichesDir, f)).isDirectory()
  )

  for (const brandSlug of brandSlugs) {
    const brandName = SLUG_TO_NAME[brandSlug]
    if (!brandName) {
      console.warn(`  SKIP: No name mapping for brand slug "${brandSlug}"`)
      continue
    }

    const brandId = brandByName[brandName]
    if (!brandId) {
      console.warn(`  SKIP: Brand "${brandName}" not found in DB`)
      continue
    }

    const brandFichesDir = path.join(fichesDir, brandSlug)
    const ficheFiles = fs.readdirSync(brandFichesDir).filter(f => f.endsWith('.json'))

    console.log(`\n[${brandName}] Processing ${ficheFiles.length} models...`)

    for (const ficheFile of ficheFiles) {
      const modelSlug = ficheFile.replace('.json', '')
      const modelDisplayName = modelSlugToName(modelSlug)

      // Read spec data
      let ficheData
      try {
        ficheData = JSON.parse(fs.readFileSync(path.join(brandFichesDir, ficheFile), 'utf-8'))
      } catch (e) {
        errors.push(`Failed to parse ${brandSlug}/${ficheFile}: ${e.message}`)
        continue
      }

      const specs = ficheData.specs || {}
      const motor = specs['MOTEUR & INFOS TECHNIQUES'] || {}
      const dims = specs['DIMENSIONS & VOLUMES'] || {}

      // Determine model category
      const category = mapCategory(dims['Catégorie'], dims['Carrosserie'])

      // Create model
      const { data: model, error: modelError } = await supabase
        .from('models')
        .insert({
          brand_id: brandId,
          name: modelDisplayName,
          category: category,
        })
        .select('id')
        .single()

      if (modelError) {
        // If model already exists (unique constraint), fetch it
        if (modelError.code === '23505') {
          const { data: existingModel } = await supabase
            .from('models')
            .select('id')
            .eq('brand_id', brandId)
            .eq('name', modelDisplayName)
            .single()

          if (!existingModel) {
            errors.push(`Model ${brandName} ${modelDisplayName}: insert failed and lookup failed`)
            continue
          }
          var modelId = existingModel.id
        } else {
          errors.push(`Model ${brandName} ${modelDisplayName}: ${modelError.message}`)
          continue
        }
      } else {
        var modelId = model.id
        totalModels++
      }

      // Collect images
      const modelImagesDir = path.join(imagesDir, brandSlug, modelSlug)
      let imageFiles = []
      if (fs.existsSync(modelImagesDir)) {
        imageFiles = fs.readdirSync(modelImagesDir)
          .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
          .sort()
          .map(f => `/vehicles/${brandSlug}/${modelSlug}/${f}`)
      }

      // Map fields
      const fuelType = mapFuelType(motor['Energie'])
      const transmission = mapTransmission(motor['Boîte à vitesse'])
      const horsepower = parseHP(specs)
      const torque = parseTorque(specs)
      const seatingCapacity = parseNumber(dims['Nombre de places'])
      const cargoCapacity = parseNumber(dims['Volume de coffre'])

      // Build dimensions object
      const dimensions = {}
      if (dims['Longueur']) dimensions.length = dims['Longueur']
      if (dims['Largeur']) dimensions.width = dims['Largeur']
      if (dims['Hauteur']) dimensions.height = dims['Hauteur']
      if (dims['Empattement']) dimensions.wheelbase = dims['Empattement']
      if (dims['Poids à vide']) dimensions.weight = dims['Poids à vide']
      if (dims['Volume du réservoir']) dimensions.fuel_tank = dims['Volume du réservoir']

      // Build the vehicle version from motorisation
      const version = motor['Motorisation'] || null

      // Store the FULL spec data in features JSONB
      const fullSpecs = ficheData.specs

      // Extract safety feature names (those that are true or have a string value)
      const safetySection = specs['SÉCURITÉ'] || {}
      const safetyFeatures = Object.entries(safetySection)
        .filter(([_, v]) => v === true || (typeof v === 'string' && v !== 'false'))
        .map(([k, v]) => typeof v === 'string' ? `${k}: ${v}` : k)

      // Insert vehicle
      const vehicleData = {
        brand_id: brandId,
        model_id: modelId,
        version: version,
        year: 2025,
        fuel_type: fuelType,
        transmission: transmission,
        horsepower: horsepower,
        torque: torque,
        seating_capacity: seatingCapacity,
        cargo_capacity: cargoCapacity,
        dimensions: Object.keys(dimensions).length > 0 ? dimensions : null,
        features: fullSpecs,
        safety_features: safetyFeatures.length > 0 ? safetyFeatures : null,
        images: imageFiles.length > 0 ? imageFiles : null,
        is_available: true,
        is_popular: false,
        is_new_release: false,
        source_url: ficheData.url || null,
      }

      const { error: vehicleError } = await supabase
        .from('vehicles_new')
        .insert(vehicleData)

      if (vehicleError) {
        errors.push(`Vehicle ${brandName} ${modelDisplayName}: ${vehicleError.message}`)
        console.error(`  ERROR: ${brandName} ${modelDisplayName}: ${vehicleError.message}`)
      } else {
        totalVehicles++
        console.log(`  ✓ ${modelDisplayName} (${imageFiles.length} images, ${fuelType || 'N/A'})`)
      }
    }
  }

  // Also handle brands that have images but no fiches (e.g., lynk--et-co)
  // Check for image-only folders
  const imageBrandSlugs = fs.readdirSync(imagesDir).filter(f =>
    fs.statSync(path.join(imagesDir, f)).isDirectory()
  )

  for (const brandSlug of imageBrandSlugs) {
    if (brandSlugs.includes(brandSlug)) continue // already processed
    const brandName = SLUG_TO_NAME[brandSlug]
    if (!brandName || !brandByName[brandName]) continue

    console.log(`\n[${brandName}] Images-only (no fiches), processing models...`)
    const brandId = brandByName[brandName]
    const modelDirs = fs.readdirSync(path.join(imagesDir, brandSlug))
      .filter(f => fs.statSync(path.join(imagesDir, brandSlug, f)).isDirectory())

    for (const modelSlug of modelDirs) {
      const modelDisplayName = modelSlugToName(modelSlug)

      const { data: model } = await supabase
        .from('models')
        .insert({ brand_id: brandId, name: modelDisplayName, category: 'SUV' })
        .select('id')
        .single()

      if (!model) continue
      totalModels++

      const modelImagesDir = path.join(imagesDir, brandSlug, modelSlug)
      const imageFiles = fs.readdirSync(modelImagesDir)
        .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
        .sort()
        .map(f => `/vehicles/${brandSlug}/${modelSlug}/${f}`)

      const { error } = await supabase.from('vehicles_new').insert({
        brand_id: brandId,
        model_id: model.id,
        year: 2025,
        images: imageFiles.length > 0 ? imageFiles : null,
        is_available: true,
      })

      if (error) {
        errors.push(`Vehicle ${brandName} ${modelDisplayName} (images-only): ${error.message}`)
      } else {
        totalVehicles++
        console.log(`  ✓ ${modelDisplayName} (${imageFiles.length} images, no specs)`)
      }
    }
  }

  console.log(`\n=== Import Complete ===`)
  console.log(`Models created: ${totalModels}`)
  console.log(`Vehicles created: ${totalVehicles}`)

  if (errors.length > 0) {
    console.log(`\nErrors (${errors.length}):`)
    errors.forEach(e => console.log(`  - ${e}`))
  }

  // Final verification
  const { count: brandCount } = await supabase.from('brands').select('*', { count: 'exact', head: true })
  const { count: modelCount } = await supabase.from('models').select('*', { count: 'exact', head: true })
  const { count: vehicleCount } = await supabase.from('vehicles_new').select('*', { count: 'exact', head: true })

  console.log(`\n=== Final DB State ===`)
  console.log(`Brands: ${brandCount}`)
  console.log(`Models: ${modelCount}`)
  console.log(`Vehicles (new): ${vehicleCount}`)
}

importCars().catch(console.error)
