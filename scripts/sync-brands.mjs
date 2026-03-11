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

// Map logo filename slugs to proper display names
const SLUG_TO_NAME = {
  'abarth': 'Abarth',
  'alfa-romeo': 'Alfa Romeo',
  'audi': 'Audi',
  'baic': 'BAIC',
  'bmw': 'BMW',
  'byd': 'BYD',
  'changan': 'Changan',
  'chery': 'Chery',
  'citroen': 'Citroën',
  'cupra': 'Cupra',
  'dacia': 'Dacia',
  'deepal': 'Deepal',
  'dfsk': 'DFSK',
  'dongfeng': 'Dongfeng',
  'ds': 'DS',
  'exeed': 'Exeed',
  'fiat': 'Fiat',
  'ford': 'Ford',
  'geely': 'Geely',
  'gwm': 'GWM',
  'honda': 'Honda',
  'hyundai': 'Hyundai',
  'jac': 'JAC',
  'jaecoo': 'Jaecoo',
  'jaguar': 'Jaguar',
  'jeep': 'Jeep',
  'jetour': 'Jetour',
  'kgm': 'KGM',
  'kia': 'Kia',
  'land-rover': 'Land Rover',
  'leapmotor': 'Leapmotor',
  'lexus': 'Lexus',
  'lynk--et-co': 'Lynk & Co',
  'mahindra': 'Mahindra',
  'maserati': 'Maserati',
  'mazda': 'Mazda',
  'mercedes': 'Mercedes',
  'mg': 'MG',
  'mini': 'Mini',
  'mitsubishi': 'Mitsubishi',
  'nissan': 'Nissan',
  'omoda': 'Omoda',
  'opel': 'Opel',
  'peugeot': 'Peugeot',
  'porsche': 'Porsche',
  'renault': 'Renault',
  'rox': 'Rox',
  'seat': 'Seat',
  'seres': 'Seres',
  'skoda': 'Skoda',
  'smart': 'Smart',
  'soueast': 'SouEast',
  'suzuki': 'Suzuki',
  'toyota': 'Toyota',
  'volkswagen': 'Volkswagen',
  'volvo': 'Volvo',
  'xpeng': 'XPeng',
  'zeekr': 'Zeekr',
}

async function syncBrands() {
  // Read logo files
  const logosDir = path.resolve('public/brands')
  const logoFiles = fs.readdirSync(logosDir).filter(f => f.endsWith('.png'))

  console.log(`Found ${logoFiles.length} logo files`)

  // Build brand data from logo files
  const brandsFromLogos = logoFiles.map(file => {
    const slug = file.replace('.png', '')
    const name = SLUG_TO_NAME[slug]
    if (!name) {
      console.warn(`WARNING: No name mapping for slug "${slug}"`)
      return null
    }
    return {
      name,
      logo_url: `/brands/${file}`,
      slug,
    }
  }).filter(Boolean)

  console.log(`Mapped ${brandsFromLogos.length} brands`)

  // Get existing brands
  const { data: existingBrands, error: fetchError } = await supabase
    .from('brands')
    .select('id, name, logo_url')

  if (fetchError) {
    console.error('Failed to fetch existing brands:', fetchError)
    process.exit(1)
  }

  console.log(`Found ${existingBrands.length} existing brands in DB`)

  // Find brands to delete (not in logos folder)
  const newBrandNames = new Set(brandsFromLogos.map(b => b.name))
  const brandsToDelete = existingBrands.filter(b => !newBrandNames.has(b.name))

  // Find brands to add (in logos but not in DB)
  const existingNames = new Set(existingBrands.map(b => b.name))
  const brandsToAdd = brandsFromLogos.filter(b => !existingNames.has(b.name))

  // Find brands to update logo_url
  const brandsToUpdate = brandsFromLogos.filter(b => {
    const existing = existingBrands.find(e => e.name === b.name)
    return existing && existing.logo_url !== b.logo_url
  })

  console.log(`\nBrands to DELETE (${brandsToDelete.length}):`, brandsToDelete.map(b => b.name))
  console.log(`Brands to ADD (${brandsToAdd.length}):`, brandsToAdd.map(b => b.name))
  console.log(`Brands to UPDATE logo_url (${brandsToUpdate.length}):`, brandsToUpdate.map(b => b.name))

  // Delete brands not in logos folder (CASCADE will remove related models/vehicles)
  if (brandsToDelete.length > 0) {
    const deleteIds = brandsToDelete.map(b => b.id)
    const { error: deleteError } = await supabase
      .from('brands')
      .delete()
      .in('id', deleteIds)

    if (deleteError) {
      console.error('Failed to delete brands:', deleteError)
    } else {
      console.log(`\nDeleted ${brandsToDelete.length} brands`)
    }
  }

  // Add new brands
  if (brandsToAdd.length > 0) {
    const { data: inserted, error: insertError } = await supabase
      .from('brands')
      .insert(brandsToAdd.map(b => ({ name: b.name, logo_url: b.logo_url })))
      .select()

    if (insertError) {
      console.error('Failed to insert brands:', insertError)
    } else {
      console.log(`Inserted ${inserted.length} new brands`)
    }
  }

  // Update logo_url for existing brands
  for (const brand of brandsToUpdate) {
    const existing = existingBrands.find(e => e.name === brand.name)
    const { error: updateError } = await supabase
      .from('brands')
      .update({ logo_url: brand.logo_url })
      .eq('id', existing.id)

    if (updateError) {
      console.error(`Failed to update ${brand.name}:`, updateError)
    }
  }
  if (brandsToUpdate.length > 0) {
    console.log(`Updated ${brandsToUpdate.length} brands logo URLs`)
  }

  // Verify final state
  const { data: finalBrands } = await supabase
    .from('brands')
    .select('id, name, logo_url')
    .order('name')

  console.log(`\n=== Final state: ${finalBrands.length} brands ===`)
  finalBrands.forEach(b => console.log(`  ${b.name}: ${b.logo_url}`))
}

syncBrands().catch(console.error)
