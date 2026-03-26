import type { Metadata } from 'next'
import Image from 'next/image'
import { AtSign, PhoneCall, Camera } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Qui Sommes-Nous | Tomobile 360',
  description:
    "Découvrez l'équipe de passionnés derrière Tomobile 360, la plateforme de référence pour l'automobile au Maroc.",
}

// ── Data ────────────────────────────────────────────────────────────────────

const stats = [
  { value: '20+', label: "Ans d'expérience" },
  { value: '4',   label: 'Journalistes' },
  { value: '1K+', label: 'Articles publiés' },
]

const team = [
  {
    initials: 'RK',
    gradientFrom: '#006EFE',
    gradientTo: '#60a5fa',
    accentColor: '#006EFE',
    badgeBg: '#eff6ff',
    name: 'Rafik Kamal Lahlou',
    role: 'Fondateur & Directeur de rédaction',
    email: 'rafiklahlou@gmail.com',
    phone: '+212 661 335 343',
    bio: "Véritable touche-à-tout, Rafik Lahlou est avant tout un fervent passionné de l'automobile depuis tout jeune. Il fut le premier à créer un site web consacré à l'automobile au Maroc (tomobile.net) en 2000. Directeur de rédaction des publications Challenge, VH Magazine et Lalla Fatima, il dirige conjointement avec Abdelmajid Alaoui l'atelier RM Automobiles Classiques. Vice-président de la Fédération Marocaine des Véhicules Anciens et du Royal Automobile Club Marocain.",
    socials: [
      { label: 'Instagram', icon: 'ig' },
      { label: 'Facebook', icon: 'fb' },
    ],
  },
  {
    initials: 'DJ',
    gradientFrom: '#32B75C',
    gradientTo: '#6ee7a0',
    accentColor: '#32B75C',
    badgeBg: '#f0fdf4',
    name: 'David Jérémie',
    role: 'Journaliste Automobile',
    email: 'davidolivierjeremie@gmail.com',
    phone: '+212 619 031 813',
    bio: "David Jérémie a évolué dès l'entame de sa carrière en 1994 en Martinique dans l'automobile, le journalisme et la radio. C'est en 2002 qu'il intègre la presse marocaine, s'étant fait une spécialité dans le secteur de l'automobile sous toutes ses formes, du deux-roues et des sports mécaniques.",
    socials: [
      { label: 'Instagram', icon: 'ig' },
      { label: 'Facebook', icon: 'fb' },
    ],
  },
  {
    initials: 'AB',
    gradientFrom: '#1a2566',
    gradientTo: '#3b5bdb',
    accentColor: '#1a2566',
    badgeBg: '#eef2ff',
    name: 'Amine Bouharaoui',
    role: 'Journaliste Spécialisé',
    email: 'aminebouharaoui@gmail.com',
    phone: '+212 607 664 459',
    bio: "Amine Bouharaoui est un passionné de l'automobile, tant des véhicules actuels que des véhicules anciens, de la mécanique, des nouvelles technologies liées à la mobilité électrique et du sport automobile. Ses connaissances techniques et son ressenti au volant lui permettent de se faire une idée précise sur tout type de véhicules.",
    socials: [
      { label: 'Instagram', icon: 'ig' },
      { label: 'LinkedIn', icon: 'li' },
      { label: 'Facebook', icon: 'fb' },
    ],
  },
  {
    initials: 'NB',
    gradientFrom: '#c2410c',
    gradientTo: '#fb923c',
    accentColor: '#c2410c',
    badgeBg: '#fff7ed',
    name: 'Nabil Bennani (NAB)',
    role: 'Humoriste & Animateur',
    email: 'nabnabilbennani@gmail.com',
    phone: '+212 666 16 60 72',
    bio: "NAB est un humoriste, animateur et voix-off marocain reconnu. Il observe avec humour les contradictions du quotidien moderne, créant une proximité naturelle avec un public large. Il anime une émission sur Radio MFM et collabore avec VH Magazine et Tomobile360, apportant son regard singulier sur l'univers automobile.",
    socials: [
      { label: 'Instagram', icon: 'ig' },
      { label: 'Facebook', icon: 'fb' },
    ],
  },
]

const values = [
  { iconBg: '#eff6ff', iconColor: '#006EFE', title: 'Expertise terrain', desc: "Nos journalistes couvrent les événements automobiles directement sur le terrain, au Maroc et à l'international.", icon: 'terrain' },
  { iconBg: '#f0fdf4', iconColor: '#32B75C', title: 'Journalisme indépendant', desc: 'Une ligne éditoriale libre et indépendante, au service des lecteurs et non des constructeurs.', icon: 'press' },
  { iconBg: '#fff7ed', iconColor: '#c2410c', title: 'Passion authentique', desc: 'Vingt ans de passion automobile transmis à travers chaque article, vidéo et essai publié.', icon: 'passion' },
]

// ── Social Icons ─────────────────────────────────────────────────────────────

function InstagramIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="20" height="20" rx="6" stroke="currentColor" strokeWidth="1.8"/>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
    </svg>
  )
}

function FacebookIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 3H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h8.6v-7h-2.3v-2.7h2.3v-2c0-2.3 1.4-3.5 3.4-3.5.7 0 1.4 0 2.1.1V9h-1.5c-1.1 0-1.3.5-1.3 1.3v1.7H19l-.4 2.7h-2.3V21H20a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1z"/>
    </svg>
  )
}

function LinkedInIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zm-9 6H7v9h3V9zm5.5-.25a2.88 2.88 0 0 0-2.59 1.44L13 9.75V9h-3v9h3v-4.5c0-1.38.56-2.25 1.75-2.25 1.14 0 1.75.87 1.75 2.25V18h3v-4.75c0-2.63-1.27-4.5-3.5-4.5zM8.5 6a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
    </svg>
  )
}

// ── Value Icons ───────────────────────────────────────────────────────────────

function TerrainIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17l4-8 4 5 3-3 4 6"/>
      <path d="M21 21H3"/>
    </svg>
  )
}

function PressIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
      <path d="M18 14h-8M15 18h-5M10 6h8v4h-8z"/>
    </svg>
  )
}

function PassionIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
    </svg>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function QuiSommesNousPage() {
  // Single consistent side padding across all sections — px-5 lg:px-10
  const pad = 'px-6 md:px-10 lg:px-14'

  return (
    <div className="bg-white font-sans overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className={`${pad} pt-6 pb-10`}>
        <div className="grid lg:grid-cols-[55%_45%] rounded-3xl overflow-hidden min-h-[calc(100vh-100px)] border border-gray-100 shadow-card">

          {/* Left — photo */}
          <div className="relative min-h-[320px] overflow-hidden">
            <Image
              src="/clean_image.png"
              alt="Équipe Tomobile360"
              fill
              className="object-cover object-top"
              priority
            />
          </div>

          {/* Right — text */}
          <div className="flex flex-col justify-center px-10 lg:px-14 py-14 bg-white">
            <div className="flex items-center gap-2.5 mb-6">
              <span className="h-px w-6 bg-[#006EFE]" />
              <span className="text-[11px] font-bold uppercase tracking-[2.5px] text-[#006EFE]">Notre équipe</span>
            </div>

            <h1
              className="text-[clamp(38px,4.5vw,60px)] font-black leading-[1] tracking-tight text-[#1e3a8a] mb-5"
              style={{ fontFamily: 'var(--font-montserrat-alternates, var(--font-sora))' }}
            >
              L&apos;histoire<br />
              <span className="text-[#006EFE]">d&apos;une passion</span>
            </h1>

            <p className="text-[15px] font-light text-gray-400 leading-relaxed max-w-xs mb-10">
              Depuis plus de 20 ans, Tomobile360 couvre l&apos;actualité automobile au Maroc avec passion, rigueur et indépendance.
            </p>

            <div className="border-t border-gray-100 pt-8 flex gap-8">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="text-3xl font-black text-[#006EFE] leading-none tabular-nums">{s.value}</p>
                  <p className="text-[11px] font-medium text-gray-400 mt-1.5 uppercase tracking-wide">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── MISSION STRIP ────────────────────────────────────────────── */}
      <section className={`${pad} pb-10`}>
        <div className="rounded-2xl bg-gradient-to-r from-[#f0f6ff] via-white to-[#f0fdf8] border border-gray-100 py-10 px-10 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-[#006EFE]/10 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#006EFE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3m4 0h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2z"/>
            </svg>
          </div>
          <p className="text-lg font-light text-gray-500 leading-relaxed flex-1">
            &ldquo;Couvrir l&apos;automobile au Maroc, c&apos;est raconter une culture,
            une <span className="font-semibold text-[#32B75C]">passion</span> et une{' '}
            <span className="font-semibold text-[#006EFE]">ambition</span> nationale.&rdquo;
          </p>
          <span className="flex-shrink-0 text-[11px] uppercase tracking-[2px] text-gray-300 whitespace-nowrap">
            Depuis 2000
          </span>
        </div>
      </section>

      {/* ── TEAM SECTION ─────────────────────────────────────────────── */}
      <section className={`${pad} pb-10`}>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <span className="h-px w-6 bg-[#006EFE]" />
              <span className="text-[11px] font-bold uppercase tracking-[2.5px] text-[#006EFE]">Notre équipe</span>
            </div>
            <h2
              className="text-2xl lg:text-3xl font-black text-[#1e3a8a] tracking-tight"
              style={{ fontFamily: 'var(--font-montserrat-alternates, var(--font-sora))' }}
            >
              Team{' '}
              <span className="text-[#006EFE]">Tomobile360</span>
            </h2>
          </div>
          <p className="sm:text-right text-sm font-light text-gray-400 sm:max-w-[220px] leading-relaxed">
            Passionnés au service de l&apos;information automobile marocaine.
          </p>
        </div>

        {/* Cards grid — no max-w cap, fills full padded width */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {team.map((member) => (
            <div
              key={member.name}
              className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-card hover:shadow-elevated hover:-translate-y-1 transition-all duration-500 ease-out"
            >
              {/* ── Photo / Banner area */}
              <div
                className="relative h-52 flex flex-col items-center justify-center overflow-hidden"
                style={{ background: `linear-gradient(145deg, ${member.gradientFrom} 0%, ${member.gradientTo} 100%)` }}
              >
                {/* Subtle mesh dots overlay */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  }}
                />

                {/* Large decorative ring */}
                <div className="absolute -bottom-14 -right-14 w-52 h-52 rounded-full border border-white/15" />
                <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full border border-white/10" />

                {/* Avatar */}
                <div
                  className="relative z-10 w-24 h-24 rounded-full flex items-center justify-center text-white font-black text-2xl tracking-wide shadow-xl"
                  style={{
                    background: 'rgba(255,255,255,0.18)',
                    border: '2px solid rgba(255,255,255,0.4)',
                    backdropFilter: 'blur(8px)',
                    fontFamily: 'var(--font-montserrat-alternates, var(--font-sora))',
                  }}
                >
                  {member.initials}
                </div>

                {/* Photo coming pill */}
                <div className="absolute bottom-3.5 right-3.5 flex items-center gap-1.5 bg-black/20 backdrop-blur-md rounded-full px-3 py-1">
                  <Camera size={10} className="text-white/70" />
                  <span className="text-[10px] text-white/70 font-medium tracking-wide">Photo à venir</span>
                </div>
              </div>

              {/* ── Content */}
              <div className="p-6">

                {/* Name + role */}
                <div className="mb-4">
                  <h3
                    className="text-lg font-bold text-[#1e3a8a] leading-snug mb-2"
                    style={{ fontFamily: 'var(--font-montserrat-alternates, var(--font-sora))' }}
                  >
                    {member.name}
                  </h3>
                  <span
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full"
                    style={{ color: member.accentColor, background: member.badgeBg }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: member.accentColor }}
                    />
                    {member.role}
                  </span>
                </div>

                {/* Bio */}
                <p className="text-sm font-light text-gray-400 leading-relaxed line-clamp-4 mb-5">
                  {member.bio}
                </p>

                {/* Footer */}
                <div className="border-t border-gray-100 pt-4 flex items-center justify-between gap-4">

                  {/* Contact */}
                  <div className="flex flex-col gap-1 min-w-0">
                    <a
                      href={`mailto:${member.email}`}
                      className="flex items-center gap-2 text-[12px] text-gray-400 hover:text-[#006EFE] transition-colors duration-300 group/link truncate"
                    >
                      <AtSign size={12} className="flex-shrink-0 text-gray-300 group-hover/link:text-[#006EFE] transition-colors duration-300" />
                      <span className="truncate">{member.email}</span>
                    </a>
                    <a
                      href={`tel:${member.phone.replace(/\s/g, '')}`}
                      className="flex items-center gap-2 text-[12px] text-gray-400 hover:text-[#006EFE] transition-colors duration-300 group/link"
                    >
                      <PhoneCall size={12} className="flex-shrink-0 text-gray-300 group-hover/link:text-[#006EFE] transition-colors duration-300" />
                      {member.phone}
                    </a>
                  </div>

                  {/* Social icons */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {member.socials.map((s) => (
                      <button
                        key={s.label}
                        title={s.label}
                        className="w-8 h-8 rounded-xl border border-gray-100 flex items-center justify-center text-gray-300 hover:text-[#006EFE] hover:border-[#006EFE]/20 hover:bg-[#006EFE]/5 hover:scale-110 transition-all duration-300"
                      >
                        {s.icon === 'ig' && <InstagramIcon size={14} />}
                        {s.icon === 'fb' && <FacebookIcon size={14} />}
                        {s.icon === 'li' && <LinkedInIcon size={14} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── VALUES SECTION ───────────────────────────────────────────── */}
      <section className={`${pad} pb-10`}>
        <div className="rounded-2xl bg-[#f8f9ff] border border-gray-100 py-12 px-8 lg:px-12">
          <p className="text-center text-[11px] font-bold uppercase tracking-[2.5px] text-gray-400 mb-10">
            POURQUOI NOUS CHOISIR
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {values.map((v) => (
              <div
                key={v.title}
                className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-500 ease-out"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: v.iconBg }}
                >
                  {v.icon === 'terrain'  && <TerrainIcon color={v.iconColor} />}
                  {v.icon === 'press'    && <PressIcon color={v.iconColor} />}
                  {v.icon === 'passion'  && <PassionIcon color={v.iconColor} />}
                </div>
                <h3 className="text-sm font-bold text-[#1e3a8a] mb-1.5">{v.title}</h3>
                <p className="text-[13px] font-light text-gray-400 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM QUOTE ─────────────────────────────────────────────── */}
      <section className={`${pad} pb-10`}>
        <div className="rounded-2xl bg-gradient-to-br from-[#006EFE]/5 via-white to-[#32B75C]/5 border border-gray-100 py-14 px-10 text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="h-px w-6 bg-[#006EFE]/30" />
            <span className="text-[10px] font-bold uppercase tracking-[2.5px] text-[#006EFE]">Notre engagement</span>
            <span className="h-px w-6 bg-[#006EFE]/30" />
          </div>
          <p
            className="text-2xl md:text-3xl font-black text-[#1e3a8a] leading-tight tracking-tight max-w-2xl mx-auto"
            style={{ fontFamily: 'var(--font-montserrat-alternates, var(--font-sora))' }}
          >
            L&apos;automobile est notre passion,{' '}
            <span className="text-[#006EFE]">le Maroc</span>{' '}
            est <span className="text-[#32B75C]">notre terrain</span>.
          </p>
          <p className="text-[11px] font-semibold uppercase tracking-[2.5px] text-gray-300 mt-7">
            — TOMOBILE360
          </p>
        </div>
      </section>

    </div>
  )
}
