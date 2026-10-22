'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Loader2, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { createFicheTechnique } from '@/lib/actions/admin/fiches'
import type { Variant } from '@/lib/types'

type ModelOption = { id: string; label: string; versions: string[] }
type ModelRow = { id: string; name: string; brands: { name: string } | { name: string }[] | null }

/** Pick a model and one of its versions (or none: model-level), then fill the fiche on its edit page. */
export default function NewFicheTechniquePage() {
  const router = useRouter()
  const [models, setModels] = useState<ModelOption[]>([])
  const [modelId, setModelId] = useState('')
  const [version, setVersion] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from('models').select('id, name, brands(name)'),
      supabase.from('vehicles_new').select('model_id, variant_list'),
    ]).then(([modelsRes, vehiclesRes]) => {
      const versionsByModel: Record<string, string[]> = {}
      ;((vehiclesRes.data ?? []) as { model_id: string; variant_list: Variant[] | null }[]).forEach((v) => {
        versionsByModel[v.model_id] = (v.variant_list ?? []).map((x) => x.version).filter((x): x is string => !!x)
      })
      const options = ((modelsRes.data ?? []) as ModelRow[]).map((m) => {
        const brand = Array.isArray(m.brands) ? m.brands[0] : m.brands
        return { id: m.id, label: `${brand?.name ?? ''} ${m.name}`.trim(), versions: versionsByModel[m.id] ?? [] }
      })
      setModels(options.sort((a, b) => a.label.localeCompare(b.label)))
      setLoading(false)
    })
  }, [])

  const versions = models.find((m) => m.id === modelId)?.versions ?? []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const result = await createFicheTechnique({ model_id: modelId, version: version || null, specs: {}, en_detail: {} })
    if (result.error) {
      setError(result.error)
      setSaving(false)
      return
    }
    router.push(`/admin/fiches-techniques/${result.ficheId}/edit`)
  }

  const selectClass =
    'w-full bg-dark-600 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm'

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/fiches-techniques"
          className="inline-flex items-center gap-1 text-sm text-dark-300 hover:text-secondary transition mb-3"
        >
          <ChevronLeft className="h-4 w-4" />
          Retour aux fiches techniques
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Nouvelle fiche technique</h1>
        <p className="text-dark-200">
          Une fiche par version, ou une fiche « Toutes versions » pour le modele.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-900/30 border border-red-500/30 text-red-400">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-dark-700 rounded-lg shadow-dark-card border border-white/10 p-6 space-y-4">
          <label className="block">
            <span className="block text-sm font-medium text-dark-200 mb-1.5">Modele</span>
            <select
              required
              value={modelId}
              onChange={(e) => {
                setModelId(e.target.value)
                setVersion('')
              }}
              className={selectClass}
            >
              <option value="">Choisir un modele</option>
              {models.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-dark-200 mb-1.5">Version</span>
            <select value={version} onChange={(e) => setVersion(e.target.value)} disabled={!modelId} className={selectClass}>
              <option value="">Toutes versions</option>
              {versions.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            disabled={saving || !modelId}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Creer et remplir la fiche
          </button>
        </form>
      )}
    </div>
  )
}
