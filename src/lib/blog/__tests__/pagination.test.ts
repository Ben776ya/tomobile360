import { describe, it, expect } from 'vitest'
import { paginationRange, ELLIPSIS } from '../pagination'

describe('paginationRange', () => {
  it('lists every page when there are 7 or fewer', () => {
    expect(paginationRange(1, 1)).toEqual([1])
    expect(paginationRange(3, 5)).toEqual([1, 2, 3, 4, 5])
    expect(paginationRange(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('collapses the tail with a trailing ellipsis near the start', () => {
    expect(paginationRange(1, 10)).toEqual([1, 2, ELLIPSIS, 10])
  })

  it('shows ellipses on both sides in the middle', () => {
    expect(paginationRange(5, 10)).toEqual([1, ELLIPSIS, 4, 5, 6, ELLIPSIS, 10])
  })

  it('collapses the head with a leading ellipsis near the end', () => {
    expect(paginationRange(10, 10)).toEqual([1, ELLIPSIS, 9, 10])
  })
})
