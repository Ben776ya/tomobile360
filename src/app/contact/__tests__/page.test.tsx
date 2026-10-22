import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('@/lib/actions/contact', () => ({ submitContactMessage: vi.fn(async () => ({ success: true })) }))

import ContactPage from '../page'

describe('/contact field errors', () => {
  it('starts with no field marked invalid or described by an error', () => {
    render(<ContactPage />)
    for (const label of [/Nom complet/, /Email/, /Sujet/, /Message/]) {
      const field = screen.getByLabelText(label)
      expect(field).toHaveAttribute('aria-invalid', 'false')
      expect(field).not.toHaveAttribute('aria-describedby')
    }
  })

  it('links each error message to its field and marks the field invalid', () => {
    render(<ContactPage />)
    fireEvent.change(screen.getByLabelText(/Téléphone/), { target: { value: '123' } })
    fireEvent.click(screen.getByRole('button', { name: /Envoyer le message/ }))

    const expected: Array<[RegExp, string]> = [
      [/Nom complet/, 'Le nom est requis'],
      [/Email/, "L'email est requis"],
      [/Téléphone/, 'Numéro de téléphone invalide'],
      [/Sujet/, 'Veuillez sélectionner un sujet'],
      [/Message/, 'Le message est requis'],
    ]
    for (const [label, message] of expected) {
      const field = screen.getByLabelText(label)
      expect(field).toHaveAttribute('aria-invalid', 'true')
      expect(field).toHaveAccessibleDescription(expect.stringContaining(message))
    }

    // Typing clears that field's error and its link.
    fireEvent.change(screen.getByLabelText(/Nom complet/), { target: { value: 'Sara' } })
    expect(screen.getByLabelText(/Nom complet/)).toHaveAttribute('aria-invalid', 'false')
    expect(screen.getByLabelText(/Nom complet/)).not.toHaveAttribute('aria-describedby')
  })
})
