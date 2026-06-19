import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { VehicleNew } from '@/lib/types'

// Mock next/navigation since router isn't available in unit test
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))

// Mock Supabase client (used by ImageManagerSection for uploads)
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    storage: {
      from: () => ({
        upload: vi.fn().mockResolvedValue({ data: null, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
  }),
}))

// The form imports the 'use server' modules for createVehicle / updateVehicle /
// createPromotion. Those modules import 'server-only' via check-admin which
// throws in a client/test context. Stub them with no-op async functions.
const createVehicleMock = vi.fn().mockResolvedValue({ success: true, vehicleId: 'test-id' })
const updateVehicleMock = vi.fn().mockResolvedValue({ success: true })
vi.mock('@/lib/actions/admin/vehicles', () => ({
  createVehicle: (...args: unknown[]) => createVehicleMock(...args),
  updateVehicle: (...args: unknown[]) => updateVehicleMock(...args),
}))
vi.mock('@/lib/actions/admin/promotions', () => ({
  createPromotion: vi.fn().mockResolvedValue({ success: true }),
}))

import { VehicleForm } from '@/components/admin/VehicleForm'

const baseBrands = [
  { id: '1', name: 'Renault', logo_url: null, description: null, origin: null, created_at: null },
]
const baseModels = [
  { id: '1', name: 'Clio', brand_id: '1', category: null, created_at: null },
]

function makeVehicle(overrides: Partial<VehicleNew> = {}): VehicleNew {
  return {
    id: 'veh-1',
    brand_id: '1',
    model_id: '1',
    version: 'GT Line',
    year: 2024,
    price_min: 200000,
    price_max: 250000,
    fuel_type: null,
    transmission: null,
    engine_size: null,
    cylinders: null,
    horsepower: null,
    torque: null,
    acceleration: null,
    top_speed: null,
    fuel_consumption_city: null,
    fuel_consumption_highway: null,
    fuel_consumption_combined: null,
    co2_emissions: null,
    dimensions: null,
    cargo_capacity: null,
    seating_capacity: null,
    features: null,
    safety_features: null,
    images: null,
    is_available: true,
    is_popular: false,
    is_new_release: false,
    is_coming_soon: false,
    launch_date: null,
    views: 0,
    created_at: null,
    updated_at: null,
    doors: null,
    warranty_months: null,
    exterior_color: null,
    interior_color: null,
    euro_norm: null,
    vat_deductible: null,
    power_kw: null,
    source_url: null,
    mileage: null,
    is_coup_de_coeur: false,
    coup_de_coeur_category: null,
    coup_de_coeur_reason: null,
    is_featured_offer: false,
    variant_list: null,
    ...overrides,
  }
}

describe('VehicleForm', () => {
  it('renders brand + model selectors in create mode', () => {
    render(
      <VehicleForm brands={baseBrands} models={baseModels} mode="create" />
    )
    expect(screen.getByLabelText(/marque/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/mod[èe]le/i)).toBeInTheDocument()
  })

  it('renders submit button labelled for create mode', () => {
    render(<VehicleForm brands={[]} models={[]} mode="create" />)
    expect(screen.getByRole('button', { name: /créer le véhicule/i })).toBeInTheDocument()
  })

  it('renders defaulted version value in edit mode', () => {
    render(
      <VehicleForm
        brands={baseBrands}
        models={baseModels}
        mode="edit"
        vehicle={makeVehicle({ version: 'GT Line Pro' })}
      />
    )
    const versionInput = screen.getByLabelText(/^version$/i) as HTMLInputElement
    expect(versionInput.value).toBe('GT Line Pro')
  })

  it('calls createVehicle with brand/model/year payload on submit', async () => {
    createVehicleMock.mockClear()
    render(
      <VehicleForm brands={baseBrands} models={baseModels} mode="create" />
    )

    // Fill brand
    const brandSelect = screen.getByLabelText(/marque/i) as HTMLSelectElement
    fireEvent.change(brandSelect, { target: { value: '1' } })

    // Fill model (only available after brand picked)
    const modelSelect = screen.getByLabelText(/mod[èe]le/i) as HTMLSelectElement
    fireEvent.change(modelSelect, { target: { value: '1' } })

    // Year already defaults to current year via RHF, but make it explicit.
    const yearInput = screen.getByLabelText(/année/i) as HTMLInputElement
    fireEvent.change(yearInput, { target: { value: '2025' } })

    // Submit
    const submitBtn = screen.getByRole('button', { name: /créer le véhicule/i })
    fireEvent.click(submitBtn)

    // Wait for the mock to be called
    await vi.waitFor(() => {
      expect(createVehicleMock).toHaveBeenCalled()
    })

    const payload = createVehicleMock.mock.calls[0][0] as Record<string, unknown>
    expect(payload.brand_id).toBe('1')
    expect(payload.model_id).toBe('1')
    expect(payload.year).toBe(2025)
  })

  it('keeps focus and value when typing 3 chars into a freshly-added variant', async () => {
    const user = userEvent.setup()
    render(
      <VehicleForm brands={baseBrands} models={baseModels} mode="create" />
    )

    // Click "Add variant"
    const addBtn = screen.getByRole('button', { name: /ajouter une version/i })
    await user.click(addBtn)

    // Locate the freshly-added variant version input. The basic-info section
    // already has a "version" input with a similar placeholder; the variant
    // row is the only one with an exact "ex: GT Line" placeholder.
    const variantInput = screen.getByPlaceholderText('ex: GT Line') as HTMLInputElement

    variantInput.focus()
    await user.type(variantInput, 'abc')

    // After typing 3 chars, focus must be retained on the same input AND
    // value must be all 3 characters (regression test for the per-keystroke
    // re-mount bug).
    expect(document.activeElement).toBe(variantInput)
    expect(variantInput.value).toBe('abc')
  })
})
