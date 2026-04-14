'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Save,
  Loader2,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react'
import { updateFicheTechnique } from '@/lib/actions/admin'
import type { FicheTechnique } from '@/lib/types'

interface FicheTechniqueFormProps {
  fiche: FicheTechnique
}

export function FicheTechniqueForm({ fiche }: FicheTechniqueFormProps) {
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>(
    Object.entries(fiche.specs || {}).map(([key, value]) => ({ key, value }))
  )
  const [details, setDetails] = useState<{ category: string; items: string[] }[]>(
    Object.entries(fiche.en_detail || {}).map(([category, items]) => ({
      category,
      items: [...items],
    }))
  )
  const [expandedSections, setExpandedSections] = useState<Set<number>>(
    new Set(Object.keys(fiche.en_detail || {}).map((_, i) => i))
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // --- Specs handlers ---
  const addSpec = () => {
    setSpecs((prev) => [...prev, { key: '', value: '' }])
  }

  const updateSpec = (index: number, field: 'key' | 'value', value: string) => {
    setSpecs((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    )
  }

  const removeSpec = (index: number) => {
    setSpecs((prev) => prev.filter((_, i) => i !== index))
  }

  // --- Details handlers ---
  const addCategory = () => {
    const newIndex = details.length
    setDetails((prev) => [...prev, { category: '', items: [''] }])
    setExpandedSections((prev) => {
      const next = new Set(Array.from(prev))
      next.add(newIndex)
      return next
    })
  }

  const updateCategoryName = (index: number, name: string) => {
    setDetails((prev) =>
      prev.map((d, i) => (i === index ? { ...d, category: name } : d))
    )
  }

  const removeCategory = (index: number) => {
    setDetails((prev) => prev.filter((_, i) => i !== index))
    setExpandedSections((prev) => {
      const next = new Set<number>()
      prev.forEach((v) => {
        if (v < index) next.add(v)
        else if (v > index) next.add(v - 1)
      })
      return next
    })
  }

  const toggleSection = (index: number) => {
    setExpandedSections((prev) => {
      const next = new Set(Array.from(prev))
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  const addItem = (catIndex: number) => {
    setDetails((prev) =>
      prev.map((d, i) =>
        i === catIndex ? { ...d, items: [...d.items, ''] } : d
      )
    )
  }

  const updateItem = (catIndex: number, itemIndex: number, value: string) => {
    setDetails((prev) =>
      prev.map((d, i) =>
        i === catIndex
          ? {
              ...d,
              items: d.items.map((item, j) => (j === itemIndex ? value : item)),
            }
          : d
      )
    )
  }

  const removeItem = (catIndex: number, itemIndex: number) => {
    setDetails((prev) =>
      prev.map((d, i) =>
        i === catIndex
          ? { ...d, items: d.items.filter((_, j) => j !== itemIndex) }
          : d
      )
    )
  }

  // --- Submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    // Convert specs array to Record, skipping empty keys
    const specsRecord: Record<string, string> = {}
    for (const s of specs) {
      const key = s.key.trim()
      if (key) {
        specsRecord[key] = s.value
      }
    }

    // Convert details array to Record, skipping empty categories/items
    const detailsRecord: Record<string, string[]> = {}
    for (const d of details) {
      const cat = d.category.trim()
      if (cat) {
        const items = d.items.filter((item) => item.trim() !== '')
        detailsRecord[cat] = items
      }
    }

    const result = await updateFicheTechnique(fiche.id, {
      specs: specsRecord,
      en_detail: detailsRecord,
    })

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess('Fiche technique mise a jour avec succes')
    }

    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Error/Success Messages */}
      {error && (
        <div className="p-4 rounded-lg bg-red-900/30 border border-red-500/30 text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 rounded-lg bg-green-900/30 border border-green-500/30 text-green-400">
          {success}
        </div>
      )}

      {/* Section 1: Specs */}
      <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg shadow-dark-card border border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            Caracteristiques techniques
          </h2>
          <button
            type="button"
            onClick={addSpec}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary hover:bg-primary/90 text-white rounded-lg transition shadow-glow-indigo-sm"
          >
            <Plus className="h-4 w-4" />
            Ajouter
          </button>
        </div>

        {specs.length === 0 ? (
          <p className="text-dark-400 text-center py-8">
            Aucune caracteristique technique. Cliquez sur &quot;Ajouter&quot; pour commencer.
          </p>
        ) : (
          <div className="space-y-3">
            {specs.map((spec, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="text"
                  value={spec.key}
                  onChange={(e) => updateSpec(index, 'key', e.target.value)}
                  placeholder="Cle (ex: Motorisation)"
                  className="flex-1 bg-dark-600 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
                <input
                  type="text"
                  value={spec.value}
                  onChange={(e) => updateSpec(index, 'value', e.target.value)}
                  placeholder="Valeur (ex: 1.0 Tce 100)"
                  className="flex-[2] bg-dark-600 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeSpec(index)}
                  className="p-2 rounded-lg hover:bg-red-500/20 transition-colors flex-shrink-0"
                  title="Supprimer"
                >
                  <Trash2 className="h-4 w-4 text-red-400" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: En Detail */}
      <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg shadow-dark-card border border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">En Detail</h2>
          <button
            type="button"
            onClick={addCategory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary hover:bg-primary/90 text-white rounded-lg transition shadow-glow-indigo-sm"
          >
            <Plus className="h-4 w-4" />
            Ajouter categorie
          </button>
        </div>

        {details.length === 0 ? (
          <p className="text-dark-400 text-center py-8">
            Aucune categorie. Cliquez sur &quot;Ajouter categorie&quot; pour commencer.
          </p>
        ) : (
          <div className="space-y-4">
            {details.map((detail, catIndex) => {
              const isExpanded = expandedSections.has(catIndex)
              return (
                <div
                  key={catIndex}
                  className="border border-white/10 rounded-lg overflow-hidden"
                >
                  {/* Category header */}
                  <div className="flex items-center gap-3 bg-dark-600/50 px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleSection(catIndex)}
                      className="p-0.5 rounded hover:bg-white/10 transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-dark-200" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-dark-200" />
                      )}
                    </button>
                    <input
                      type="text"
                      value={detail.category}
                      onChange={(e) =>
                        updateCategoryName(catIndex, e.target.value)
                      }
                      placeholder="Nom de la categorie"
                      className="flex-1 bg-dark-600 border border-white/10 rounded-lg px-3 py-1.5 text-white placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                    />
                    <span className="text-xs text-dark-400 flex-shrink-0">
                      {detail.items.length} element{detail.items.length !== 1 ? 's' : ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeCategory(catIndex)}
                      className="p-2 rounded-lg hover:bg-red-500/20 transition-colors flex-shrink-0"
                      title="Supprimer la categorie"
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </button>
                  </div>

                  {/* Category items */}
                  {isExpanded && (
                    <div className="p-4 space-y-2">
                      {detail.items.map((item, itemIndex) => (
                        <div
                          key={itemIndex}
                          className="flex items-center gap-3"
                        >
                          <span className="text-xs text-dark-400 w-6 text-right flex-shrink-0">
                            {itemIndex + 1}.
                          </span>
                          <input
                            type="text"
                            value={item}
                            onChange={(e) =>
                              updateItem(catIndex, itemIndex, e.target.value)
                            }
                            placeholder="Element..."
                            className="flex-1 bg-dark-600 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => removeItem(catIndex, itemIndex)}
                            className="p-2 rounded-lg hover:bg-red-500/20 transition-colors flex-shrink-0"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addItem(catIndex)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-dark-200 hover:text-white hover:bg-white/5 rounded-lg transition mt-2"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Ajouter un element
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition shadow-glow-indigo-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Sauvegarder
        </button>
        <Link
          href="/admin/fiches-techniques"
          className="inline-flex items-center gap-2 px-6 py-3 text-dark-200 hover:text-white hover:bg-white/5 rounded-lg transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Link>
      </div>
    </form>
  )
}
