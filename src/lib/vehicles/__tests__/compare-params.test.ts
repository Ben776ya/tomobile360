import { describe, it, expect } from 'vitest'
import { parseCompareSlot, parseCompareSlots, compareHref } from '../compare-params'

const ID = '9592d0da-3e98-4a9b-8e45-1e4accc4e639'

describe('comparator URL slots', () => {
  it('reads a bare vehicle id (existing links) and an id with a version', () => {
    expect(parseCompareSlot(ID)).toEqual({ id: ID, version: null })
    expect(parseCompareSlot(`${ID}_1-5-dci-95-expression`)).toEqual({ id: ID, version: '1-5-dci-95-expression' })
    expect(parseCompareSlot(`${ID}_`)).toEqual({ id: ID, version: null })
  })

  it('drops empty values and keeps the order', () => {
    expect(parseCompareSlots(['', `${ID}_a`, 'other'])).toEqual([
      { id: ID, version: 'a' },
      { id: 'other', version: null },
    ])
  })

  it('round-trips through the href the model page links to', () => {
    const href = compareHref([{ id: ID, version: '1-5-dci-95-expression' }, { id: 'x', version: null }])
    expect(href).toBe(`/neuf/comparer?v=${ID}_1-5-dci-95-expression&v=x`)
    const params = new URLSearchParams(href.split('?')[1])
    expect(parseCompareSlots(params.getAll('v'))).toEqual([
      { id: ID, version: '1-5-dci-95-expression' },
      { id: 'x', version: null },
    ])
  })
})
