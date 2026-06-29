import { test, expect } from 'vitest'
import { normalizeText, videoMatchesCar, filterVideosForCar } from '../match-video-to-car'

test('normalizeText lowercases, strips accents, and collapses punctuation to spaces', () => {
  expect(normalizeText('Mercedes-Benz EQE SUV')).toBe('mercedes benz eqe suv')
  expect(normalizeText('Peugeot 3008 — Électrique')).toBe('peugeot 3008 electrique')
})

test('matches a clear brand + model title', () => {
  expect(videoMatchesCar('Essai Mercedes-Benz EQE SUV au Maroc', null, 'Mercedes-Benz', 'EQE SUV')).toBe(true)
})

test('rejects a title naming other cars', () => {
  expect(videoMatchesCar('BMW iX vs Audi Q4 e-tron', null, 'Mercedes-Benz', 'EQE SUV')).toBe(false)
})

test('Peugeot 3008 matches its title but not "300" or "300C"', () => {
  expect(videoMatchesCar('Nouveau Peugeot 3008 2024', null, 'Peugeot', '3008')).toBe(true)
  expect(videoMatchesCar('Top 300 voitures de la ville', null, 'Peugeot', '3008')).toBe(false)
  expect(videoMatchesCar('Peugeot 300C présentation', null, 'Peugeot', '3008')).toBe(false)
})

test('BYD Atto 3 matches (short trailing digit safe inside the model sequence)', () => {
  expect(videoMatchesCar('BYD Atto 3 Hybride Rechargeable', null, 'BYD', 'Atto 3')).toBe(true)
})

test('Zeekr X matches its title but not "BMW X5"', () => {
  expect(videoMatchesCar('Zeekr X électrique - Essai', null, 'Zeekr', 'X')).toBe(true)
  expect(videoMatchesCar('BMW X5 essai complet', null, 'Zeekr', 'X')).toBe(false)
})

test('Seres 3 matches its title but the brand guard rejects "Série 3 BMW" and "Audi A3"', () => {
  expect(videoMatchesCar('Seres 3 Prix Maroc', null, 'Seres', '3')).toBe(true)
  expect(videoMatchesCar('Série 3 BMW comparatif', null, 'Seres', '3')).toBe(false)
  expect(videoMatchesCar('Audi A3 Sportback', null, 'Seres', '3')).toBe(false)
})

test('BYD Han matches; a title without the brand is rejected', () => {
  expect(videoMatchesCar('BYD Han Berline de luxe', null, 'BYD', 'Han')).toBe(true)
  expect(videoMatchesCar('Khan documentary review', null, 'BYD', 'Han')).toBe(false)
})

test('accent and case insensitivity', () => {
  expect(videoMatchesCar('PEUGEOT 308 Électrique', null, 'peugeot', '308')).toBe(true)
})

test('brand alias: title says "Mercedes" without "Benz"', () => {
  expect(videoMatchesCar('Mercedes EQE SUV en détail', null, 'Mercedes-Benz', 'EQE SUV')).toBe(true)
})

test('model named only in the description still matches', () => {
  expect(videoMatchesCar('Essai complet', 'On teste la BYD Atto 3 cette semaine', 'BYD', 'Atto 3')).toBe(true)
})

test('empty / whitespace title with null description does not match', () => {
  expect(videoMatchesCar('   ', null, 'BYD', 'Han')).toBe(false)
})

test('filterVideosForCar keeps matches, sorts by views desc, and caps at limit', () => {
  const videos = [
    { id: 'a', title: 'BYD Atto 3 essai', description: null, views: 100 },
    { id: 'b', title: 'BYD Atto 3 prix Maroc', description: null, views: 500 },
    { id: 'c', title: 'Tesla Model Y review', description: null, views: 999 },
    { id: 'd', title: 'BYD Atto 3 vs concurrents', description: null, views: 300 },
    { id: 'e', title: 'Atto 3 BYD autonomie réelle', description: null, views: 50 },
  ]
  const result = filterVideosForCar(videos, 'BYD', 'Atto 3', 3)
  expect(result.map((v) => v.id)).toEqual(['b', 'd', 'a'])
})

test('filterVideosForCar treats null views as zero when sorting', () => {
  const videos = [
    { id: 'x', title: 'BYD Han test', description: null, views: null },
    { id: 'y', title: 'BYD Han prix', description: null, views: 10 },
  ]
  expect(filterVideosForCar(videos, 'BYD', 'Han').map((v) => v.id)).toEqual(['y', 'x'])
})
