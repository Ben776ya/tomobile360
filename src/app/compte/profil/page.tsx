'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Lock, Trash2, Upload } from 'lucide-react'
import Image from 'next/image'

export default function ProfilePage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)

  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone: '',
    city: '',
    bio: '',
    avatar_url: '',
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>('')

  const fetchProfile = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      setUser(user)
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        setProfile(profile)
        setProfileForm({
          full_name: profile.full_name || '',
          phone: profile.phone || '',
          city: profile.city || '',
          bio: profile.bio || '',
          avatar_url: profile.avatar_url || '',
        })
        setAvatarPreview(profile.avatar_url || '')
      }
    }
  }, [supabase])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('Format non supporté. Utilisez JPG, PNG, GIF ou WebP.')
      e.target.value = ''
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('La photo ne doit pas dépasser 2 Mo.')
      e.target.value = ''
      return
    }

    setAvatarFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const uploadAvatar = async () => {
    if (!avatarFile || !user) return null

    const fileExt = avatarFile.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('user-avatars')
      .upload(filePath, avatarFile, {
        upsert: true,
      })

    if (uploadError) {
      return null
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('user-avatars').getPublicUrl(filePath)

    return publicUrl
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let avatar_url = profileForm.avatar_url

      // Upload new avatar if selected
      if (avatarFile) {
        const uploadedUrl = await uploadAvatar()
        if (uploadedUrl) {
          avatar_url = uploadedUrl
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileForm.full_name,
          phone: profileForm.phone,
          city: profileForm.city,
          bio: profileForm.bio,
          avatar_url: avatar_url,
        })
        .eq('id', user.id)

      if (error) throw error

      alert('Profil mis à jour avec succès!')
      fetchProfile()
      setAvatarFile(null)
    } catch {
      alert('Erreur lors de la mise à jour du profil')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Les mots de passe ne correspondent pas')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      })

      if (error) throw error

      alert('Mot de passe mis à jour avec succès!')
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch {
      alert('Erreur lors de la mise à jour du mot de passe')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Êtes-vous sûr de vouloir supprimer votre compte? Cette action est irréversible.'
    )

    if (!confirmed) return

    const doubleConfirm = window.confirm(
      'Dernière confirmation: Toutes vos données seront définitivement supprimées.'
    )

    if (!doubleConfirm) return

    setLoading(true)

    try {
      // Delete user's listings first
      await supabase.from('vehicles_used').delete().eq('user_id', user.id)

      // Delete favorites
      await supabase.from('favorites').delete().eq('user_id', user.id)

      // Delete profile
      await supabase.from('profiles').delete().eq('id', user.id)

      // Sign out
      await supabase.auth.signOut()

      alert('Compte supprimé avec succès')
      window.location.href = '/'
    } catch {
      alert('Erreur lors de la suppression du compte')
    } finally {
      setLoading(false)
    }
  }

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">
          Paramètres du profil
        </h1>
        <p className="text-gray-500">
          Gérez vos informations personnelles et votre compte
        </p>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
            <User className="h-6 w-6 text-secondary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary">Informations personnelles</h2>
            <p className="text-sm text-gray-500">
              Modifiez vos informations de profil
            </p>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-6">
          {/* Avatar Upload */}
          <div>
            <Label className="text-gray-700">Photo de profil</Label>
            <div className="flex items-center gap-4 mt-2">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100">
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt="Avatar"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              <div>
                <input
                  type="file"
                  id="avatar"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <label htmlFor="avatar">
                  <Button type="button" variant="outline" size="sm" asChild>
                    <span className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Changer la photo
                    </span>
                  </Button>
                </label>
                <p className="text-xs text-gray-400 mt-1">
                  JPG, PNG ou GIF - Max 2MB
                </p>
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <Label htmlFor="full_name" className="text-gray-700">Nom complet *</Label>
            <Input
              id="full_name"
              type="text"
              value={profileForm.full_name}
              onChange={(e) =>
                setProfileForm({ ...profileForm, full_name: e.target.value })
              }
              required
              className="bg-white text-gray-900 border-gray-300 focus-visible:ring-secondary/50 placeholder:text-gray-400"
            />
          </div>

          {/* Email (Read-only) */}
          <div>
            <Label htmlFor="email" className="text-gray-700">Email</Label>
            <Input
              id="email"
              type="email"
              value={user.email}
              disabled
              className="bg-white text-gray-400 border-gray-300"
            />
            <p className="text-xs text-gray-400 mt-1">
              L&apos;email ne peut pas être modifié
            </p>
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone" className="text-gray-700">Téléphone</Label>
            <Input
              id="phone"
              type="tel"
              value={profileForm.phone}
              onChange={(e) =>
                setProfileForm({ ...profileForm, phone: e.target.value })
              }
              placeholder="+212 6XX XXX XXX"
              className="bg-white text-gray-900 border-gray-300 focus-visible:ring-secondary/50 placeholder:text-gray-400"
            />
          </div>

          {/* City */}
          <div>
            <Label htmlFor="city" className="text-gray-700">Ville</Label>
            <select
              id="city"
              value={profileForm.city}
              onChange={(e) =>
                setProfileForm({ ...profileForm, city: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-secondary/50"
            >
              <option value="">Sélectionnez une ville</option>
              <option value="Casablanca">Casablanca</option>
              <option value="Rabat">Rabat</option>
              <option value="Marrakech">Marrakech</option>
              <option value="Fès">Fès</option>
              <option value="Tanger">Tanger</option>
              <option value="Agadir">Agadir</option>
              <option value="Meknès">Meknès</option>
              <option value="Oujda">Oujda</option>
              <option value="Kenitra">Kenitra</option>
              <option value="Tétouan">Tétouan</option>
              <option value="Safi">Safi</option>
              <option value="Mohammedia">Mohammedia</option>
              <option value="El Jadida">El Jadida</option>
              <option value="Béni Mellal">Béni Mellal</option>
              <option value="Nador">Nador</option>
            </select>
          </div>

          {/* Bio */}
          <div>
            <Label htmlFor="bio" className="text-gray-700">Bio</Label>
            <textarea
              id="bio"
              value={profileForm.bio}
              onChange={(e) =>
                setProfileForm({ ...profileForm, bio: e.target.value })
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-secondary/50 placeholder:text-gray-400"
              placeholder="Parlez-nous un peu de vous..."
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </Button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Lock className="h-6 w-6 text-secondary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary">Changer le mot de passe</h2>
            <p className="text-sm text-gray-500">
              Mettez à jour votre mot de passe
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <Label htmlFor="current_password" className="text-gray-700">Mot de passe actuel</Label>
            <Input
              id="current_password"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  currentPassword: e.target.value,
                })
              }
              className="bg-white text-gray-900 border-gray-300 focus-visible:ring-secondary/50 placeholder:text-gray-400"
            />
          </div>

          <div>
            <Label htmlFor="new_password" className="text-gray-700">Nouveau mot de passe</Label>
            <Input
              id="new_password"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  newPassword: e.target.value,
                })
              }
              className="bg-white text-gray-900 border-gray-300 focus-visible:ring-secondary/50 placeholder:text-gray-400"
            />
          </div>

          <div>
            <Label htmlFor="confirm_password" className="text-gray-700">
              Confirmer le nouveau mot de passe
            </Label>
            <Input
              id="confirm_password"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  confirmPassword: e.target.value,
                })
              }
              className="bg-white text-gray-900 border-gray-300 focus-visible:ring-secondary/50 placeholder:text-gray-400"
            />
          </div>

          <Button type="submit" disabled={loading} className="shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
          </Button>
        </form>
      </div>

      {/* Delete Account */}
      <div className="bg-[#78350f]/20 border border-[#FFC358]/30 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-[#78350f]/30 border border-[#FFC358]/30 flex items-center justify-center">
            <Trash2 className="h-6 w-6 text-[#FFC358]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#fcd34d]">
              Zone de danger
            </h2>
            <p className="text-sm text-[#FFC358]">
              Actions irréversibles sur votre compte
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-md p-4 border border-[#FFC358]/20">
            <h3 className="font-semibold text-[#fcd34d] mb-2">
              Supprimer mon compte
            </h3>
            <p className="text-sm text-[#FFC358]/80 mb-4">
              Cette action supprimera définitivement votre compte, toutes vos
              annonces, vos favoris et vos données personnelles. Cette action
              est irréversible.
            </p>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={loading}
              className="shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer mon compte
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
