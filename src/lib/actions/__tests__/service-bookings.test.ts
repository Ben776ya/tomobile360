import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const insert = vi.fn()

vi.mock('next/headers', () => ({
  headers: async () => new Headers({ 'x-forwarded-for': '203.0.113.7' }),
}))
vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }))
vi.mock('@/lib/rate-limit', () => ({ rateLimit: () => true }))
vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({ from: () => ({ insert }) }),
}))

import { submitControleBooking } from '../service-bookings'

describe('submitControleBooking (contrôle technique opening alert)', () => {
  beforeEach(() => {
    insert.mockReset()
    insert.mockResolvedValue({ error: null })
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-10-21T10:00:00Z'))
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('accepts an alert with only city and phone, tagged so it is not read as an appointment', async () => {
    const result = await submitControleBooking({ city: 'Rabat', phone: '0612345678' })
    expect(result).toEqual({ success: true })
    expect(insert).toHaveBeenCalledWith({
      service_type: 'controle_technique',
      city: 'Rabat',
      plate_number: '',
      preferred_date: '2026-10-21',
      phone: '0612345678',
      notes: "Alerte d'ouverture (pas de rendez-vous demandé)",
    })
  })

  it('still requires a city and a valid phone', async () => {
    expect(await submitControleBooking({ city: '', phone: '0612345678' })).toMatchObject({ error: 'Ville requise' })
    expect(await submitControleBooking({ city: 'Rabat', phone: '123' })).toMatchObject({ error: 'Numéro de téléphone invalide' })
    expect(insert).not.toHaveBeenCalled()
  })

  it('keeps validating plate and date when they are sent', async () => {
    expect(await submitControleBooking({ city: 'Rabat', phone: '0612345678', preferred_date: 'demain' })).toMatchObject({
      error: 'Date invalide',
    })
    const result = await submitControleBooking({
      city: 'Rabat',
      phone: '0612345678',
      plate_number: '12345-A-67',
      preferred_date: '2026-11-02',
    })
    expect(result).toEqual({ success: true })
    expect(insert).toHaveBeenCalledWith({
      service_type: 'controle_technique',
      city: 'Rabat',
      plate_number: '12345-A-67',
      preferred_date: '2026-11-02',
      phone: '0612345678',
    })
  })
})
