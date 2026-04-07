'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, BookOpen, Play, ExternalLink } from 'lucide-react'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'

const NARSA_WEBSITE = 'https://www.narsa.ma/fr'

const articles = [
  {
    title: 'Journée Nationale de la Sécurité Routière 2026',
    description: 'Séminaire international sur le comportement des usagers de deux-roues — sensibilisation et prévention.',
    href: 'https://www.narsa.ma/fr/actualites',
    date: '18 février 2026',
  },
  {
    title: 'Semaine Mondiale de la Sécurité Routière',
    description: 'La 8ème Semaine mondiale des Nations Unies pour la sécurité routière — focus piétons et cyclistes.',
    href: 'https://www.narsa.ma/fr/actualites',
    date: 'Mai 2025',
  },
  {
    title: 'Programme d\'action pour la sécurité routière',
    description: 'Le programme estival de la NARSA pour réduire les accidents sur les routes marocaines.',
    href: 'https://www.narsa.ma/fr/actualites',
    date: 'Été 2025',
  },
  {
    title: 'Journée mondiale du souvenir des victimes de la route',
    description: 'Commémoration et sensibilisation pour honorer les victimes des accidents de la circulation.',
    href: 'https://www.narsa.ma/fr/actualites',
    date: 'Novembre 2025',
  },
]

// TODO: Replace placeholder youtubeId values with real NARSA video IDs
const videos = [
  {
    title: 'Vidéo NARSA 1',
    description: 'Vidéo de sensibilisation à la sécurité routière.',
    youtubeId: 'PLACEHOLDER_1',
  },
  {
    title: 'Vidéo NARSA 2',
    description: 'Vidéo de sensibilisation à la sécurité routière.',
    youtubeId: 'PLACEHOLDER_2',
  },
  {
    title: 'Vidéo NARSA 3',
    description: 'Vidéo de sensibilisation à la sécurité routière.',
    youtubeId: 'PLACEHOLDER_3',
  },
]

const safetyTips = [
  {
    icon: ShieldCheck,
    title: 'Respectez le code de la route',
    description: 'Respecter les limitations de vitesse et la signalisation sauve des vies chaque jour.',
  },
  {
    icon: ShieldCheck,
    title: 'Portez la ceinture de sécurité',
    description: 'La ceinture réduit de 50% le risque de décès en cas d\'accident.',
  },
  {
    icon: ShieldCheck,
    title: 'Zéro téléphone au volant',
    description: 'L\'utilisation du téléphone multiplie par 3 le risque d\'accident.',
  },
]

export default function SecuriteRoutierePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 pt-6">
        <Breadcrumbs items={[
          { name: 'Services', href: '/services' },
          { name: 'Sécurité Routière' },
        ]} />
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#E8EBF5] via-white to-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-[#4057aa] mb-6 transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux services
          </Link>
          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-4">
              <Image
                src="/narsa_logo.png"
                alt="NARSA"
                width={200}
                height={60}
                className="h-12 w-auto object-contain"
              />
            </div>
            <p className="text-lg md:text-xl text-gray-500 mt-2">
              Découvrez les actualités, conseils et vidéos de sensibilisation de la NARSA —
              Agence Nationale de la Sécurité Routière du Maroc.
            </p>
          </div>
        </div>
      </section>

      {/* Safety Tips */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-primary text-center mb-12">
            Conseils de sécurité routière
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {safetyTips.map((tip, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 text-center shadow-card border border-[#4057aa]/10">
                <div className="w-16 h-16 bg-[#E8EBF5] rounded-full flex items-center justify-center mx-auto mb-4">
                  <tip.icon className="h-8 w-8 text-[#4057aa]" />
                </div>
                <h3 className="font-bold text-primary mb-2">{tip.title}</h3>
                <p className="text-sm text-gray-400">{tip.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Articles */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3 mb-12">
            <BookOpen className="h-7 w-7 text-[#4057aa]" />
            <h2 className="text-2xl md:text-3xl font-bold text-primary text-center">
              Actualités & Articles
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((article, idx) => (
              <a
                key={idx}
                href={article.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white rounded-2xl border-2 border-[#4057aa]/10 p-6 shadow-card transition-all hover:shadow-elevated hover:border-[#4057aa]/30 flex flex-col"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-[#4057aa] bg-[#E8EBF5] px-3 py-1 rounded-full">
                    {article.date}
                  </span>
                  <ExternalLink className="h-4 w-4 text-gray-300 group-hover:text-[#4057aa] transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-primary mb-2 group-hover:text-[#4057aa] transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-400 flex-1">{article.description}</p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#4057aa] mt-4 group-hover:gap-2 transition-all">
                  Lire l&apos;article
                  <ExternalLink className="h-3 w-3" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Videos */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3 mb-12">
            <Play className="h-7 w-7 text-[#4057aa]" />
            <h2 className="text-2xl md:text-3xl font-bold text-primary text-center">
              Vidéos de sensibilisation
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {videos.map((video, idx) => (
              <div
                key={idx}
                className="group bg-white rounded-xl overflow-hidden shadow-card border border-[#4057aa]/10"
              >
                <div className="relative aspect-video bg-[#E8EBF5] flex items-center justify-center">
                  {video.youtubeId.startsWith('PLACEHOLDER') ? (
                    <div className="text-center p-4">
                      <Play className="h-12 w-12 text-[#4057aa]/30 mx-auto mb-2" />
                      <p className="text-sm text-[#4057aa]/50 font-medium">Vidéo à venir</p>
                    </div>
                  ) : (
                    <iframe
                      src={`https://www.youtube.com/embed/${video.youtubeId}`}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-primary mb-1">
                    {video.title}
                  </h3>
                  <p className="text-xs text-gray-400">{video.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <a
              href="https://www.youtube.com/@NARSA20"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#4057aa] font-semibold hover:underline"
            >
              Voir toutes les vidéos sur YouTube
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-[#4057aa] to-[#2e3f7a] rounded-2xl p-8 md:p-12 text-center text-white shadow-lg">
            <div className="flex justify-center mb-6">
              <div className="bg-white rounded-xl px-6 py-3">
                <Image
                  src="/narsa_logo.png"
                  alt="NARSA"
                  width={160}
                  height={48}
                  className="w-40 h-auto object-contain"
                />
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Visitez le site officiel de la NARSA
            </h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">
              Accédez à toutes les ressources de sécurité routière, le code de la route,
              et les services en ligne de la NARSA.
            </p>
            <a
              href={NARSA_WEBSITE}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#4057aa] font-bold rounded-xl transition-all duration-300 hover:bg-[#fad502] hover:text-[#2e3f7a] shadow-md text-lg"
            >
              Accéder au site NARSA
            </a>
          </div>
        </div>
      </section>

    </div>
  )
}
