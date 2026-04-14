'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { FileText, Search, Trash2, Edit, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { deleteFicheTechnique } from '@/lib/actions/admin'
import type { FicheTechnique } from '@/lib/types'

export default function AdminFichesTechniquesPage() {
  const supabase = createClient()
  const [fiches, setFiches] = useState<FicheTechnique[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const fetchFiches = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('fiches_techniques')
      .select('id, model_id, specs, en_detail, source_url, created_at, updated_at, models(id, name, brand_id, brands(id, name))')
      .order('updated_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setFiches((data as unknown as FicheTechnique[]) ?? [])
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchFiches()
  }, [fetchFiches])

  const handleDelete = async (id: string, label: string) => {
    if (!confirm(`Supprimer la fiche technique de "${label}" ?`)) return

    setDeletingId(id)
    setError(null)
    setSuccess(null)

    const result = await deleteFicheTechnique(id)
    if (result.error) {
      setError(result.error)
    } else {
      setFiches((prev) => prev.filter((f) => f.id !== id))
      setSuccess('Fiche technique supprimee avec succes')
    }
    setDeletingId(null)
  }

  const filtered = fiches.filter((f) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    const brandName = f.models?.brands?.name?.toLowerCase() ?? ''
    const modelName = f.models?.name?.toLowerCase() ?? ''
    return brandName.includes(q) || modelName.includes(q)
  })

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Fiches Techniques
        </h1>
        <p className="text-dark-200">
          Gerez les fiches techniques des modeles ({fiches.length} fiches)
        </p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-900/30 border border-red-500/30 text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 rounded-lg bg-green-900/30 border border-green-500/30 text-green-400">
          {success}
        </div>
      )}

      {/* Search */}
      <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg shadow-dark-card border border-white/10 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-400" />
          <input
            type="text"
            placeholder="Rechercher par marque ou modele..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-dark-600 border border-white/10 rounded-lg text-white placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg shadow-dark-card border border-white/10 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-dark-300" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Aucune fiche technique
            </h3>
            <p className="text-dark-300">
              {search.trim()
                ? 'Aucun resultat pour cette recherche.'
                : 'Aucune fiche technique pour le moment.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-600/50 border-b border-white/10">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-dark-200">
                    Marque / Modele
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-dark-200">
                    Specs
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-dark-200">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-dark-200">
                    Mis a jour
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-dark-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((fiche) => {
                  const brandName = fiche.models?.brands?.name ?? '—'
                  const modelName = fiche.models?.name ?? '—'
                  const specsCount = Object.keys(fiche.specs || {}).length
                  const detailsCount = Object.keys(fiche.en_detail || {}).length
                  const label = `${brandName} ${modelName}`

                  return (
                    <tr key={fiche.id} className="hover:bg-white/5 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                          <div>
                            <p className="font-medium text-white">{brandName}</p>
                            <p className="text-sm text-dark-300">{modelName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-dark-200">
                          {specsCount} champ{specsCount !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-dark-200">
                          {detailsCount} categorie{detailsCount !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-dark-300">
                          {new Date(fiche.updated_at).toLocaleDateString('fr-FR')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/fiches-techniques/${fiche.id}/edit`}>
                            <button className="p-2 rounded-lg hover:bg-white/10 transition-colors" title="Modifier">
                              <Edit className="h-4 w-4 text-dark-200" />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDelete(fiche.id, label)}
                            disabled={deletingId === fiche.id}
                            className="p-2 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
                            title="Supprimer"
                          >
                            {deletingId === fiche.id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-red-400" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-red-400" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
