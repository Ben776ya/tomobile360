'use server'

import { createClient } from '@supabase/supabase-js'
import { ImportedCar, validateCar, normalizeBrandName, ImportResult } from '@/lib/car-importer'

/**
 * Import cars into the database
 * Creates brands and models if they don't exist
 */
export async function importCars(cars: ImportedCar[]): Promise<ImportResult> {
  try {
    console.log(`Starting import of ${cars.length} cars...`)

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return {
        success: false,
        message: 'Supabase configuration missing',
      }
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    let imported = 0
    let skipped = 0
    let failed = 0
    const errors: string[] = []

    for (const car of cars) {
      try {
        // Validate car data
        const validation = validateCar(car)
        if (!validation.valid) {
          errors.push(`${car.brand} ${car.model}: ${validation.errors.join(', ')}`)
          failed++
          continue
        }

        // Normalize brand name
        const brandName = normalizeBrandName(car.brand)

        // Find or create brand
        let { data: brand } = await supabase
          .from('brands')
          .select('id')
          .eq('name', brandName)
          .single()

        if (!brand) {
          const { data: newBrand, error: brandError } = await supabase
            .from('brands')
            .insert([{ name: brandName }])
            .select('id')
            .single()

          if (brandError) {
            errors.push(`Failed to create brand ${brandName}: ${brandError.message}`)
            failed++
            continue
          }

          brand = newBrand
        }

        // Find or create model
        let { data: model } = await supabase
          .from('models')
          .select('id')
          .eq('brand_id', brand.id)
          .eq('name', car.model)
          .single()

        if (!model) {
          const { data: newModel, error: modelError } = await supabase
            .from('models')
            .insert([{
              brand_id: brand.id,
              name: car.model,
              category: null // You can add logic to determine category
            }])
            .select('id')
            .single()

          if (modelError) {
            errors.push(`Failed to create model ${car.model}: ${modelError.message}`)
            failed++
            continue
          }

          model = newModel
        }

        // Check if vehicle already exists
        const { data: existingVehicle } = await supabase
          .from('vehicles_new')
          .select('id')
          .eq('brand_id', brand.id)
          .eq('model_id', model.id)
          .eq('year', car.year)
          .eq('version', car.version || '')
          .single()

        if (existingVehicle) {
          console.log(`Skipping existing vehicle: ${brandName} ${car.model} ${car.year}`)
          skipped++
          continue
        }

        // Insert vehicle
        const vehicleData = {
          brand_id: brand.id,
          model_id: model.id,
          version: car.version || null,
          year: car.year,
          price_min: car.price_min || null,
          price_max: car.price_max || null,
          fuel_type: car.fuel_type || null,
          transmission: car.transmission || null,
          engine_size: car.engine_size || null,
          cylinders: car.cylinders || null,
          horsepower: car.horsepower || null,
          torque: car.torque || null,
          acceleration: car.acceleration || null,
          top_speed: car.top_speed || null,
          fuel_consumption_city: car.fuel_consumption_city || null,
          fuel_consumption_highway: car.fuel_consumption_highway || null,
          fuel_consumption_combined: car.fuel_consumption_combined || null,
          co2_emissions: car.co2_emissions || null,
          dimensions: car.dimensions || null,
          cargo_capacity: car.cargo_capacity || null,
          seating_capacity: car.seating_capacity || null,
          features: car.features || null,
          safety_features: car.safety_features || null,
          images: car.images || null,
          is_available: car.is_available !== false,
          is_popular: car.is_popular || false,
          is_new_release: car.is_new_release || false,
          is_coming_soon: car.is_coming_soon || false,
          launch_date: car.launch_date || null,
          // New fields from vroom.be scraping
          doors: car.doors || null,
          warranty_months: car.warranty_months || null,
          exterior_color: car.exterior_color || null,
          interior_color: car.interior_color || null,
          euro_norm: car.euro_norm || null,
          vat_deductible: car.vat_deductible || false,
          power_kw: car.power_kw || null,
          source_url: car.source_url || null,
          mileage: car.mileage || null,
        }

        const { error: insertError } = await supabase
          .from('vehicles_new')
          .insert([vehicleData])

        if (insertError) {
          errors.push(`Failed to insert ${brandName} ${car.model}: ${insertError.message}`)
          failed++
          continue
        }

        imported++
        console.log(`Imported: ${brandName} ${car.model} ${car.year}`)

      } catch (error) {
        errors.push(`Error processing ${car.brand} ${car.model}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        failed++
      }
    }

    return {
      success: true,
      message: `Import completed: ${imported} imported, ${skipped} skipped, ${failed} failed`,
      imported,
      skipped,
      failed,
      errors: errors.slice(0, 10) // Return first 10 errors
    }

  } catch (error) {
    console.error('Import error:', error)
    return {
      success: false,
      message: 'Import failed',
      errors: [error instanceof Error ? error.message : 'Unknown error']
    }
  }
}

/**
 * Get import statistics
 */
export async function getImportStats() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return {
      totalVehicles: 0,
      totalBrands: 0,
      totalModels: 0,
    }
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  const { count: vehicleCount } = await supabase
    .from('vehicles_new')
    .select('*', { count: 'exact', head: true })

  const { count: brandCount } = await supabase
    .from('brands')
    .select('*', { count: 'exact', head: true })

  const { count: modelCount } = await supabase
    .from('models')
    .select('*', { count: 'exact', head: true })

  return {
    totalVehicles: vehicleCount || 0,
    totalBrands: brandCount || 0,
    totalModels: modelCount || 0,
  }
}
