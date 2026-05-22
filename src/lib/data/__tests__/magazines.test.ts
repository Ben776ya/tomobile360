import { describe, it, expect, vi, beforeEach } from 'vitest'

// `server-only` throws when imported in a non-server context (vitest runs in
// Node, not a Next.js server context). Stub it to an empty module.
vi.mock('server-only', () => ({}))

// The Supabase server client is created via `createClient()` from
// `@/lib/supabase/server`. We mock it so the data layer talks to a fully
// instrumented stub instead of a real Supabase instance.
//
// The mock builder mirrors the two query shapes used by the data layer:
//   getLatestMagazine: from→select→eq→eq→order→limit→maybeSingle
//   getAllMagazines:   from→select→eq→eq→order   (awaited directly)
//
// `order(...)` is therefore both chainable (to `.limit()`) AND a thenable
// (so `await ...order(...)` resolves with the configured payload).

type SupabaseResponse = { data: unknown; error: unknown }

interface ChainSpies {
  from: ReturnType<typeof vi.fn>
  select: ReturnType<typeof vi.fn>
  eq: ReturnType<typeof vi.fn>
  order: ReturnType<typeof vi.fn>
  limit: ReturnType<typeof vi.fn>
  maybeSingle: ReturnType<typeof vi.fn>
}

let nextOrderResponse: SupabaseResponse = { data: [], error: null }
let nextMaybeSingleResponse: SupabaseResponse = { data: null, error: null }
let spies: ChainSpies

function buildSupabaseStub() {
  const maybeSingle = vi.fn(async () => nextMaybeSingleResponse)
  const limit = vi.fn(() => ({ maybeSingle }))
  const order = vi.fn(() => {
    // Returned object is BOTH chainable (.limit) AND a thenable (await-able)
    // because `getAllMagazines` awaits `.order(...)` directly while
    // `getLatestMagazine` chains `.limit(1).maybeSingle()` after it.
    const orderResult: {
      limit: typeof limit
      then: (
        onFulfilled: (value: SupabaseResponse) => unknown,
        onRejected?: (reason: unknown) => unknown,
      ) => Promise<unknown>
    } = {
      limit,
      then: (onFulfilled, onRejected) =>
        Promise.resolve(nextOrderResponse).then(onFulfilled, onRejected),
    }
    return orderResult
  })
  // Two consecutive `.eq()` calls — each returns an object exposing the next
  // step. We make `eq` self-returning so two calls work, then expose `order`.
  const eq = vi.fn(function chainable(): {
    eq: typeof eq
    order: typeof order
  } {
    return { eq, order }
  })
  const select = vi.fn(() => ({ eq }))
  const from = vi.fn(() => ({ select }))

  spies = { from, select, eq, order, limit, maybeSingle }
  return { from }
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => buildSupabaseStub()),
}))

// Import AFTER the mocks are registered so the module picks up our stubs.
import { getAllMagazines, getLatestMagazine } from '@/lib/data/challenge-magazines'

beforeEach(() => {
  nextOrderResponse = { data: [], error: null }
  nextMaybeSingleResponse = { data: null, error: null }
})

describe('getAllMagazines', () => {
  it('filters by publication slug and is_published, then orders by order_position desc', async () => {
    nextOrderResponse = { data: [], error: null }

    const result = await getAllMagazines('vh-speciale-automobile')

    expect(result).toEqual([])
    expect(spies.from).toHaveBeenCalledWith('magazines')
    // Two .eq() calls — assert both filters were applied.
    expect(spies.eq).toHaveBeenCalledWith('publication', 'vh-speciale-automobile')
    expect(spies.eq).toHaveBeenCalledWith('is_published', true)
    expect(spies.order).toHaveBeenCalledWith('order_position', { ascending: false })
    // limit/maybeSingle must NOT be hit on the list path.
    expect(spies.limit).not.toHaveBeenCalled()
    expect(spies.maybeSingle).not.toHaveBeenCalled()
  })

  it('returns an empty array when the supabase query errors', async () => {
    nextOrderResponse = { data: null, error: { message: 'boom' } }

    const result = await getAllMagazines('challenge-auto')

    expect(result).toEqual([])
    expect(spies.eq).toHaveBeenCalledWith('publication', 'challenge-auto')
  })

  it('returns the data array on success', async () => {
    const fakeRows = [
      { id: 'm1', publication: 'challenge-auto', issue_number: 1 },
      { id: 'm2', publication: 'challenge-auto', issue_number: 2 },
    ]
    nextOrderResponse = { data: fakeRows, error: null }

    const result = await getAllMagazines('challenge-auto')

    expect(result).toEqual(fakeRows)
  })
})

describe('getLatestMagazine', () => {
  it('filters by publication and is_published, then orders/limits/maybeSingles', async () => {
    nextMaybeSingleResponse = { data: null, error: null }

    const result = await getLatestMagazine('challenge-auto')

    expect(result).toBeNull()
    expect(spies.from).toHaveBeenCalledWith('magazines')
    expect(spies.eq).toHaveBeenCalledWith('publication', 'challenge-auto')
    expect(spies.eq).toHaveBeenCalledWith('is_published', true)
    expect(spies.order).toHaveBeenCalledWith('order_position', { ascending: false })
    expect(spies.limit).toHaveBeenCalledWith(1)
    expect(spies.maybeSingle).toHaveBeenCalledTimes(1)
  })

  it('returns null when the supabase query errors', async () => {
    nextMaybeSingleResponse = { data: null, error: { message: 'kaboom' } }

    const result = await getLatestMagazine('vh-speciale-automobile')

    expect(result).toBeNull()
    expect(spies.eq).toHaveBeenCalledWith('publication', 'vh-speciale-automobile')
  })

  it('returns the magazine row on success', async () => {
    const row = { id: 'm9', publication: 'vh-speciale-automobile', issue_number: 9 }
    nextMaybeSingleResponse = { data: row, error: null }

    const result = await getLatestMagazine('vh-speciale-automobile')

    expect(result).toEqual(row)
  })
})
