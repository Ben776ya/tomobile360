'use client'

import { useState } from 'react'
import { ChevronsDownUp, ChevronsUpDown } from 'lucide-react'

interface ExpandAllButtonProps {
  /** id of the element whose descendant <details> get toggled. */
  containerId: string
}

/**
 * "Tout déplier / Tout replier" for the Fiche Technique rubrics.
 *
 * Progressive enhancement over native <details>: without JS every rubric
 * still opens on tap; with JS this flips all of them at once so a reader
 * who wants the whole sheet doesn't tap 6 times.
 */
export function ExpandAllButton({ containerId }: ExpandAllButtonProps) {
  const [allOpen, setAllOpen] = useState(false)

  const toggle = () => {
    const next = !allOpen
    document
      .querySelectorAll<HTMLDetailsElement>(`#${containerId} details`)
      .forEach((d) => { d.open = next })
    setAllOpen(next)
  }

  const Icon = allOpen ? ChevronsDownUp : ChevronsUpDown

  return (
    <button
      type="button"
      onClick={toggle}
      aria-expanded={allOpen}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-secondary hover:text-secondary/80 transition-colors"
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {allOpen ? 'Tout replier' : 'Tout déplier'}
    </button>
  )
}
