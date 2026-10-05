import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import type { InstagramReel } from '@/lib/instagram'
import { InstagramReels } from '../InstagramReels'

const embedReel = (code: string): InstagramReel => ({
  code,
  permalink: `https://www.instagram.com/reel/${code}/`,
  videoUrl: null,
  posterUrl: null,
  caption: null,
})

const videoReel = (code: string): InstagramReel => ({
  code,
  permalink: `https://www.instagram.com/reel/${code}/`,
  videoUrl: `https://scontent.cdninstagram.com/v/${code}.mp4`,
  posterUrl: `https://scontent.cdninstagram.com/v/${code}.jpg`,
  caption: `Essai ${code}`,
})

const PROFILE = 'https://www.instagram.com/tomobile360.ma'

function renderReels(reels: InstagramReel[]) {
  const utils = render(<InstagramReels reels={reels} handle="tomobile360.ma" profileUrl={PROFILE} />)
  // The panel defers its media until the page has loaded and is idle.
  act(() => {
    window.dispatchEvent(new Event('load'))
    vi.runAllTimers()
  })
  const panel = utils.container.querySelector('[data-instagram-reels]') as HTMLElement
  return { ...utils, panel }
}

describe('InstagramReels', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal('requestIdleCallback', undefined)
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe() {}
        disconnect() {}
      },
    )
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('is a borderless 9:16 labelled panel', () => {
    const { panel } = renderReels([embedReel('AAA'), embedReel('BBB')])
    expect(panel).toHaveAttribute('aria-label', 'Reels Instagram @tomobile360.ma')
    expect(panel.className).toContain('aspect-[9/16]')
    expect(panel.className).not.toMatch(/(^|\s)border(\s|-)/)
  })

  it('keeps only the publisher header: avatar, name and "Voir le profil"', () => {
    const { panel } = renderReels([embedReel('AAA'), embedReel('BBB')])
    const header = panel.firstElementChild as HTMLElement
    expect(header.style.minHeight).toBe('54px')
    expect(header.querySelector('img')!.getAttribute('src')).toContain('instagram-avatar.jpg')
    expect(header).toHaveTextContent(/^tomobile360\.maVoir le profil$/)

    const button = screen.getByRole('link', { name: 'Voir le profil Instagram de @tomobile360.ma' })
    expect(button).toHaveTextContent('Voir le profil')
    for (const link of Array.from(header.querySelectorAll('a'))) {
      expect(link).toHaveAttribute('href', PROFILE)
      expect(link).toHaveAttribute('target', '_blank')
      expect(link.getAttribute('rel')).toContain('noopener')
    }
    // The name link is a mouse shortcut; the button is the one keyboard stop.
    expect(header.querySelectorAll('a')[0]).toHaveAttribute('tabindex', '-1')

    // No counter, caption or bottom bar: the only other controls are the arrows.
    const visibleText = Array.from(panel.querySelectorAll('*'))
      .filter((el) => el.children.length === 0 && !el.classList.contains('sr-only') && el.textContent?.trim())
      .map((el) => el.textContent!.trim())
    expect(visibleText).toEqual(['tomobile360.ma', 'Voir le profil'])
    expect(screen.getAllByRole('button').map((b) => b.getAttribute('aria-label'))).toEqual(['Reel précédent', 'Reel suivant'])
  })

  it('waits for the page load before mounting the Instagram iframe', () => {
    const readyState = vi.spyOn(document, 'readyState', 'get').mockReturnValue('loading')
    render(<InstagramReels reels={[embedReel('AAA')]} handle="tomobile360.ma" profileUrl={PROFILE} />)
    act(() => {
      vi.runAllTimers()
    })
    expect(document.querySelector('iframe')).toBeNull()
    readyState.mockReturnValue('complete')
    act(() => {
      window.dispatchEvent(new Event('load'))
      vi.runAllTimers()
    })
    expect(document.querySelector('iframe')).not.toBeNull()
  })

  it('shows reels without an MP4 through Instagram’s official embed, cropped to the reel', () => {
    const { panel } = renderReels([embedReel('AAA'), embedReel('BBB'), embedReel('CCC')])
    const iframe = panel.querySelector('iframe')!
    expect(iframe.getAttribute('src')).toBe('https://www.instagram.com/reel/AAA/embed/')
    expect(iframe.title).toBe('Reel Instagram de @tomobile360.ma (1 sur 3)')
    expect(panel.querySelector('video')).toBeNull()
    // 64/45 of the media width (the reel is 45/64 of the embed's width) + 1%
    // overscan, centred, lifted past Instagram's 54 px header plus a fifth of
    // the reel's excess height (so burned-in top logos survive).
    expect(parseFloat(iframe.style.width)).toBeCloseTo((64 / 45) * 1.01 * 100, 3)
    expect(parseFloat(iframe.style.left)).toBeCloseTo(((1 - (64 / 45) * 1.01) / 2) * 100, 3)
    expect(iframe.style.top).toBe('calc(-64.908px - 0.2%)')
    expect(iframe.closest('[data-reel-media]')).not.toBeNull()
    // Its cropped-away links must not take keyboard focus or be read out.
    expect(iframe).toHaveAttribute('tabindex', '-1')
    expect(iframe).toHaveAttribute('aria-hidden', 'true')
  })

  it('clips with overflow: clip so focus or scrollIntoView can never shift the crop', () => {
    const { panel } = renderReels([embedReel('AAA')])
    expect(panel.style.overflow).toBe('clip')
    expect((panel.querySelector('[data-reel-media]') as HTMLElement).style.overflow).toBe('clip')
  })

  describe('embed readiness', () => {
    const mounted = (iframe: HTMLIFrameElement, origin = 'https://www.instagram.com') =>
      act(() => {
        window.dispatchEvent(
          new MessageEvent('message', { origin, source: iframe.contentWindow, data: JSON.stringify({ type: 'MOUNTED' }) }),
        )
      })
    const placeholder = (panel: HTMLElement) => panel.querySelector('[data-reel-placeholder]')
    const fallback = () => screen.queryAllByRole('link', { name: 'Voir ce reel sur Instagram' }).find((a) => !a.classList.contains('sr-only'))

    it('keeps the reel hidden until Instagram reports it MOUNTED (load alone is not enough)', () => {
      const { panel } = renderReels([embedReel('AAA')])
      const iframe = panel.querySelector('iframe')!
      fireEvent.load(iframe)
      expect(placeholder(panel)).not.toBeNull()
      mounted(iframe)
      expect(placeholder(panel)).toBeNull()
      expect(fallback()).toBeUndefined()
    })

    it('ignores messages from other origins', () => {
      const { panel } = renderReels([embedReel('AAA')])
      mounted(panel.querySelector('iframe')!, 'https://evil.example')
      expect(placeholder(panel)).not.toBeNull()
    })

    it('shows a link to the reel when the embed loads but never mounts (deleted reel, error page)', () => {
      const { panel } = renderReels([embedReel('AAA')])
      fireEvent.load(panel.querySelector('iframe')!)
      act(() => {
        vi.advanceTimersByTime(4000)
      })
      expect(placeholder(panel)).not.toBeNull()
      expect(fallback()).toHaveAttribute('href', 'https://www.instagram.com/reel/AAA/')
      expect(fallback()).toHaveAttribute('target', '_blank')
    })

    it('shows the link when the embed never loads at all, and recovers if it mounts late', () => {
      const { panel } = renderReels([embedReel('AAA')])
      act(() => {
        vi.advanceTimersByTime(15000)
      })
      expect(fallback()).toBeDefined()
      mounted(panel.querySelector('iframe')!)
      expect(placeholder(panel)).toBeNull()
      expect(fallback()).toBeUndefined()
    })

    it('gives keyboard users a focus-revealed link to the reel in place of the cropped embed', () => {
      const { panel } = renderReels([embedReel('AAA'), embedReel('BBB')])
      const link = screen.getByRole('link', { name: 'Voir ce reel sur Instagram' })
      expect(link).toHaveClass('sr-only')
      expect(link.className).toContain('focus:not-sr-only')
      expect(link).toHaveAttribute('href', 'https://www.instagram.com/reel/AAA/')
      // Tab order: profile button, reel link, previous, next.
      const order = Array.from(panel.querySelectorAll<HTMLElement>('a, button')).filter((el) => el.getAttribute('tabindex') !== '-1')
      expect(order.map((el) => el.getAttribute('aria-label') ?? el.textContent?.trim())).toEqual([
        'Voir le profil Instagram de @tomobile360.ma',
        'Voir ce reel sur Instagram',
        'Reel précédent',
        'Reel suivant',
      ])
    })
  })

  it('cycles through reels with next / previous and wraps both ways', () => {
    const { panel } = renderReels([embedReel('AAA'), embedReel('BBB'), embedReel('CCC')])
    const src = () => panel.querySelector('iframe')!.getAttribute('src')
    const counter = () => panel.querySelector('[aria-live="polite"]')!.textContent
    expect(counter()).toBe('Reel 1 sur 3')

    fireEvent.click(screen.getByRole('button', { name: 'Reel suivant' }))
    expect(src()).toContain('/reel/BBB/')
    fireEvent.click(screen.getByRole('button', { name: 'Reel précédent' }))
    fireEvent.click(screen.getByRole('button', { name: 'Reel précédent' }))
    expect(src()).toContain('/reel/CCC/')
    expect(counter()).toBe('Reel 3 sur 3')
    fireEvent.click(screen.getByRole('button', { name: 'Reel suivant' }))
    expect(src()).toContain('/reel/AAA/')
  })

  it('plays reels with an MP4 natively and full-bleed, under the same header-only chrome', () => {
    const { panel } = renderReels([videoReel('VID')])
    const video = panel.querySelector('video')!
    expect(panel.querySelector('iframe')).toBeNull()
    expect(video.getAttribute('src')).toBe('https://scontent.cdninstagram.com/v/VID.mp4')
    expect(video.getAttribute('poster')).toBe('https://scontent.cdninstagram.com/v/VID.jpg')
    expect(video.muted).toBe(true)
    expect(video.hasAttribute('playsinline')).toBe(true)
    expect(video.loop).toBe(true)
    expect(video.className).toContain('object-cover')
    expect(video.closest('[data-reel-media]')).not.toBeNull()
    // No caption or "Reels" label: the header is the only text.
    expect(panel).not.toHaveTextContent('Essai VID')
    const links = screen.getAllByRole('link')
    expect(links.filter((l) => !l.classList.contains('sr-only')).map((l) => l.textContent?.trim())).toEqual(['tomobile360.ma', 'Voir le profil'])
    // Plus the keyboard-only link to the reel on Instagram.
    expect(links.find((l) => l.classList.contains('sr-only'))).toHaveAttribute('href', 'https://www.instagram.com/reel/VID/')
    // Single reel: no navigation, only the playback controls.
    expect(screen.queryByRole('button', { name: 'Reel suivant' })).toBeNull()
    expect(screen.getAllByRole('button').map((b) => b.getAttribute('aria-label'))).toEqual(['Lire le reel', 'Activer le son'])
  })

  it('toggles sound and keeps the choice across reels', () => {
    const { panel } = renderReels([videoReel('V1'), videoReel('V2')])
    const sound = screen.getByRole('button', { name: 'Activer le son' })
    expect(sound).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(sound)
    expect(panel.querySelector('video')!.muted).toBe(false)
    fireEvent.click(screen.getByRole('button', { name: 'Reel suivant' }))
    expect(panel.querySelector('video')!.getAttribute('src')).toContain('V2.mp4')
    expect(panel.querySelector('video')!.muted).toBe(false)
    expect(screen.getByRole('button', { name: 'Couper le son' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('always offers a keyboard-reachable play / pause control for the native reel', () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
    const pause = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
    const { panel } = renderReels([videoReel('VID')])
    const video = panel.querySelector('video')!

    fireEvent.click(screen.getByRole('button', { name: 'Lire le reel' }))
    expect(play).toHaveBeenCalled()
    fireEvent.play(video) // the browser reports playback started
    const pauseButton = screen.getByRole('button', { name: 'Mettre le reel en pause' })

    vi.spyOn(video, 'paused', 'get').mockReturnValue(false)
    fireEvent.click(pauseButton)
    expect(pause).toHaveBeenCalled()
    fireEvent.pause(video)
    expect(screen.getByRole('button', { name: 'Lire le reel' })).toBeInTheDocument()
  })

  it('switches between native video and embed per reel', () => {
    const { panel } = renderReels([videoReel('V1'), embedReel('E1')])
    expect(panel.querySelector('video')).not.toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Reel suivant' }))
    expect(panel.querySelector('video')).toBeNull()
    expect(panel.querySelector('iframe')!.getAttribute('src')).toBe('https://www.instagram.com/reel/E1/embed/')
  })

  it('renders nothing without reels', () => {
    const { container } = render(<InstagramReels reels={[]} handle="tomobile360.ma" profileUrl={PROFILE} />)
    expect(container).toBeEmptyDOMElement()
  })
})
