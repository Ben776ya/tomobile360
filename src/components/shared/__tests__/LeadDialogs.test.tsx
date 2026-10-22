import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BUSINESS_INFO } from '@/lib/business-info'
import { TestDriveDialog } from '../TestDriveDialog'
import { ContactDealerDialog } from '../ContactDealerDialog'

let open: ReturnType<typeof vi.fn>

beforeEach(() => {
  open = vi.fn()
  vi.stubGlobal('open', open)
})
afterEach(() => vi.unstubAllGlobals())

/** The wa.me URL passed to window.open, and its decoded prefilled text. */
function openedWhatsApp() {
  expect(open).toHaveBeenCalledTimes(1)
  const url = new URL(open.mock.calls[0][0] as string)
  return { url, text: url.searchParams.get('text') ?? '' }
}

const fill = (label: RegExp, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } })

describe('TestDriveDialog', () => {
  function openDialog(props: Partial<Parameters<typeof TestDriveDialog>[0]> = {}) {
    render(<TestDriveDialog vehicleName="Dacia Duster" dealerPhone={BUSINESS_INFO.WHATSAPP_E164} {...props} />)
    fireEvent.click(screen.getByRole('button', { name: 'Demander un essai' }))
  }

  it('asks for name, phone and city, but no email', () => {
    openDialog()
    expect(screen.getByLabelText(/Nom complet/)).toBeRequired()
    expect(screen.getByLabelText(/Téléphone/)).toBeRequired()
    expect(screen.getByLabelText(/Ville/)).toBeRequired()
    expect(screen.queryByLabelText(/Email/i)).toBeNull()
    expect(document.querySelector('input[type="email"]')).toBeNull()
  })

  it('sends model, version and city in an encoded WhatsApp message, then confirms in the dialog', () => {
    openDialog({ version: '1.5 dCi 115 Prestige' })
    fill(/Nom complet/, 'Jean & Fils')
    fill(/Téléphone/, '+212 600 000 000')
    fill(/Ville/, 'Rabat')
    fireEvent.click(screen.getByRole('button', { name: 'Envoyer la demande' }))

    const { url, text } = openedWhatsApp()
    expect(url.origin + url.pathname).toBe(`https://wa.me/${BUSINESS_INFO.WHATSAPP_E164}`)
    // "&" and "+" survive: the whole text is one encoded parameter.
    expect(Array.from(url.searchParams.keys())).toEqual(['text'])
    expect(text).toContain('Modèle: Dacia Duster')
    expect(text).toContain('Version: 1.5 dCi 115 Prestige')
    expect(text).toContain('Ville: Rabat')
    expect(text).toContain('Nom: Jean & Fils')
    expect(text).toContain('Téléphone: +212 600 000 000')

    expect(screen.getByRole('heading', { name: "Votre demande s'ouvre dans WhatsApp" })).toBeInTheDocument()
    expect(screen.getByText(/adressé à l.équipe Tomobile 360/)).toBeInTheDocument()
    expect(screen.getByText(/répond pendant ses horaires d.ouverture/)).toHaveTextContent(BUSINESS_INFO.HOURS_WEEKDAY)
    expect(screen.getByText(/répond pendant ses horaires d.ouverture/)).toHaveTextContent(BUSINESS_INFO.HOURS_SATURDAY)
    expect(screen.getByRole('link', { name: 'Ouvrir le message dans WhatsApp' })).toHaveAttribute('href', url.toString())
    expect(screen.queryByRole('button', { name: 'Envoyer la demande' })).toBeNull()
  })

  it('leaves the version line out when there is none', () => {
    openDialog()
    fill(/Nom complet/, 'Sara')
    fill(/Téléphone/, '0600000000')
    fill(/Ville/, 'Casablanca')
    fireEvent.click(screen.getByRole('button', { name: 'Envoyer la demande' }))
    const { text } = openedWhatsApp()
    expect(text).toContain('Modèle: Dacia Duster')
    expect(text).not.toContain('Version')
  })

  it('shows the empty form again after the confirmation is closed', () => {
    openDialog()
    fill(/Nom complet/, 'Sara')
    fill(/Téléphone/, '0600000000')
    fill(/Ville/, 'Casablanca')
    fireEvent.click(screen.getByRole('button', { name: 'Envoyer la demande' }))
    fireEvent.click(screen.getByRole('button', { name: 'Fermer' }))
    fireEvent.click(screen.getByRole('button', { name: 'Demander un essai' }))
    expect(screen.getByLabelText(/Nom complet/)).toHaveValue('')
    expect(screen.getByRole('button', { name: 'Envoyer la demande' })).toBeInTheDocument()
  })
})

describe('ContactDealerDialog', () => {
  it('encodes the WhatsApp text, so "&" in a name does not cut the message', () => {
    render(
      <ContactDealerDialog vehicleName="Dacia Duster" dealerEmail={BUSINESS_INFO.EMAIL} dealerPhone={BUSINESS_INFO.WHATSAPP_DISPLAY} />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Contacter le concessionnaire' }))
    fill(/Nom complet/, 'Jean & Fils')
    fill(/Email/, 'jean@example.com')
    fill(/Téléphone/, '+212 600 000 000')
    fireEvent.click(screen.getByRole('button', { name: 'Envoyer le message' }))

    const { url, text } = openedWhatsApp()
    expect(url.origin + url.pathname).toBe(`https://wa.me/${BUSINESS_INFO.WHATSAPP_E164}`)
    expect(Array.from(url.searchParams.keys())).toEqual(['text'])
    expect(text).toContain('Nom: Jean & Fils\nTéléphone: +212 600 000 000\nEmail: jean@example.com')
    expect(text).toContain('je suis intéressé par le véhicule Dacia Duster')
  })
})
