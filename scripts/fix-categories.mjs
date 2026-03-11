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

function modelSlugToName(slug) {
  return slug.split('-').map(word => {
    if (['phev', 'hev', 'ev', 'gt', 'rs', 'amg', 'gtx', 'gti', 'gte', 'tdi'].includes(word.toLowerCase())) return word.toUpperCase()
    if (/^\d+$/.test(word)) return word
    return word.charAt(0).toUpperCase() + word.slice(1)
  }).join(' ')
}

function mapCategory(categorie, carrosserie) {
  const cat = (categorie || '').toLowerCase()
  const car = (carrosserie || '').toLowerCase()
  const combined = cat + ' ' + car

  // SUV / Crossover
  if (cat.includes('suv') || cat.includes('4x4') || cat.includes('crossover') || car.includes('suv') || car.includes('crossover')) return 'SUV'
  // Citadine
  if (cat.includes('citadine') || car.includes('citadine')) return 'Citadine'
  // Micro citadine → Citadine
  if (cat.includes('micro')) return 'Citadine'
  // Compacte
  if (cat.includes('compacte') || car.includes('compacte')) return 'Compacte'
  // Berline (Familiale, Routière, Luxe/Prestige with berline)
  if (cat.includes('familiale') || cat.includes('routière') || cat.includes('routiere')) return 'Berline'
  if (cat.includes('luxe') || cat.includes('prestige')) return 'Berline'
  // Monospace / Break
  if (cat.includes('monospace') || cat.includes('break') || car.includes('minivan') || car.includes('monospace')) return 'Monospace'
  // Ludospace / Utilitaire
  if (cat.includes('ludospace') || cat.includes('utilitaire')) {
    if (car.includes('pick')) return 'Pick-up'
    return 'Utilitaire'
  }
  // Coupé / Sportive
  if (cat.includes('coupé') || cat.includes('coupe') || cat.includes('sportive') || car.includes('coupé') || car.includes('coupe')) return 'Coupé'
  // Cabriolet / Roadster
  if (cat.includes('cabriolet') || cat.includes('roadster') || car.includes('cabriolet') || car.includes('roadster')) return 'Cabriolet'
  // Pick-up
  if (car.includes('pick')) return 'Pick-up'
  // Berline fallback for berline carrosserie
  if (car.includes('berline') || car.includes('limousine')) return 'Berline'

  return 'Compacte' // safer default
}

async function fixCategories() {
  const fichesDir = path.resolve('fiches')

  const { data: brands } = await supabase.from('brands').select('id, name')
  const brandByName = {}
  for (const b of brands) brandByName[b.name] = b.id

  const { data: models } = await supabase.from('models').select('id, name, brand_id, category')
  const modelLookup = {}
  for (const m of models) modelLookup[m.brand_id + ':' + m.name] = m

  let updated = 0

  const brandSlugs = fs.readdirSync(fichesDir).filter(f => fs.statSync(path.join(fichesDir, f)).isDirectory())

  for (const brandSlug of brandSlugs) {
    const brandName = SLUG_TO_NAME[brandSlug]
    if (!brandName) continue
    const brandId = brandByName[brandName]
    if (!brandId) continue

    const ficheFiles = fs.readdirSync(path.join(fichesDir, brandSlug)).filter(f => f.endsWith('.json'))

    for (const ficheFile of ficheFiles) {
      const modelSlug = ficheFile.replace('.json', '')
      const modelDisplayName = modelSlugToName(modelSlug)
      const ficheData = JSON.parse(fs.readFileSync(path.join(fichesDir, brandSlug, ficheFile), 'utf-8'))
      const dims = ficheData.specs['DIMENSIONS & VOLUMES'] || {}
      const newCategory = mapCategory(dims['Catégorie'], dims['Carrosserie'])

      const model = modelLookup[brandId + ':' + modelDisplayName]
      if (model && model.category !== newCategory) {
        const { error } = await supabase.from('models').update({ category: newCategory }).eq('id', model.id)
        if (!error) {
          updated++
          console.log(`  ${brandName} ${modelDisplayName}: ${model.category} → ${newCategory}`)
        }
      }
    }
  }

  console.log(`\nUpdated ${updated} model categories`)

  // Verify distribution
  const { data: allModels } = await supabase.from('models').select('category')
  const dist = {}
  for (const m of allModels) {
    dist[m.category] = (dist[m.category] || 0) + 1
  }
  console.log('\nCategory distribution:')
  Object.entries(dist).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  ${k}: ${v}`))
}

fixCategories().catch(console.error)
