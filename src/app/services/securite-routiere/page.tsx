import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Play } from 'lucide-react'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'
import { NarsaVideoPlayer } from '@/components/narsa/NarsaVideoPlayer'

const NARSA_WEBSITE = 'https://www.narsa.ma/fr'
const SITE_URL = 'https://tomobile360.ma'
const SUPABASE_STORAGE_URL = 'https://atbkdxmxuqorebrttzma.supabase.co/storage/v1/object/public/narsa-videos'

const capsuleVideos = [
  {
    id: 1,
    title: 'La sécurité des piétons',
    description: 'Capsule de sensibilisation sur les bonnes pratiques pour protéger les piétons sur la route.',
    src: `${SUPABASE_STORAGE_URL}/capsule-1-pietons.mp4`,
  },
  {
    id: 2,
    title: 'La sécurité des motocyclistes',
    description: 'Les règles essentielles pour une conduite sécurisée à moto et la cohabitation avec les autres usagers.',
    src: `${SUPABASE_STORAGE_URL}/capsule-2-motos.mp4`,
  },
  {
    id: 10,
    title: 'La conduite responsable des taxis',
    description: 'Sensibilisation des chauffeurs de taxi aux bonnes pratiques de conduite et de sécurité.',
    src: `${SUPABASE_STORAGE_URL}/capsule-10-taxis.mp4`,
  },
  {
    id: 11,
    title: 'La distance de sécurité',
    description: 'L\'importance de maintenir une distance de sécurité suffisante pour éviter les collisions.',
    src: `${SUPABASE_STORAGE_URL}/capsule-11-distance-securite.mp4`,
  },
  {
    id: 12,
    title: 'Le respect des couloirs de circulation',
    description: 'Les règles de circulation dans les couloirs et voies réservées.',
    src: `${SUPABASE_STORAGE_URL}/capsule-12-couloirs.mp4`,
  },
  {
    id: 13,
    title: 'Le partage de la route avec les cyclistes',
    description: 'Comment cohabiter en toute sécurité avec les cyclistes sur la piste cyclable et la chaussée.',
    src: `${SUPABASE_STORAGE_URL}/capsule-13-piste-cyclable.mp4`,
  },
  {
    id: 14,
    title: 'Les panneaux de signalisation',
    description: 'Comprendre et respecter les panneaux de signalisation pour une conduite plus sûre.',
    src: `${SUPABASE_STORAGE_URL}/capsule-14-panneaux-signalisation.mp4`,
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

function VideoListJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Capsules de sensibilisation — Sécurité Routière au Maroc',
    description: 'Série de capsules vidéo de sensibilisation à la sécurité routière, produites en partenariat avec la NARSA et MFM Radio.',
    numberOfItems: capsuleVideos.length,
    itemListElement: capsuleVideos.map((video, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'VideoObject',
        name: video.title,
        description: video.description,
        contentUrl: video.src,
        thumbnailUrl: `${SITE_URL}/narsa_logo.png`,
        uploadDate: '2021-07-01',
        publisher: [
          {
            '@type': 'Organization',
            name: 'NARSA — Agence Nationale de la Sécurité Routière',
            url: 'https://www.narsa.ma',
          },
          {
            '@type': 'RadioStation',
            name: 'MFM Radio',
            url: 'https://www.mfmradio.ma',
          },
        ],
        inLanguage: 'fr',
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

export default function SecuriteRoutierePage() {
  return (
    <div className="min-h-screen bg-background">
      <VideoListJsonLd />
      <div className="container mx-auto px-4 pt-6">
        <Breadcrumbs items={[
          { name: 'Services', href: '/services' },
          { name: 'Sécurité Routière' },
        ]} />
      </div>

      {/* Hero — NARSA × MFM Radio collaboration */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#2e3f7a] via-[#3a4d99] to-[#4057aa] py-16 md:py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]"
        />
        <div className="container relative mx-auto px-4">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux services
          </Link>

          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/80 ring-1 ring-white/20">
              Une collaboration
            </span>

            <div className="mt-5 flex items-center justify-center gap-4 sm:gap-6">
              <div className="flex h-16 w-40 sm:h-20 sm:w-48 items-center justify-center rounded-xl bg-white shadow-md">
                <Image
                  src="/narsa_logo.png"
                  alt="NARSA"
                  width={200}
                  height={60}
                  className="max-h-14 sm:max-h-[58px] w-auto object-contain"
                />
              </div>
              <span aria-hidden className="text-2xl sm:text-3xl font-light text-white/60">
                ×
              </span>
              <div className="flex h-16 w-40 sm:h-20 sm:w-48 items-center justify-center rounded-xl bg-white shadow-md">
                <Image
                  src="/mfm_radio_logo.webp"
                  alt="MFM Radio"
                  width={100}
                  height={100}
                  className="max-h-16 sm:max-h-20 w-auto object-contain"
                />
              </div>
            </div>

            <h1 className="mt-8 text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
              Capsules de sensibilisation à la sécurité routière
            </h1>
            <p className="mt-4 text-base md:text-lg text-white/85 max-w-2xl mx-auto">
              Une série produite en partenariat avec la <span className="font-semibold text-white">NARSA</span>
              {' '}et <span className="font-semibold text-white">MFM Radio</span> pour informer les usagers
              de la route au Maroc et promouvoir des comportements plus sûrs.
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

      {/* Videos */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3 mb-12">
            <Play className="h-7 w-7 text-[#4057aa]" />
            <h2 className="text-2xl md:text-3xl font-bold text-primary text-center">
              Capsules de sensibilisation — Sécurité Routière
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capsuleVideos.map((video) => (
              <article
                key={video.id}
                className="bg-white rounded-xl overflow-hidden shadow-card border border-[#4057aa]/10"
              >
                <NarsaVideoPlayer src={video.src} title={video.title} />
                <div className="p-4">
                  <span className="text-xs font-semibold text-[#4057aa] bg-[#E8EBF5] px-2 py-0.5 rounded-full">
                    Capsule {video.id}
                  </span>
                  <h3 className="font-bold text-primary mt-2 mb-1">
                    {video.title}
                  </h3>
                  <p className="text-xs text-gray-400">{video.description}</p>
                </div>
              </article>
            ))}
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
