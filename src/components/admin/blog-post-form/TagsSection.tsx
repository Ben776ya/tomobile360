'use client'

import { useCallback, useState } from 'react'
import { useController, useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, X } from 'lucide-react'
import { normalizeTags } from '@/lib/blog/tags'
import type { BlogPostFormValues } from './types'

export function TagsSection() {
  const { control, getValues } = useFormContext<BlogPostFormValues>()

  // `tags: string[]` doesn't fit useFieldArray (which wants objects), so wrap
  // with useController and mutate via setValue from the controller.
  const {
    field: { value: tags, onChange: setTags },
  } = useController({
    control,
    name: 'tags',
  })

  // The chip-editor input is pure UI state, not form state.
  const [newTag, setNewTag] = useState('')

  const addTag = useCallback(() => {
    // Split on '#'/commas/newlines so a pasted "#A#B#C" chunk becomes
    // individual tags instead of one glued blob.
    const additions = normalizeTags([newTag])
    if (additions.length === 0) return
    // Read freshest value at write time to avoid closure-captured stale arrays.
    const current = getValues('tags') ?? []
    // Re-normalize the merged set to dedupe (case-insensitive) against existing tags.
    const merged = normalizeTags([...current, ...additions])
    setTags(merged)
    setNewTag('')
  }, [newTag, getValues, setTags])

  const removeTag = (idx: number) => {
    const current = getValues('tags') ?? []
    setTags(current.filter((_, j) => j !== idx))
  }

  return (
    <div className="bg-dark-700 rounded-lg shadow-dark-card border border-white/10 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Tags</h3>
      <div className="flex gap-2 mb-3">
        <Input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="Ajouter un tag..."
          className="flex-1 bg-dark-700/80 border-white/10 text-white placeholder-dark-400 focus:ring-secondary/50"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addTag()
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          onClick={addTag}
          className="border-white/10 text-dark-200 hover:text-white hover:bg-dark-600/50"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 bg-secondary/20 text-secondary text-sm px-3 py-1 rounded-full"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(i)}
              aria-label={`Supprimer le tag ${tag}`}
              className="text-red-400 hover:text-red-300"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}
