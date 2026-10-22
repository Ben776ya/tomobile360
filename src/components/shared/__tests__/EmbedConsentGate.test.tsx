import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { CONSENT_STORAGE_KEY, readConsent, setConsent } from '@/lib/analytics/consent'
import { ConsentGatedEmbed } from '../EmbedConsentGate'
import { LazyVideoEmbed } from '@/components/videos/LazyVideoEmbed'

const SRC = 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'

function renderGated(kind?: 'video' | 'content') {
  return render(
    <div>
      <ConsentGatedEmbed provider="YouTube" kind={kind} href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" thumbnail="https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg">
        <iframe src={SRC} title="Essai" />
      </ConsentGatedEmbed>
    </div>,
  )
}

describe('ConsentGatedEmbed', () => {
  afterEach(() => localStorage.clear())

  it.each([
    ['no choice yet', null],
    ['cookies refused', 'refused'],
  ])('loads no iframe with %s: notice, « Charger la vidéo », thumbnail and a link out', (_, stored) => {
    if (stored) localStorage.setItem(CONSENT_STORAGE_KEY, stored)
    const { container } = renderGated()

    expect(container.querySelector('iframe')).toBeNull()
    expect(screen.getByText('Cette vidéo est hébergée par YouTube, qui peut déposer des cookies.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Charger la vidéo' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Voir sur YouTube/ })).toHaveAttribute('href', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    expect(container.querySelector('img')!.getAttribute('src')).toContain('i.ytimg.com')
  })

  it('loads the iframe on « Charger la vidéo », for this embed only and without storing consent', () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, 'refused')
    const { container } = renderGated()

    fireEvent.click(screen.getByRole('button', { name: 'Charger la vidéo' }))
    expect(container.querySelector('iframe')!.getAttribute('src')).toBe(SRC)
    expect(container.querySelector('[data-embed-consent]')).toBeNull()
    expect(readConsent()).toBe('refused')
  })

  it('says « Afficher le contenu » for a social post', () => {
    renderGated('content')
    expect(screen.getByText('Ce contenu est hébergé par YouTube, qui peut déposer des cookies.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Afficher le contenu' })).toBeInTheDocument()
  })

  it('loads the iframe straight away once cookies are accepted', () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, 'accepted')
    const { container } = renderGated()
    expect(container.querySelector('iframe')!.getAttribute('src')).toBe(SRC)
    expect(container.querySelector('[data-embed-consent]')).toBeNull()
  })

  it('follows consent given or withdrawn later, without a reload', () => {
    const { container } = renderGated()
    expect(container.querySelector('iframe')).toBeNull()

    act(() => setConsent('accepted'))
    expect(container.querySelector('iframe')).not.toBeNull()

    act(() => setConsent('refused'))
    expect(container.querySelector('iframe')).toBeNull()
    expect(screen.getByRole('button', { name: 'Charger la vidéo' })).toBeInTheDocument()
  })
})

describe('LazyVideoEmbed (model pages)', () => {
  afterEach(() => localStorage.clear())

  const renderEmbed = () =>
    render(<LazyVideoEmbed videoUrl="https://www.youtube.com/watch?v=dQw4w9WgXcQ" title="Essai du Duster" />)

  it('without consent: no iframe, then the privacy-enhanced player on « Charger la vidéo »', () => {
    const { container } = renderEmbed()
    expect(container.querySelector('iframe')).toBeNull()
    expect(screen.queryByRole('button', { name: /Lire la vidéo/ })).toBeNull()
    expect(screen.getByRole('link', { name: /Voir sur YouTube/ })).toHaveAttribute('href', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')

    fireEvent.click(screen.getByRole('button', { name: 'Charger la vidéo' }))
    expect(container.querySelector('iframe')!.getAttribute('src')).toBe(
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1',
    )
  })

  it('with consent: still a click-to-play facade, then the privacy-enhanced player', () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, 'accepted')
    const { container } = renderEmbed()
    expect(container.querySelector('iframe')).toBeNull()
    expect(container.querySelector('[data-embed-consent]')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Lire la vidéo : Essai du Duster' }))
    expect(container.querySelector('iframe')!.getAttribute('src')).toBe(
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1',
    )
  })
})
