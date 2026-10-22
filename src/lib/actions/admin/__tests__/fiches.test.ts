import { describe, it, expect, vi, beforeEach } from 'vitest'

const insert = vi.fn()
const insertResult = vi.fn()
const update = vi.fn()
const updateEq = vi.fn()
const variantRows = vi.fn()

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/auth/check-admin', () => ({ checkAdmin: async () => ({}) }))
vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    from: (table: string) =>
      table === 'vehicles_new'
        ? { select: () => ({ eq: () => Promise.resolve({ data: variantRows() }) }) }
        : {
            insert: (row: unknown) => {
              insert(row)
              return { select: () => ({ single: () => Promise.resolve(insertResult()) }) }
            },
            update: (row: unknown) => {
              update(row)
              return { eq: (col: string, val: string) => (updateEq(col, val), Promise.resolve({ error: null })) }
            },
          },
  }),
}))

import { createFicheTechnique, updateFicheTechnique } from '../fiches'

const MODEL = '9592d0da-3e98-4a9b-8e45-1e4accc4e639' // Sandero Streetway
const sanderoVersions = [
  { variant_list: [
    { version: '1.0 TCe 90 Expression' }, { version: '1.5 dCi 95 Expression' },
    { version: '1.5 dCi 95 Journey' }, { version: '1.5 dCi 95 Extreme' },
  ] },
]

describe('admin fiches — one fiche per version', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    variantRows.mockReturnValue(sanderoVersions)
    insertResult.mockReturnValue({ data: { id: 'new-fiche' }, error: null })
  })

  it('creates a per-version fiche with the exact variant_list version', async () => {
    const result = await createFicheTechnique({ model_id: MODEL, version: '1.5 dCi 95 Journey', specs: {}, en_detail: {} })
    expect(result).toEqual({ success: true, ficheId: 'new-fiche' })
    expect(insert).toHaveBeenCalledWith({ model_id: MODEL, version: '1.5 dCi 95 Journey', specs: {}, en_detail: {} })
  })

  it('creates a model-level fiche without naming the version column (works before it exists)', async () => {
    await createFicheTechnique({ model_id: MODEL, version: null, specs: {}, en_detail: {} })
    expect(insert).toHaveBeenCalledWith({ model_id: MODEL, specs: {}, en_detail: {} })
    expect(variantRows).not.toHaveBeenCalled()
  })

  it('refuses a version the model does not list', async () => {
    const result = await createFicheTechnique({ model_id: MODEL, version: '1.5 dCi 95 journey', specs: {}, en_detail: {} })
    expect(result).toEqual({ error: "Cette version n'existe pas pour ce modèle" })
    expect(insert).not.toHaveBeenCalled()
  })

  it('never overwrites: a second fiche for the same (model, version) is refused by the unique constraint', async () => {
    insertResult.mockReturnValue({ data: null, error: { code: '23505', message: 'duplicate key value violates unique constraint "fiches_techniques_model_version_unique"' } })
    const result = await createFicheTechnique({ model_id: MODEL, version: '1.0 TCe 90 Expression', specs: {}, en_detail: {} })
    expect(result).toEqual({ error: 'Une fiche existe déjà pour ce modèle et cette version' })
  })

  it('edits by fiche id, leaving its model and version untouched', async () => {
    await updateFicheTechnique('fiche-id', { specs: { 'Conso. mixte': '4.4 L/100km' }, en_detail: {} })
    expect(update).toHaveBeenCalledWith({ specs: { 'Conso. mixte': '4.4 L/100km' }, en_detail: {} })
    expect(updateEq).toHaveBeenCalledWith('id', 'fiche-id')
  })
})
