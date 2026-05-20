'use client'

import { useState } from 'react'
import { submitControleBooking } from '@/lib/actions/service-bookings'

const cities = [
  { city: 'Casablanca' },
  { city: 'Rabat' },
  { city: 'Marrakech' },
  { city: 'Tanger' },
  { city: 'Fès' },
  { city: 'Agadir' },
]

export function BookingForm() {
  const [form, setForm] = useState({ city: '', plate_number: '', preferred_date: '', phone: '' })
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
    setForm({ city: '', plate_number: '', preferred_date: '', phone: '' })
  }

  if (submitted) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-card text-center">
        <h2 className="text-xl font-bold text-primary mb-2">Demande envoyée</h2>
        <p className="text-gray-600 mb-6">
          Nous vous recontactons sous 24h pour confirmer votre créneau.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="text-secondary font-semibold hover:underline"
        >
          Réserver un autre créneau
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-card">
      <h2 className="text-xl font-bold text-primary mb-6">Réserver un créneau</h2>
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
          <select
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Immatriculation</label>
          <input
            type="text"
            value={form.plate_number}
            onChange={(e) => setForm({ ...form, plate_number: e.target.value })}
            required
            placeholder="Ex: 12345-A-67"
            className="w-full px-4 py-3 bg-white text-primary border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-transparent placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date souhaitée</label>
          <input
            type="date"
            value={form.preferred_date}
            onChange={(e) => setForm({ ...form, preferred_date: e.target.value })}
            required
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 bg-white text-primary border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
            placeholder="+212 6XX-XXXXXX"
            className="w-full px-4 py-3 bg-white text-primary border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-transparent placeholder-gray-400"
          />
        </div>

        <div className="bg-gray-100 rounded-xl p-4 border border-gray-100">
          <p className="text-xs text-muted-foreground">Tarification et conditions communiquées par le partenaire à confirmation de la prise de rendez-vous.</p>
        </div>

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
            'Réserver maintenant'
          )}
        </button>
      </form>
    </div>
  )
}
