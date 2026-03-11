'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Check } from 'lucide-react'

interface FormData {
  // Step 1: Vehicle Info
  brand_id: string
  model_id: string
  year: string
  mileage: string

  // Step 2: Technical Details
  fuel_type: string
  transmission: string
  color: string
  condition: string

  // Step 3: Description & Price
  description: string
  price: string
  city: string

  // Step 4: Photos
  images: string[]

  // Step 5: Contact
  contact_phone: string
  contact_email: string
  seller_type: string
}

const steps = [
  { number: 1, title: 'Informations du véhicule', description: 'Marque, modèle, année' },
  { number: 2, title: 'Détails techniques', description: 'Carburant, transmission, état' },
  { number: 3, title: 'Description & Prix', description: 'Décrivez votre véhicule' },
  { number: 4, title: 'Photos', description: 'Ajoutez des images' },
  { number: 5, title: 'Contact', description: 'Vos coordonnées' },
]

export function PostListingForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [brands, setBrands] = useState<any[]>([])
  const [models, setModels] = useState<any[]>([])

  const [formData, setFormData] = useState<FormData>({
    brand_id: '',
    model_id: '',
    year: '',
    mileage: '',
    fuel_type: '',
    transmission: '',
    color: '',
    condition: '',
    description: '',
    price: '',
    city: '',
    images: [],
    contact_phone: '',
    contact_email: '',
    seller_type: 'individual',
  })

  useEffect(() => {
    fetchBrands()
  }, [])

  useEffect(() => {
    if (formData.brand_id) {
      fetchModels(formData.brand_id)
    }
  }, [formData.brand_id])

  const fetchBrands = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('brands').select('id, name').order('name')
    if (data) setBrands(data)
  }

  const fetchModels = async (brandId: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('models')
      .select('id, name')
      .eq('brand_id', brandId)
      .order('name')
    if (data) setModels(data)
  }

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.brand_id && formData.model_id && formData.year && formData.mileage)
      case 2:
        return !!(formData.fuel_type && formData.transmission && formData.condition)
      case 3:
        return !!(formData.description && formData.price && formData.city)
      case 4:
        return formData.images.length > 0
      case 5:
        return !!(formData.contact_phone && formData.contact_email)
      default:
        return false
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5))
    } else {
      alert('Veuillez remplir tous les champs requis')
    }
  }

  const previousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(5)) {
      alert('Veuillez remplir tous les champs requis')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        alert('Vous devez être connecté pour publier une annonce')
        router.push('/login')
        return
      }

      // Insert listing using server action
      const { createUsedListing } = await import('@/lib/actions/vehicles')

      const result = await createUsedListing({
        brand_id: formData.brand_id,
        model_id: formData.model_id,
        year: parseInt(formData.year),
        mileage: parseInt(formData.mileage),
        fuel_type: formData.fuel_type,
        transmission: formData.transmission,
        color: formData.color,
        condition: formData.condition,
        description: formData.description,
        price: parseFloat(formData.price),
        city: formData.city,
        images: formData.images,
        contact_phone: formData.contact_phone,
        contact_email: formData.contact_email,
        seller_type: formData.seller_type,
      })

      if (result.error) {
        throw new Error(result.error)
      }

      alert('Votre annonce a été publiée avec succès!')

      // Redirect to the listing page (using replace to prevent back navigation to form)
      router.replace(`/occasion/${result.listingId}`)
    } catch {
      alert('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i)

  const morrocanCities = [
    'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 'Meknès',
    'Oujda', 'Kenitra', 'Tétouan', 'Safi', 'Temara', 'Mohammédia', 'Khouribga',
    'El Jadida', 'Béni Mellal', 'Nador', 'Settat'
  ]

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                    currentStep > step.number
                      ? 'bg-green-500 text-white shadow-md'
                      : currentStep === step.number
                      ? 'bg-secondary text-white shadow-lg ring-2 ring-secondary/50 scale-110'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {currentStep > step.number ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    step.number
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p
                    className={`text-sm font-medium transition-colors duration-300 ${
                      currentStep === step.number ? 'text-secondary' : 'text-muted-foreground'
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    {step.description}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 ${
                    currentStep > step.number ? 'bg-green-500' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
        {/* Step 1: Vehicle Info */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-primary mb-4">
              Informations du véhicule
            </h2>

            <div>
              <Label htmlFor="brand">Marque *</Label>
              <select
                id="brand"
                value={formData.brand_id}
                onChange={(e) => handleChange('brand_id', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary hover:border-secondary/50 transition-all duration-300 cursor-pointer"
                required
              >
                <option value="">Sélectionnez une marque</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="model">Modèle *</Label>
              <select
                id="model"
                value={formData.model_id}
                onChange={(e) => handleChange('model_id', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary hover:border-secondary/50 transition-all duration-300 cursor-pointer"
                disabled={!formData.brand_id}
                required
              >
                <option value="">Sélectionnez un modèle</option>
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="year">Année *</Label>
                <select
                  id="year"
                  value={formData.year}
                  onChange={(e) => handleChange('year', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary hover:border-secondary/50 transition-all duration-300 cursor-pointer"
                  required
                >
                  <option value="">Sélectionnez</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="mileage">Kilométrage *</Label>
                <Input
                  id="mileage"
                  type="number"
                  placeholder="Ex: 50000"
                  value={formData.mileage}
                  onChange={(e) => handleChange('mileage', e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Technical Details */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-primary mb-4">Détails techniques</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fuel">Carburant *</Label>
                <select
                  id="fuel"
                  value={formData.fuel_type}
                  onChange={(e) => handleChange('fuel_type', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary hover:border-secondary/50 transition-all duration-300 cursor-pointer"
                  required
                >
                  <option value="">Sélectionnez</option>
                  <option value="Essence">Essence</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Hybrid">Hybride</option>
                  <option value="Electric">Électrique</option>
                </select>
              </div>

              <div>
                <Label htmlFor="transmission">Transmission *</Label>
                <select
                  id="transmission"
                  value={formData.transmission}
                  onChange={(e) => handleChange('transmission', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary hover:border-secondary/50 transition-all duration-300 cursor-pointer"
                  required
                >
                  <option value="">Sélectionnez</option>
                  <option value="Manual">Manuelle</option>
                  <option value="Automatic">Automatique</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="color">Couleur</Label>
              <Input
                id="color"
                type="text"
                placeholder="Ex: Blanc, Noir, Rouge..."
                value={formData.color}
                onChange={(e) => handleChange('color', e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="condition">État du véhicule *</Label>
              <select
                id="condition"
                value={formData.condition}
                onChange={(e) => handleChange('condition', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary hover:border-secondary/50 transition-all duration-300 cursor-pointer"
                required
              >
                <option value="">Sélectionnez</option>
                <option value="Excellent">Excellent</option>
                <option value="Très Bon">Très Bon</option>
                <option value="Bon">Bon</option>
                <option value="Acceptable">Acceptable</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 3: Description & Price */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-primary mb-4">
              Description et Prix
            </h2>

            <div>
              <Label htmlFor="description">Description *</Label>
              <textarea
                id="description"
                rows={6}
                placeholder="Décrivez votre véhicule en détail..."
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary hover:border-secondary/50 transition-all duration-300 cursor-pointer"
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                Décrivez l&apos;état, l&apos;historique d&apos;entretien, les équipements, etc.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Prix (DH) *</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="Ex: 150000"
                  value={formData.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="city">Ville *</Label>
                <select
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary hover:border-secondary/50 transition-all duration-300 cursor-pointer"
                  required
                >
                  <option value="">Sélectionnez</option>
                  {morrocanCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Photos */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-primary mb-4">Photos</h2>

            <div>
              <Label htmlFor="images">URLs des images *</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Ajoutez les URLs des images de votre véhicule (une par ligne)
              </p>
              <textarea
                id="images"
                rows={6}
                placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                value={formData.images.join('\n')}
                onChange={(e) =>
                  handleChange(
                    'images',
                    e.target.value.split('\n').filter((url) => url.trim())
                  )
                }
                className="w-full mt-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent font-mono text-sm"
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                {formData.images.length} image{formData.images.length > 1 ? 's' : ''} ajoutée
                {formData.images.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}

        {/* Step 5: Contact */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-primary mb-4">
              Coordonnées de contact
            </h2>

            <div>
              <Label htmlFor="phone">Téléphone *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+212 600 000 000"
                value={formData.contact_phone}
                onChange={(e) => handleChange('contact_phone', e.target.value)}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={formData.contact_email}
                onChange={(e) => handleChange('contact_email', e.target.value)}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="sellerType">Type de vendeur *</Label>
              <select
                id="sellerType"
                value={formData.seller_type}
                onChange={(e) => handleChange('seller_type', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary hover:border-secondary/50 transition-all duration-300 cursor-pointer"
                required
              >
                <option value="individual">Particulier</option>
                <option value="professional">Professionnel</option>
              </select>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-border">
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={previousStep}
              className="hover:bg-muted hover:border-secondary/50 transition-all duration-300"
            >
              Précédent
            </Button>
          )}

          {currentStep < 5 ? (
            <Button
              onClick={nextStep}
              className="ml-auto bg-primary hover:bg-primary-600 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              Suivant
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="ml-auto bg-secondary hover:bg-secondary-600 text-white font-bold text-lg px-8 py-6 hover:shadow-xl hover:-translate-y-1 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:translate-y-0"
            >
              {loading ? 'Publication en cours...' : '🚀 Publier l\'annonce'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
