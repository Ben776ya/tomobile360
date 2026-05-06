import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validateInternalHref } from '../validate-route'

test('validateInternalHref — root', () => {
  assert.equal(validateInternalHref('/').valid, true)
  assert.equal(validateInternalHref('/').isInternal, true)
})

test('validateInternalHref — static valid routes', () => {
  for (const href of [
    '/actu',
    '/neuf',
    '/occasion',
    '/services',
    '/videos',
    '/auteurs',
    '/qui-sommes-nous',
    '/contact',
    '/coups-de-coeur',
    '/forum',
    '/mentions-legales',
    '/confidentialite',
    '/conditions',
    '/cookies',
  ]) {
    assert.equal(validateInternalHref(href).valid, true, `${href} should be valid`)
  }
})

test('validateInternalHref — dynamic valid routes', () => {
  assert.equal(validateInternalHref('/actu/some-slug-2026').valid, true)
  assert.equal(validateInternalHref('/neuf/dacia').valid, true)
  assert.equal(validateInternalHref('/neuf/dacia/sandero').valid, true)
  assert.equal(validateInternalHref('/services/financement').valid, true)
  assert.equal(validateInternalHref('/videos/abc123').valid, true)
  assert.equal(validateInternalHref('/auteurs/john-doe').valid, true)
})

test('validateInternalHref — known broken patterns', () => {
  assert.equal(validateInternalHref('/comparatifs/x').valid, false)
  assert.equal(validateInternalHref('/fiches-techniques/y').valid, false)
  assert.equal(validateInternalHref('/blog/post-1').valid, false)
  assert.equal(validateInternalHref('/neuf/dacia/sandero/extra-segment').valid, false)
  assert.equal(validateInternalHref('/actu').valid, true)
  assert.equal(validateInternalHref('/actu/foo/bar').valid, false)
})

test('validateInternalHref — trailing slash and case tolerated', () => {
  assert.equal(validateInternalHref('/actu/').valid, true)
  assert.equal(validateInternalHref('/Actu').valid, true)
  assert.equal(validateInternalHref('/NEUF/dacia/').valid, true)
})

test('validateInternalHref — query string and fragment stripped', () => {
  assert.equal(validateInternalHref('/actu?utm=x').valid, true)
  assert.equal(validateInternalHref('/actu/foo#section').valid, true)
  assert.equal(validateInternalHref('/comparatifs/x?utm=1').valid, false)
})

test('validateInternalHref — non-internal hrefs reported as not internal', () => {
  for (const href of [
    'https://example.com/page',
    'http://x.com',
    '//cdn.example.com/img.png',
    'mailto:foo@bar.com',
    'tel:+212600000000',
    '#anchor',
    '?utm=1',
    'relative/path',
    '',
  ]) {
    const r = validateInternalHref(href)
    assert.equal(r.isInternal, false, `${href} should be flagged non-internal`)
    assert.equal(r.valid, true, `${href} should not be reported as broken`)
  }
})
