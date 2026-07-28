import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useForm, FormProvider } from 'react-hook-form'
import { MetadataSection } from '../MetadataSection'
import type { BlogPostFormValues } from '../types'

function Wrapper() {
  const methods = useForm<BlogPostFormValues>({
    defaultValues: { category: '' } as BlogPostFormValues,
  })
  return (
    <FormProvider {...methods}>
      <MetadataSection mode="create" />
    </FormProvider>
  )
}

describe('MetadataSection category dropdown', () => {
  it('offers the six categories', () => {
    render(<Wrapper />)
    for (const label of [
      'Nouveautés',
      'Essai',
      'Business',
      'Interview',
      'Classic Cars',
      'Sport Auto',
    ]) {
      expect(screen.getByRole('option', { name: label })).toBeInTheDocument()
    }
  })

  it('no longer offers the dropped categories', () => {
    render(<Wrapper />)
    for (const label of ['Tendances', 'Marché', 'Reportage', 'Pratique']) {
      expect(
        screen.queryByRole('option', { name: label }),
      ).not.toBeInTheDocument()
    }
  })
})

describe('MetadataSection author dropdown', () => {
  it('offers the curated writers including the newly added ones', () => {
    render(<Wrapper />)
    for (const name of [
      'Rédaction Tomobile360',
      'David Jérémie',
      'Amine Bouharaoui',
      'Rafik Kamal Lahlou',
    ]) {
      expect(screen.getByRole('option', { name })).toBeInTheDocument()
    }
  })
})
