import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

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
vi.mock('@/lib/actions/admin/vehicles', () => ({
  createVehicle: vi.fn().mockResolvedValue({ success: true, vehicleId: 'test-id' }),
  updateVehicle: vi.fn().mockResolvedValue({ success: true }),
}))
vi.mock('@/lib/actions/admin/promotions', () => ({
  createPromotion: vi.fn().mockResolvedValue({ success: true }),
}))

import { VehicleForm } from '@/components/admin/VehicleForm'

describe('VehicleForm', () => {
  it('renders brand + model selectors in create mode', () => {
    render(
      <VehicleForm
        brands={[
          { id: '1', name: 'Renault', logo_url: null, description: null, created_at: null },
        ]}
        models={[
          { id: '1', name: 'Clio', brand_id: '1', category: null, created_at: null },
        ]}
        mode="create"
      />
    )
    expect(screen.getByLabelText(/marque/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/mod[èe]le/i)).toBeInTheDocument()
  })

  it('renders submit button labelled for create mode', () => {
    render(
      <VehicleForm
        brands={[]}
        models={[]}
        mode="create"
      />
    )
    expect(screen.getByRole('button', { name: /créer le véhicule/i })).toBeInTheDocument()
  })
})
