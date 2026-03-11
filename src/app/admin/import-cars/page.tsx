'use client'

import { useState, useEffect } from 'react'
import { importCars, getImportStats } from '@/app/actions/import-cars'
import { parseCSVCars, parseJSONCars } from '@/lib/car-importer'
import { Button } from '@/components/ui/button'
import { Upload, Car, Database, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function ImportCarsPage() {
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    imported?: number
    skipped?: number
    failed?: number
    errors?: string[]
  } | null>(null)
  const [stats, setStats] = useState<{
    totalVehicles: number
    totalBrands: number
    totalModels: number
  } | null>(null)
  const [fileContent, setFileContent] = useState<string>('')
  const [fileType, setFileType] = useState<'csv' | 'json' | null>(null)
  const [previewData, setPreviewData] = useState<any[]>([])

  const loadStats = async () => {
    try {
      const newStats = await getImportStats()
      setStats(newStats)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setFileContent(content)

      // Determine file type
      const type = file.name.endsWith('.json') ? 'json' : 'csv'
      setFileType(type)

      // Parse and preview data
      try {
        const cars = type === 'json' ? parseJSONCars(content) : parseCSVCars(content)
        setPreviewData(cars.slice(0, 5)) // Show first 5 cars as preview
        setResult(null)
      } catch (error) {
        console.error('Parse error:', error)
        setResult({
          success: false,
          message: 'Failed to parse file',
          errors: [error instanceof Error ? error.message : 'Unknown error']
        })
      }
    }
    reader.readAsText(file)
  }

  const handleImport = async () => {
    if (!fileContent || !fileType) {
      setResult({
        success: false,
        message: 'Please upload a file first',
      })
      return
    }

    setImporting(true)
    setResult(null)

    try {
      const cars = fileType === 'json' ? parseJSONCars(fileContent) : parseCSVCars(fileContent)

      if (cars.length === 0) {
        setResult({
          success: false,
          message: 'No valid car data found in file',
        })
        return
      }

      const importResult = await importCars(cars)
      setResult(importResult)

      if (importResult.success) {
        await loadStats()
      }
    } catch (error) {
      console.error('Import error:', error)
      setResult({
        success: false,
        message: 'Import failed',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      })
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Importation de Voitures
            </h1>
            <p className="text-dark-200">
              Importez des données de voitures depuis vroom.be ou d&apos;autres sources
            </p>
          </div>

          {/* Stats Card */}
          {stats && (
            <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg shadow-dark-card border border-white/10 p-6 mb-6">
              <h2 className="text-lg font-bold text-white mb-4">
                Base de données actuelle
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                    <Car className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {stats.totalVehicles}
                    </p>
                    <p className="text-sm text-dark-300">Véhicules</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                    <Database className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {stats.totalBrands}
                    </p>
                    <p className="text-sm text-dark-300">Marques</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Car className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {stats.totalModels}
                    </p>
                    <p className="text-sm text-dark-300">Modèles</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Upload Card */}
          <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg shadow-dark-card border border-white/10 p-6 mb-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                <Upload className="h-6 w-6 text-secondary" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-white mb-2">
                  Télécharger un fichier
                </h2>
                <p className="text-sm text-dark-300 mb-4">
                  Formats supportés: CSV, JSON. Le fichier doit contenir au minimum: marque, modèle, année.
                </p>

                <div className="mb-4">
                  <label className="block">
                    <div className="border-2 border-dashed border-white/10 rounded-lg p-8 text-center hover:border-secondary transition-colors duration-300 cursor-pointer">
                      <input
                        type="file"
                        accept=".csv,.json"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Upload className="h-12 w-12 text-dark-300 mx-auto mb-3" />
                      <p className="text-dark-100 font-medium mb-1">
                        Cliquez pour sélectionner un fichier
                      </p>
                      <p className="text-sm text-dark-300">
                        CSV ou JSON (max 10MB)
                      </p>
                    </div>
                  </label>
                </div>

                {previewData.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-white mb-2">
                      Aperçu ({previewData.length} premières voitures)
                    </h3>
                    <div className="bg-dark-600/50 rounded-lg p-4 max-h-64 overflow-y-auto">
                      {previewData.map((car, index) => (
                        <div key={index} className="text-sm mb-3 pb-3 border-b border-white/5 last:border-0 last:mb-0 last:pb-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-white">{car.brand} {car.model}</span>
                            {car.year && <span className="text-dark-300">({car.year})</span>}
                          </div>
                          <div className="flex flex-wrap gap-2 mt-1 text-xs">
                            {car.price_min && <span className="text-secondary font-semibold">{car.price_min.toLocaleString()} €</span>}
                            {car.fuel_type && <span className="bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded">{car.fuel_type}</span>}
                            {car.transmission && <span className="bg-purple-900/50 text-purple-300 px-2 py-0.5 rounded">{car.transmission}</span>}
                            {car.horsepower && <span className="bg-orange-900/50 text-orange-300 px-2 py-0.5 rounded">{car.horsepower} ch</span>}
                            {car.doors && <span className="bg-dark-600/50 text-dark-200 px-2 py-0.5 rounded">{car.doors} portes</span>}
                            {car.exterior_color && <span className="bg-green-900/50 text-green-300 px-2 py-0.5 rounded">{car.exterior_color}</span>}
                          </div>
                          {car.images && car.images.length > 0 && (
                            <p className="text-xs text-dark-300 mt-1">{car.images.length} images</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleImport}
                  disabled={importing || !fileContent}
                  className="w-full bg-secondary hover:bg-secondary-600 text-dark-800 font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {importing ? (
                    <>
                      <Upload className="h-4 w-4 mr-2 animate-pulse" />
                      Importation en cours...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Importer les voitures
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Result Message */}
            {result && (
              <div
                className={`p-4 rounded-lg flex items-start gap-3 ${
                  result.success
                    ? 'bg-green-900/30 border border-green-500/30'
                    : 'bg-[#78350f]/30 border border-[#FFC358]/30'
                }`}
              >
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-[#FFC358] flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p
                    className={`font-semibold mb-1 ${
                      result.success ? 'text-green-300' : 'text-[#fcd34d]'
                    }`}
                  >
                    {result.success ? 'Importation réussie' : 'Erreur'}
                  </p>
                  <p
                    className={`text-sm ${
                      result.success ? 'text-green-400' : 'text-[#FFC358]'
                    }`}
                  >
                    {result.message}
                  </p>
                  {result.success && (result.imported || result.skipped || result.failed) && (
                    <div className="mt-3 flex gap-4 text-sm">
                      {result.imported !== undefined && result.imported > 0 && (
                        <span className="text-green-400">
                          ✓ {result.imported} importée{result.imported > 1 ? 's' : ''}
                        </span>
                      )}
                      {result.skipped !== undefined && result.skipped > 0 && (
                        <span className="text-yellow-400">
                          ⊘ {result.skipped} ignorée{result.skipped > 1 ? 's' : ''}
                        </span>
                      )}
                      {result.failed !== undefined && result.failed > 0 && (
                        <span className="text-[#FFC358]">
                          ✕ {result.failed} échouée{result.failed > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  )}
                  {result.errors && result.errors.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-semibold text-[#fcd34d] mb-1">Erreurs:</p>
                      <ul className="text-xs text-[#FFC358] space-y-1">
                        {result.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Instructions Card */}
          <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg shadow-dark-card border border-white/10 p-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
              <h2 className="text-lg font-bold text-white">
                Comment importer depuis vroom.be
              </h2>
            </div>

            <div className="space-y-4 text-sm text-dark-200">
              <div>
                <p className="font-semibold text-white mb-2">
                  Format vroom.be (Scraping) - Recommandé
                </p>
                <p className="mb-2 text-xs">
                  Le système détecte automatiquement les données scrapées depuis vroom.be et les convertit.
                </p>
                <pre className="mt-2 p-3 bg-dark-600/50 rounded-lg text-xs overflow-x-auto text-dark-100">
{`[
  {
    "url": "https://www.vroom.be/fr/voitures-neuves/...",
    "title": "Land Rover Defender",
    "specs": {
      "Prix": "111 990 €",
      "Type": "Neuve",
      "Kilométrage": "0 km",
      "Garantie": "24",
      "Moteur": "Diesel",
      "Carrosserie": "SUV",
      "Portes": "3",
      "TVA déductible": "Oui",
      "Cylindrée": "2 999 cc",
      "Puissance": "184 kW",
      "Puissance (hp)": "250 ch",
      "Boîte": "Automatique",
      "Couleur extérieure": "Gris foncé",
      "Couleur intérieure": "Blanc",
      "Émission CO₂": "223 g/km",
      "Norme Euro": "Euro 6"
    },
    "images": ["https://cdn.vroomsupport.be/..."]
  }
]`}
                </pre>
              </div>

              <div>
                <p className="font-semibold text-white mb-2">
                  Format CSV alternatif
                </p>
                <pre className="mt-2 p-3 bg-dark-600/50 rounded-lg text-xs overflow-x-auto text-dark-100">
{`brand,model,year,price,fuel_type,transmission,horsepower,doors,exterior_color
Dacia,Sandero,2024,89900,Essence,Manual,90,5,Blanc
Toyota,Corolla,2024,189000,Hybrid,Automatic,140,5,Gris`}
                </pre>
              </div>

              <div>
                <p className="font-semibold text-white mb-2">
                  Format JSON standard
                </p>
                <pre className="mt-2 p-3 bg-dark-600/50 rounded-lg text-xs overflow-x-auto text-dark-100">
{`[
  {
    "brand": "Dacia",
    "model": "Sandero",
    "year": 2024,
    "price_min": 89900,
    "fuel_type": "Essence",
    "transmission": "Manual",
    "horsepower": 90,
    "doors": 5,
    "exterior_color": "Blanc",
    "warranty_months": 24
  }
]`}
                </pre>
              </div>

              <div>
                <p className="font-semibold text-white mb-2">
                  Champs disponibles
                </p>
                <p className="text-xs text-dark-300">
                  <strong className="text-dark-100">Requis:</strong> brand, model, year<br />
                  <strong className="text-dark-100">Optionnels:</strong> version, price_min, price_max, fuel_type, transmission,
                  engine_size, horsepower, power_kw, torque, acceleration, top_speed, fuel_consumption_city,
                  fuel_consumption_highway, fuel_consumption_combined, co2_emissions, euro_norm, cargo_capacity,
                  seating_capacity, doors, exterior_color, interior_color, warranty_months, vat_deductible,
                  mileage, source_url, features, safety_features, images, is_available, is_popular,
                  is_new_release, is_coming_soon, launch_date
                </p>
              </div>
            </div>
          </div>

          {/* Quick Link */}
          <div className="mt-6 text-center">
            <Link
              href="/neuf"
              className="inline-flex items-center gap-2 text-secondary hover:text-secondary hover:underline font-medium transition-colors duration-300"
            >
              Voir toutes les voitures neuves →
            </Link>
          </div>
    </div>
  )
}
