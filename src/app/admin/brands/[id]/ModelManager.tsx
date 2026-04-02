'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Check, X, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { createModel, updateModel, deleteModel } from '@/lib/actions/brands'
import type { Model, VehicleCategory } from '@/lib/types'

const CATEGORIES: VehicleCategory[] = [
  'Citadine',
  'Compacte',
  'Berline',
  'SUV',
  'Monospace',
  'Break',
  'Coupé',
  'Cabriolet',
  'Pick-up',
  'Utilitaire',
]

const CATEGORY_COLORS: Record<VehicleCategory, string> = {
  Citadine: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  Compacte: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Berline: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  SUV: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  Monospace: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  Break: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  'Coupé': 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  Cabriolet: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  'Pick-up': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  Utilitaire: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
}

type ModelWithCount = Model & { vehicle_count: number }

interface ModelManagerProps {
  brandId: string
  initialModels: ModelWithCount[]
}

export function ModelManager({ brandId, initialModels }: ModelManagerProps) {
  const router = useRouter()

  const [models] = useState<ModelWithCount[]>(initialModels)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState<VehicleCategory>('Berline')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState('')

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editCategory, setEditCategory] = useState<VehicleCategory>('Berline')
  const [editError, setEditError] = useState('')
  const [editSaving, setEditSaving] = useState(false)

  const [deleteError, setDeleteError] = useState<Record<string, string>>({})
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) {
      setAddError('Le nom est requis')
      return
    }

    setAdding(true)
    setAddError('')

    const result = await createModel({
      brand_id: brandId,
      name: newName.trim(),
      category: newCategory,
    })

    if (result.error) {
      setAddError(result.error)
      setAdding(false)
      return
    }

    setNewName('')
    setNewCategory('Berline')
    setShowAddForm(false)
    router.refresh()
    setAdding(false)
  }

  const startEdit = (model: ModelWithCount) => {
    setEditingId(model.id)
    setEditName(model.name)
    setEditCategory(model.category)
    setEditError('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditError('')
  }

  const handleSaveEdit = async (modelId: string) => {
    if (!editName.trim()) {
      setEditError('Le nom est requis')
      return
    }

    setEditSaving(true)
    setEditError('')

    const result = await updateModel(modelId, brandId, {
      name: editName.trim(),
      category: editCategory,
    })

    if (result.error) {
      setEditError(result.error)
      setEditSaving(false)
      return
    }

    setEditingId(null)
    router.refresh()
    setEditSaving(false)
  }

  const handleDelete = async (model: ModelWithCount) => {
    if (model.vehicle_count > 0) {
      setDeleteError((prev) => ({
        ...prev,
        [model.id]: `Impossible de supprimer : ${model.vehicle_count} véhicule${model.vehicle_count !== 1 ? 's' : ''} lié${model.vehicle_count !== 1 ? 's' : ''}`,
      }))
      return
    }

    if (!confirm(`Supprimer le modèle "${model.name}" ?`)) return

    setDeleting(model.id)
    setDeleteError((prev) => {
      const next = { ...prev }
      delete next[model.id]
      return next
    })

    const result = await deleteModel(model.id, brandId)

    if (result.error) {
      setDeleteError((prev) => ({ ...prev, [model.id]: result.error! }))
      setDeleting(null)
      return
    }

    router.refresh()
    setDeleting(null)
  }

  return (
    <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg border border-white/10 shadow-dark-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <h2 className="text-base font-semibold text-white">
          Modèles ({models.length})
        </h2>
        {!showAddForm && (
          <Button
            size="sm"
            onClick={() => setShowAddForm(true)}
            className="shadow-dark-card hover:shadow-dark-elevated transition-all"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Ajouter
          </Button>
        )}
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="px-5 py-4 border-b border-white/10 bg-dark-600/20">
          <p className="text-sm font-medium text-white mb-3">Nouveau modèle</p>
          {addError && (
            <p className="mb-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded px-3 py-2">
              {addError}
            </p>
          )}
          <form onSubmit={handleAdd} className="flex items-end gap-3">
            <div className="space-y-1.5 flex-1">
              <Label htmlFor="new-model-name" className="text-dark-200 text-xs">
                Nom <span className="text-red-400">*</span>
              </Label>
              <Input
                id="new-model-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="ex. Clio"
                autoFocus
                className="bg-dark-600/50 border-white/10 text-white placeholder:text-dark-400 focus:border-secondary/50 h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5 w-40">
              <Label htmlFor="new-model-category" className="text-dark-200 text-xs">
                Catégorie
              </Label>
              <select
                id="new-model-category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as VehicleCategory)}
                className="w-full h-9 px-2 bg-dark-600/50 border border-white/10 rounded-md text-white text-sm focus:border-secondary/50 focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-dark-700">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 pb-0.5">
              <Button
                type="submit"
                size="sm"
                disabled={adding}
                className="shadow-dark-card hover:shadow-dark-elevated transition-all h-9"
              >
                {adding ? '...' : 'Créer'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAddForm(false)
                  setNewName('')
                  setAddError('')
                }}
                className="border border-white/10 text-dark-300 hover:text-white h-9"
              >
                Annuler
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Models list */}
      {models.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <p className="text-dark-400 text-sm">Aucun modèle — commencez par en ajouter un.</p>
        </div>
      ) : (
        <ul className="divide-y divide-white/5">
          {models.map((model) => {
            const colorClass = CATEGORY_COLORS[model.category] ?? 'bg-gray-500/20 text-gray-300 border-gray-500/30'
            const isEditing = editingId === model.id
            const isDeleting = deleting === model.id

            return (
              <li key={model.id} className="px-5 py-3">
                {isEditing ? (
                  <div>
                    {editError && (
                      <p className="mb-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded px-2 py-1.5">
                        {editError}
                      </p>
                    )}
                    <div className="flex items-center gap-3">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        autoFocus
                        className="bg-dark-600/50 border-white/10 text-white focus:border-secondary/50 h-8 text-sm flex-1"
                      />
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value as VehicleCategory)}
                        className="h-8 px-2 bg-dark-600/50 border border-white/10 rounded-md text-white text-sm focus:border-secondary/50 focus:outline-none w-36"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat} className="bg-dark-700">
                            {cat}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={editSaving}
                          onClick={() => handleSaveEdit(model.id)}
                          className="h-8 w-8 p-0 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/50"
                          title="Enregistrer"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={cancelEdit}
                          className="h-8 w-8 p-0 border border-white/10 text-dark-300 hover:text-white hover:border-white/20"
                          title="Annuler"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-white flex-1">{model.name}</span>
                    <Badge className={`border text-xs px-2 py-0 ${colorClass}`}>
                      {model.category}
                    </Badge>
                    <span className="text-xs text-dark-400 w-20 text-right">
                      {model.vehicle_count} véhicule{model.vehicle_count !== 1 ? 's' : ''}
                    </span>
                    <div className="flex gap-1.5 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(model)}
                        className="h-7 w-7 p-0 border border-white/10 text-dark-300 hover:text-white hover:border-white/20"
                        title="Modifier"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isDeleting}
                        onClick={() => handleDelete(model)}
                        className="h-7 w-7 p-0 border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40"
                        title="Supprimer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Delete error per row */}
                {deleteError[model.id] && (
                  <p className="mt-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded px-2 py-1.5">
                    {deleteError[model.id]}
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
