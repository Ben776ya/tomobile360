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
  it('offers all nine categories including the new ones', () => {
    render(<Wrapper />)
    for (const label of [
      'Nouveautés',
      'Tendances',
      'Business',
      'Marché',
      'Essai',
      'Classic Cars',
      'Interview',
      'Reportage',
      'Pratique',
    ]) {
      expect(screen.getByRole('option', { name: label })).toBeInTheDocument()
    }
  })
})
