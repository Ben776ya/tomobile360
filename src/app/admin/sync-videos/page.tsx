'use client'

import { useState, useEffect } from 'react'
import { syncYouTubeVideos, getVideoStats } from '@/app/actions/sync-youtube'
import { Button } from '@/components/ui/button'
import { RefreshCw, Youtube, CheckCircle, XCircle, Video, Eye } from 'lucide-react'
import Link from 'next/link'

export default function SyncVideosPage() {
  const [syncing, setSyncing] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    videosAdded?: number
    videosUpdated?: number
    error?: string
  } | null>(null)
  const [stats, setStats] = useState<{
    totalVideos: number
    totalViews: number
  } | null>(null)

  const handleSync = async () => {
    setSyncing(true)
    setResult(null)

    try {
      const syncResult = await syncYouTubeVideos()
      setResult(syncResult)

      if (syncResult.success) {
        const newStats = await getVideoStats()
        setStats(newStats)
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Failed to sync videos',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setSyncing(false)
    }
  }

  const loadStats = async () => {
    try {
      const newStats = await getVideoStats()
      setStats(newStats)
    } catch {
      setStats({
        totalVideos: 0,
        totalViews: 0,
      })
    }
  }

  // Load stats on mount
  useEffect(() => {
    // Use setTimeout to prevent blocking the initial render
    const timer = setTimeout(() => {
      loadStats()
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Synchronisation YouTube
            </h1>
            <p className="text-dark-200">
              Synchronisez les vidéos de votre chaîne YouTube avec le site
            </p>
          </div>

          {/* Stats Card */}
          {stats && (
            <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg shadow-dark-card border border-white/10 p-6 mb-6">
              <h2 className="text-lg font-bold text-white mb-4">
                Statistiques
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                    <Video className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {stats.totalVideos}
                    </p>
                    <p className="text-sm text-dark-300">Vidéos publiées</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                    <Eye className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {stats.totalViews.toLocaleString()}
                    </p>
                    <p className="text-sm text-dark-300">Vues totales</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sync Card */}
          <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg shadow-dark-card border border-white/10 p-6 mb-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-[#32B75C]/20 flex items-center justify-center flex-shrink-0">
                <Youtube className="h-6 w-6 text-[#32B75C]" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-white mb-2">
                  Chaîne YouTube
                </h2>
                <p className="text-sm text-dark-300 mb-4">
                  Synchronisez les vidéos depuis la chaîne <strong className="text-white">Tomobile360</strong>.
                  Cela récupérera automatiquement les titres, descriptions, miniatures,
                  durées et nombres de vues depuis YouTube.
                </p>
                <Button
                  onClick={handleSync}
                  disabled={syncing}
                  className="bg-secondary hover:bg-secondary-600 text-dark-800 font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {syncing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Synchronisation en cours...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Synchroniser maintenant
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Result Message */}
            {result && (
              <div
                className={`p-4 rounded-lg flex items-start gap-3 ${
                  result.success
                    ? 'bg-green-900/30 border border-green-500/30'
                    : 'bg-[#78350f]/30 border border-[#32B75C]/30'
                }`}
              >
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-[#32B75C] flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p
                    className={`font-semibold mb-1 ${
                      result.success ? 'text-green-300' : 'text-[#fcd34d]'
                    }`}
                  >
                    {result.success ? 'Synchronisation réussie' : 'Erreur'}
                  </p>
                  <p
                    className={`text-sm ${
                      result.success ? 'text-green-400' : 'text-[#32B75C]'
                    }`}
                  >
                    {result.message}
                  </p>
                  {result.error && (
                    <p className="text-sm text-[#32B75C] mt-2 font-mono">
                      {result.error}
                    </p>
                  )}
                  {result.success && (result.videosAdded || result.videosUpdated) && (
                    <div className="mt-3 flex gap-4 text-sm">
                      {result.videosAdded !== undefined && result.videosAdded > 0 && (
                        <span className="text-green-400">
                          ✓ {result.videosAdded} vidéo{result.videosAdded > 1 ? 's' : ''} ajoutée{result.videosAdded > 1 ? 's' : ''}
                        </span>
                      )}
                      {result.videosUpdated !== undefined && result.videosUpdated > 0 && (
                        <span className="text-green-400">
                          ↻ {result.videosUpdated} vidéo{result.videosUpdated > 1 ? 's' : ''} mise{result.videosUpdated > 1 ? 's' : ''} à jour
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Instructions Card */}
          <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg shadow-dark-card border border-white/10 p-6">
            <h2 className="text-lg font-bold text-white mb-4">
              Configuration requise
            </h2>
            <div className="space-y-4 text-sm text-dark-200">
              <div>
                <p className="font-semibold text-white mb-2">
                  1. Clé API YouTube
                </p>
                <p>
                  Pour utiliser cette fonctionnalité, vous devez configurer une clé API
                  YouTube Data API v3 dans votre fichier <code className="px-2 py-1 bg-dark-600/50 rounded text-xs text-dark-100">.env.local</code>:
                </p>
                <pre className="mt-2 p-3 bg-dark-600/50 rounded-lg text-xs overflow-x-auto text-dark-100">
                  YOUTUBE_API_KEY=votre_cle_api_youtube
                </pre>
              </div>
              <div>
                <p className="font-semibold text-white mb-2">
                  2. Obtenir une clé API
                </p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Accédez à <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-secondary underline">Google Cloud Console</a></li>
                  <li>Créez un nouveau projet ou sélectionnez-en un existant</li>
                  <li>Activez l&apos;API &quot;YouTube Data API v3&quot;</li>
                  <li>Créez des identifiants (Clé API)</li>
                  <li>Copiez la clé et ajoutez-la dans votre <code className="px-1 py-0.5 bg-dark-600/50 rounded text-xs text-dark-100">.env.local</code></li>
                  <li>Redémarrez votre serveur de développement</li>
                </ol>
              </div>
              <div>
                <p className="font-semibold text-white mb-2">
                  3. Automatisation
                </p>
                <p>
                  Pour synchroniser automatiquement les vidéos, vous pouvez configurer
                  un cron job avec Vercel Cron ou utiliser un service externe pour
                  appeler régulièrement cette page.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Link */}
          <div className="mt-6 text-center">
            <Link
              href="/videos"
              className="inline-flex items-center gap-2 text-secondary hover:text-secondary hover:underline font-medium transition-colors duration-300"
            >
              Voir toutes les vidéos →
            </Link>
          </div>
    </div>
  )
}
