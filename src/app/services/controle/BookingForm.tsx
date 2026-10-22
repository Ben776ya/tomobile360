'use client'

import { useState } from 'react'
import { submitControleBooking } from '@/lib/actions/service-bookings'
import { FormPrivacyNotice } from '@/components/shared/FormPrivacyNotice'

const cities = [
  { city: 'Casablanca' },
  { city: 'Rabat' },
  { city: 'Marrakech' },
  { city: 'Tanger' },
  { city: 'Fès' },
  { city: 'Agadir' },
]

export function BookingForm() {
  const [form, setForm] = useState({ city: '', phone: '' })
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const result = await submitControleBooking(form)
    setSubmitting(false)
    if ('error' in result && result.error) {
      setError(result.error)
      return
    }
    setSubmitted(true)
    setForm({ city: '', phone: '' })
  }

  if (submitted) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-card text-center">
        <h2 className="text-xl font-bold text-primary mb-2">Inscription enregistrée</h2>
        <p className="text-gray-600 mb-6">
          Nous vous contacterons au numéro indiqué dès l&apos;ouverture du service.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="text-secondary font-semibold hover:underline"
        >
          Inscrire un autre numéro
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-card">
      <h2 className="text-xl font-bold text-primary mb-2">Être averti de l&apos;ouverture</h2>
      <p className="text-sm text-gray-500 mb-6">
        Le service n&apos;est pas encore ouvert : aucun rendez-vous n&apos;est pris. Laissez votre
        ville et votre numéro, nous vous prévenons dès son lancement.
      </p>
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div>
          <label htmlFor="controle-city" className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
          <select
            id="controle-city"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            required
            className="w-full px-4 py-3 bg-white text-primary border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-transparent"
          >
            <option value="">Sélectionnez une ville</option>
            {cities.map((c) => (
              <option key={c.city} value={c.city}>
                {c.city}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="controle-phone" className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
          <input
            id="controle-phone"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
            placeholder="+212 6XX-XXXXXX"
            className="w-full px-4 py-3 bg-white text-primary border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-transparent placeholder-gray-400"
          />
        </div>

        <FormPrivacyNotice>
          Votre ville et votre numéro sont enregistrés par Tomobile 360 uniquement pour vous prévenir
          de l&apos;ouverture du service de contrôle technique.
        </FormPrivacyNotice>

        {error && (
          <div className="text-sm px-3 py-2 rounded-lg bg-red-500/10 text-red-600 border border-red-500/30">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-secondary hover:bg-secondary-400 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Envoi…
            </>
          ) : (
            "Être averti de l'ouverture"
          )}
        </button>
      </form>
    </div>
  )
}
