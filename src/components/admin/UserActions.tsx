'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Shield, Edit, Trash2, X, Loader2 } from 'lucide-react'
import { toggleUserAdmin, updateUserProfile, deleteUser } from '@/lib/actions/admin'

interface UserActionsProps {
  userId: string
  isAdmin: boolean
  fullName: string | null
  phone: string | null
  city: string | null
  isSelf: boolean
}

export function UserActions({ userId, isAdmin, fullName, phone, city, isSelf }: UserActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [editName, setEditName] = useState(fullName || '')
  const [editPhone, setEditPhone] = useState(phone || '')
  const [editCity, setEditCity] = useState(city || '')

  const handleToggleAdmin = async () => {
    const action = isAdmin ? 'retirer les droits admin de' : 'donner les droits admin à'
    if (!confirm(`Voulez-vous ${action} cet utilisateur?`)) return

    setLoading(true)
    const result = await toggleUserAdmin(userId, !isAdmin)
    if (result.error) {
      alert(result.error)
    }
    setLoading(false)
    router.refresh()
  }

  const handleDelete = async () => {
    if (!confirm('Voulez-vous vraiment supprimer cet utilisateur? Cette action est irréversible.')) return

    setLoading(true)
    const result = await deleteUser(userId)
    if (result.error) {
      alert(result.error)
    } else {
      alert('Utilisateur supprimé')
    }
    setLoading(false)
    router.refresh()
  }

  const handleSaveEdit = async () => {
    setLoading(true)
    const result = await updateUserProfile(userId, {
      full_name: editName || undefined,
      phone: editPhone || undefined,
      city: editCity || undefined,
    })
    if (result.error) {
      alert(result.error)
    } else {
      setShowEdit(false)
    }
    setLoading(false)
    router.refresh()
  }

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleAdmin}
          disabled={loading || isSelf}
          title={isSelf ? 'Vous ne pouvez pas modifier vos propres droits' : isAdmin ? 'Retirer admin' : 'Donner admin'}
          className={`shadow-sm border hover:shadow-md transition-all ${isAdmin ? 'bg-yellow-100 border-yellow-300 hover:bg-yellow-200' : 'border-border hover:bg-primary/5'}`}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Shield className={`h-4 w-4 ${isAdmin ? 'fill-yellow-500 text-yellow-500' : ''}`} />
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowEdit(!showEdit)}
          disabled={loading}
          className="shadow-sm border border-border hover:shadow-md hover:bg-primary/5 hover:text-primary transition-all"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={loading || isSelf}
          title={isSelf ? 'Vous ne pouvez pas vous supprimer' : 'Supprimer'}
          className="shadow-sm border border-border hover:shadow-md hover:bg-[#fef3c7] hover:border-[#fde68a] transition-all"
        >
          <Trash2 className="h-4 w-4 text-[#d4921f]" />
        </Button>
      </div>

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary">Modifier l&apos;utilisateur</h3>
              <button onClick={() => setShowEdit(false)} className="text-muted-foreground hover:text-primary">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="editName">Nom complet</Label>
                <Input
                  id="editName"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Nom complet"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="editPhone">Téléphone</Label>
                <Input
                  id="editPhone"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="Numéro de téléphone"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="editCity">Ville</Label>
                <Input
                  id="editCity"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  placeholder="Ville"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowEdit(false)} className="shadow-sm hover:shadow-md transition-all">
                Annuler
              </Button>
              <Button onClick={handleSaveEdit} disabled={loading} className="shadow-sm hover:shadow-md transition-all">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enregistrement...
                  </span>
                ) : (
                  'Enregistrer'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
