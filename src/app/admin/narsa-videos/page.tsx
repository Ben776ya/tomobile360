'use client'

import { useState, useEffect, useRef } from 'react'
import { Upload, Trash2, Eye, EyeOff, Video, Loader2 } from 'lucide-react'
import {
  getNarsaVideos,
  uploadNarsaVideo,
  deleteNarsaVideo,
  toggleNarsaVideoPublished,
} from '@/lib/actions/narsa-videos'
import type { NarsaVideo } from '@/lib/types'

function NarsaVideosContent() {
  const [videos, setVideos] = useState<NarsaVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const loadVideos = async () => {
    setLoading(true)
    const result = await getNarsaVideos()
    if (result.error) {
      setError(result.error)
    } else {
      setVideos(result.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadVideos()
  }, [])

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setUploading(true)

    const formData = new FormData(e.currentTarget)
    const result = await uploadNarsaVideo(formData)

    if (result.success) {
      setSuccess('Video uploadee avec succes')
      formRef.current?.reset()
      await loadVideos()
    } else {
      setError(result.error || 'Erreur lors de l\'upload')
    }

    setUploading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Etes-vous sur de vouloir supprimer cette video ?')) return

    setError(null)
    setSuccess(null)

    const result = await deleteNarsaVideo(id)
    if (result.success) {
      setVideos((prev) => prev.filter((v) => v.id !== id))
      setSuccess('Video supprimee avec succes')
    } else {
      setError(result.error || 'Erreur lors de la suppression')
    }
  }

  const handleTogglePublished = async (id: string, currentState: boolean) => {
    setError(null)
    setSuccess(null)

    const result = await toggleNarsaVideoPublished(id, !currentState)
    if (result.success) {
      setVideos((prev) =>
        prev.map((v) =>
          v.id === id ? { ...v, is_published: !currentState } : v
        )
      )
      setSuccess(!currentState ? 'Video publiee' : 'Video masquee')
    } else {
      setError(result.error || 'Erreur lors de la mise a jour')
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Videos NARSA
        </h1>
        <p className="text-dark-200">
          Gerez les videos de securite routiere NARSA
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

      {/* Upload Form Card */}
      <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg border border-white/10 p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          Ajouter une video
        </h2>

        <form ref={formRef} onSubmit={handleUpload} className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-dark-200 mb-1">
              Titre <span className="text-red-400">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              placeholder="Titre de la video"
              className="w-full bg-dark-600 border border-white/10 rounded-lg px-4 py-2 text-secondary placeholder-dark-400 focus:outline-none focus:border-primary"
            />
          </div>

          {/* Duration */}
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-dark-200 mb-1">
              Duree
            </label>
            <input
              id="duration"
              name="duration"
              type="text"
              placeholder="Ex: 12:34"
              className="w-full bg-dark-600 border border-white/10 rounded-lg px-4 py-2 text-secondary placeholder-dark-400 focus:outline-none focus:border-primary"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-dark-200 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Description de la video"
              className="w-full bg-dark-600 border border-white/10 rounded-lg px-4 py-2 text-secondary placeholder-dark-400 focus:outline-none focus:border-primary resize-none"
            />
          </div>

          {/* Video File */}
          <div>
            <label htmlFor="video_file" className="block text-sm font-medium text-dark-200 mb-1">
              Fichier video <span className="text-red-400">*</span>
            </label>
            <input
              id="video_file"
              name="video_file"
              type="file"
              required
              accept="video/*"
              className="w-full bg-dark-600 border border-white/10 rounded-lg px-4 py-2 text-secondary placeholder-dark-400 focus:outline-none focus:border-primary file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-primary file:text-white file:cursor-pointer"
            />
          </div>

          {/* Thumbnail File */}
          <div>
            <label htmlFor="thumbnail_file" className="block text-sm font-medium text-dark-200 mb-1">
              Miniature (optionnel)
            </label>
            <input
              id="thumbnail_file"
              name="thumbnail_file"
              type="file"
              accept="image/*"
              className="w-full bg-dark-600 border border-white/10 rounded-lg px-4 py-2 text-secondary placeholder-dark-400 focus:outline-none focus:border-primary file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-primary file:text-white file:cursor-pointer"
            />
          </div>

          {/* Order Position */}
          <div>
            <label htmlFor="order_position" className="block text-sm font-medium text-dark-200 mb-1">
              Position d&apos;ordre
            </label>
            <input
              id="order_position"
              name="order_position"
              type="number"
              min={0}
              placeholder="0"
              className="w-full bg-dark-600 border border-white/10 rounded-lg px-4 py-2 text-secondary placeholder-dark-400 focus:outline-none focus:border-primary"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={uploading}
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Upload en cours...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Uploader la video
              </span>
            )}
          </button>
        </form>
      </div>

      {/* Video List Card */}
      <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg border border-white/10 p-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Video className="h-5 w-5 text-primary" />
          Videos existantes ({videos.length})
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : videos.length === 0 ? (
          <p className="text-dark-400 text-center py-12">
            Aucune video NARSA pour le moment
          </p>
        ) : (
          <div className="space-y-4">
            {videos.map((video) => (
              <div
                key={video.id}
                className="flex items-center gap-4 bg-dark-600/50 rounded-lg p-4 border border-white/5"
              >
                {/* Video Preview */}
                <div className="w-40 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-dark-800">
                  <video
                    src={video.video_url}
                    muted
                    preload="metadata"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Video Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold truncate">
                    {video.title}
                  </h3>
                  {video.description && (
                    <p className="text-dark-300 text-sm mt-1 line-clamp-2">
                      {video.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-dark-400">
                    {video.duration && <span>Duree: {video.duration}</span>}
                    <span>Ordre: {video.order_position}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        video.is_published
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {video.is_published ? 'Publiee' : 'Masquee'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleTogglePublished(video.id, video.is_published)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    title={video.is_published ? 'Masquer' : 'Publier'}
                  >
                    {video.is_published ? (
                      <Eye className="h-5 w-5 text-green-400" />
                    ) : (
                      <EyeOff className="h-5 w-5 text-dark-400" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(video.id)}
                    className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="h-5 w-5 text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminNarsaVideosPage() {
  return <NarsaVideosContent />
}
