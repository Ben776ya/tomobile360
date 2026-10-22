import { describe, it, expect } from 'vitest'
import { fuelLabel, transmissionLabel, originLabel } from '../display-labels'

describe('display labels', () => {
  it('translates the stored English enums', () => {
    expect(transmissionLabel('Manual')).toBe('Manuelle')
    expect(transmissionLabel('Automatic')).toBe('Automatique')
    expect(fuelLabel('Hybrid')).toBe('Hybride')
    expect(fuelLabel('Electric')).toBe('Électrique')
    expect(originLabel('China')).toBe('Chine')
  })

  it('passes unmapped values through and blanks empty ones', () => {
    expect(fuelLabel('Essence')).toBe('Essence')
    expect(originLabel('France')).toBe('France')
    expect(transmissionLabel(null)).toBe('')
    expect(originLabel(undefined)).toBe('')
  })
})
