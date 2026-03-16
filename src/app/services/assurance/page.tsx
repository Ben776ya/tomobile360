'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Check, ArrowLeft, Car, Umbrella, Headphones, X, ChevronLeft, ChevronRight } from 'lucide-react'

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 25 }, (_, i) => String(CURRENT_YEAR - i))

const VEHICLE_TYPES = ['Citadine', 'Berline', 'SUV / 4x4', 'Monospace', 'Coupé', 'Cabriolet', 'Utilitaire']
const FUEL_TYPES = ['Essence', 'Diesel', 'Hybride', 'Électrique', 'GPL']
const USAGE_TYPES = ['Personnel', 'Professionnel', 'Taxi', 'Auto-école']

const insuranceTypes = [
  {
    name: 'Tous Risques',
    description: 'La couverture la plus complète pour votre véhicule',
    features: [
      'Dommages tous accidents',
      'Vol et incendie',
      'Bris de glace',
      'Catastrophes naturelles',
      'Protection juridique',
    ],
    recommended: true,
  },
  {
    name: 'Tiers Collision',
    description: 'Une protection intermédiaire à prix avantageux',
    features: [
      'Responsabilité civile',
      'Dommages collision identifiée',
      'Vol et incendie',
      'Bris de glace',
    ],
    recommended: false,
  },
  {
    name: 'Tiers Simple',
    description: 'La couverture essentielle obligatoire',
    features: [
      'Responsabilité civile',
      'Défense et recours',
    ],
    recommended: false,
  },
]

const benefits = [
  { icon: Car, title: 'Véhicule de remplacement', description: "En cas de panne ou d'accident" },
  { icon: Umbrella, title: 'Protection conducteur', description: 'Indemnisation en cas de blessures' },
  { icon: Headphones, title: 'Assistance 24/7', description: 'Disponible partout au Maroc' },
]

type FormData = {
  vehicleType: string
  brand: string
  model: string
  year: string
  value: string
  fuel: string
  usage: string
  formula: string
  fullName: string
  phone: string
  email: string
  city: string
}

const EMPTY_FORM: FormData = {
  vehicleType: '',
  brand: '',
  model: '',
  year: '',
  value: '',
  fuel: '',
  usage: '',
  formula: '',
  fullName: '',
  phone: '',
  email: '',
  city: '',
}

export default function AssurancePage() {
  const [showForm, setShowForm] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM)

  const update = (field: keyof FormData, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }))

  const openForm = (formula: string) => {
    setFormData({ ...EMPTY_FORM, formula })
    setStep(1)
    setShowForm(true)
  }

  const closeForm = () => setShowForm(false)

  const canProceedStep1 =
    formData.vehicleType &&
    formData.brand &&
    formData.model &&
    formData.year &&
    formData.value &&
    formData.fuel &&
    formData.usage

  const canProceedStep2 = !!formData.formula

  const canSubmit = formData.fullName && formData.phone && formData.city

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    window.location.href = 'https://www.atlantasanad.ma/automobile'
  }

  const inputClass =
    'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors'
  const labelClass = 'block text-xs font-medium text-gray-600 mb-1'

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#E8F0FE] via-white to-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-secondary mb-6 transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux services
          </Link>
          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                <Image
                  src="/atlanta-sanad-logo.png"
                  alt="Atlanta Sanad"
                  width={52}
                  height={52}
                  className="w-13 h-13 object-contain"
                />
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary">
                AtlantaSanad Assurance
              </h1>
            </div>
            <p className="text-lg md:text-xl text-gray-500">
              Protégez votre véhicule avec Atlanta Sanad — leader de l&apos;assurance au Maroc.
              Obtenez votre devis personnalisé en quelques minutes.
            </p>
          </div>
        </div>
      </section>

      {/* Insurance Types */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-primary text-center mb-12">
            Choisissez votre formule
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {insuranceTypes.map((type, idx) => (
              <div
                key={idx}
                className={`relative bg-white rounded-2xl border-2 p-6 shadow-card transition-all hover:shadow-elevated flex flex-col ${
                  type.recommended ? 'border-[#32B75C]' : 'border-[#006EFE]'
                }`}
              >
                {type.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#32B75C] text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    Recommandé
                  </div>
                )}
                <h3 className="text-xl font-bold text-primary mb-2">{type.name}</h3>
                <p className="text-sm text-gray-400 mb-6">{type.description}</p>
                <ul className="space-y-3 mb-6 flex-1">
                  {type.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => openForm(type.name)}
                  className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 mt-auto text-white ${
                    type.recommended
                      ? 'bg-[#32B75C] hover:bg-[#e6a832]'
                      : 'bg-[#006EFE] hover:bg-[#0058d0]'
                  }`}
                >
                  Demander un devis
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-primary text-center mb-12">
            Services inclus
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 text-center shadow-card border border-gray-100">
                <div className="w-16 h-16 bg-[#EEF3FF] rounded-full flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="h-8 w-8 text-[#003087]" />
                </div>
                <h3 className="font-bold text-primary mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-400">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Devis Form Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeForm() }}
        >
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl">

            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <div className="flex items-center gap-3">
                <Image
                  src="/atlanta-sanad-logo.png"
                  alt="Atlanta Sanad"
                  width={32}
                  height={32}
                  className="w-8 h-8 object-contain"
                />
                <div>
                  <p className="font-bold text-primary text-sm">Demande de devis</p>
                  <p className="text-xs text-gray-400">Atlanta Sanad — Assurance Auto</p>
                </div>
              </div>
              <button
                onClick={closeForm}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>

            {/* Step Indicator */}
            <div className="px-6 pt-5 pb-1">
              <div className="flex items-center">
                {([1, 2, 3] as const).map((s, i) => (
                  <div key={s} className="flex items-center flex-1">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          s < step
                            ? 'bg-green-500 text-white'
                            : s === step
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {s < step ? <Check className="w-3.5 h-3.5" /> : s}
                      </div>
                      <span
                        className={`text-xs font-medium hidden sm:block ${
                          s === step ? 'text-primary' : 'text-gray-400'
                        }`}
                      >
                        {s === 1 ? 'Votre véhicule' : s === 2 ? 'Couverture' : 'Coordonnées'}
                      </span>
                    </div>
                    {i < 2 && (
                      <div
                        className={`flex-1 h-[2px] rounded-full mx-2 ${
                          s < step ? 'bg-green-500' : 'bg-gray-100'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 pb-6 pt-4">

              {/* STEP 1 — Véhicule */}
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-primary">Informations du véhicule</h3>

                  <div>
                    <label className={labelClass}>Type de véhicule *</label>
                    <select
                      value={formData.vehicleType}
                      onChange={(e) => update('vehicleType', e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Sélectionnez un type...</option>
                      {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Marque *</label>
                      <input
                        type="text"
                        value={formData.brand}
                        onChange={(e) => update('brand', e.target.value)}
                        placeholder="Ex: Dacia"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Modèle *</label>
                      <input
                        type="text"
                        value={formData.model}
                        onChange={(e) => update('model', e.target.value)}
                        placeholder="Ex: Sandero"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Année *</label>
                      <select
                        value={formData.year}
                        onChange={(e) => update('year', e.target.value)}
                        className={inputClass}
                      >
                        <option value="">Année...</option>
                        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Valeur du véhicule (DH) *</label>
                      <input
                        type="number"
                        value={formData.value}
                        onChange={(e) => update('value', e.target.value)}
                        placeholder="Ex: 150 000"
                        min="0"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Énergie *</label>
                      <select
                        value={formData.fuel}
                        onChange={(e) => update('fuel', e.target.value)}
                        className={inputClass}
                      >
                        <option value="">Énergie...</option>
                        {FUEL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Usage *</label>
                      <select
                        value={formData.usage}
                        onChange={(e) => update('usage', e.target.value)}
                        className={inputClass}
                      >
                        <option value="">Usage...</option>
                        {USAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!canProceedStep1}
                    className="w-full py-3 bg-primary hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    Continuer
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* STEP 2 — Couverture */}
              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-primary">Formule souhaitée</h3>

                  <div className="space-y-3">
                    {insuranceTypes.map((type) => (
                      <label
                        key={type.name}
                        className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          formData.formula === type.name
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="formula"
                          value={type.name}
                          checked={formData.formula === type.name}
                          onChange={(e) => update('formula', e.target.value)}
                          className="mt-0.5 accent-primary"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-primary text-sm">{type.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{type.description}</p>
                        </div>
                        {type.recommended && (
                          <span className="text-[10px] font-bold bg-secondary text-white px-2 py-0.5 rounded-full self-start whitespace-nowrap">
                            Recommandé
                          </span>
                        )}
                      </label>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Retour
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      disabled={!canProceedStep2}
                      className="flex-1 py-3 bg-primary hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      Continuer
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3 — Coordonnées */}
              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-primary">Vos coordonnées</h3>

                  <div>
                    <label className={labelClass}>Nom complet *</label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => update('fullName', e.target.value)}
                      placeholder="Prénom et nom"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Téléphone *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => update('phone', e.target.value)}
                      placeholder="06 XX XX XX XX"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Email{' '}
                      <span className="text-gray-400 font-normal">(facultatif)</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => update('email', e.target.value)}
                      placeholder="votre@email.com"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Ville *</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => update('city', e.target.value)}
                      placeholder="Ex: Casablanca"
                      className={inputClass}
                    />
                  </div>

                  {/* Récapitulatif */}
                  <div className="bg-gray-50 rounded-xl p-4 text-xs space-y-1.5 text-gray-600 border border-gray-100">
                    <p className="font-semibold text-primary text-sm mb-2">Récapitulatif de votre demande</p>
                    <p>🚗 {formData.brand} {formData.model} {formData.year} — {formData.vehicleType}</p>
                    <p>⛽ {formData.fuel} · Usage : {formData.usage}</p>
                    <p>💰 Valeur : {Number(formData.value).toLocaleString('fr-MA')} DH</p>
                    <p>🛡️ Formule : <span className="font-semibold text-primary">{formData.formula}</span></p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Retour
                    </button>
                    <button
                      type="submit"
                      disabled={!canSubmit}
                      className="flex-1 py-3 bg-secondary hover:bg-secondary-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-gold"
                    >
                      Envoyer ma demande
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
