'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin, Send, Plus } from 'lucide-react'
import { subscribeNewsletter } from '@/lib/actions/newsletter'
import { EXTERNAL_LINKS } from '@/lib/links'
import { BUSINESS_INFO } from '@/lib/business-info'

const socialLinks = [
  {
    href: EXTERNAL_LINKS.FACEBOOK,
    label: 'Facebook',
    color: '#1877F2',
    icon: Facebook,
  },
  {
    href: EXTERNAL_LINKS.YOUTUBE,
    label: 'YouTube',
    color: '#FF0000',
    icon: Youtube,
  },
  {
    href: EXTERNAL_LINKS.INSTAGRAM,
    label: 'Instagram',
    color: '#E4405F',
    icon: Instagram,
  },
  {
    href: EXTERNAL_LINKS.TIKTOK,
    label: 'TikTok',
    color: '#000000',
    customIcon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    ),
  },
]

const neufLinks = [
  { href: '/neuf', label: 'Toutes les marques' },
  { href: '/neuf?sort=price', label: 'Prix des voitures' },
  { href: '/neuf/comparer', label: 'Comparateur' },
  { href: '/neuf?type=concessionnaires', label: 'Concessionnaires' },
  { href: '/neuf/nouveautes', label: 'Nouveautés' },
  { href: '/neuf?tab=fiches', label: 'Fiches techniques' },
]

const occasionLinks = [
  { href: '/occasion', label: 'Toutes les annonces' },
  { href: EXTERNAL_LINKS.SELL_CAR, label: 'Vendre ma voiture', external: true },
  { href: '/occasion/estimation', label: 'Estimation' },
  { href: '/occasion?type=pro', label: 'Professionnels' },
]

const serviceLinks = [
  { href: '/services/credit', label: 'Crédit auto' },
  { href: '/services/assurance', label: 'Assurance' },
  { href: '/services/revision', label: 'Révision & Entretien' },
  { href: '/services/controle', label: 'Contrôle technique' },
]

const legalLinks = [
  { href: '/qui-sommes-nous', label: 'Qui Sommes-Nous' },
  { href: '/mentions-legales', label: 'Mentions Légales' },
  { href: '/confidentialite', label: 'Confidentialité' },
  { href: '/conditions', label: "Conditions d'utilisation" },
  { href: '/cookies', label: 'Cookies' },
]

function FooterPillLink({
  href,
  label,
  external,
  bulletHoverClass,
}: {
  href: string
  label: string
  external?: boolean
  bulletHoverClass: string
}) {
  const linkClass =
    'group inline-flex items-center gap-[7px] text-[13px] text-white/65 no-underline transition-all duration-150 hover:text-white hover:translate-x-0.5 focus-visible:outline-none focus-visible:text-white focus-visible:ring-1 focus-visible:ring-secondary/50 focus-visible:rounded-sm'
  const dotClass = `w-1 h-1 rounded-full bg-white/25 transition-all duration-150 ${bulletHoverClass} group-hover:scale-[1.6]`

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
        <span aria-hidden="true" className={dotClass} />
        {label}
      </a>
    )
  }

  return (
    <Link href={href} className={linkClass}>
      <span aria-hidden="true" className={dotClass} />
      {label}
    </Link>
  )
}

export default function Footer() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const currentYear = new Date().getFullYear()

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      const result = await subscribeNewsletter({ email })
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({ type: 'success', text: 'Merci pour votre inscription !' })
        setEmail('')
      }
    } catch {
      setMessage({ type: 'error', text: 'Une erreur est survenue. Reessayez plus tard.' })
    } finally {
      setIsSubmitting(false)
      setTimeout(() => setMessage(null), 5000)
    }
  }

  return (
    <footer className="relative bg-dark-800 text-white overflow-hidden border-t border-white/10 font-sans">
      {/* Decorative grid texture (masked) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          WebkitMaskImage:
            'radial-gradient(1200px 700px at 50% 30%, #000 50%, transparent 90%)',
          maskImage:
            'radial-gradient(1200px 700px at 50% 30%, #000 50%, transparent 90%)',
        }}
      />
      {/* Decorative radial blue glow (top-left) */}
      <div
        aria-hidden="true"
        className="absolute pointer-events-none z-0 rounded-full"
        style={{
          width: 680,
          height: 680,
          left: -180,
          top: -280,
          background:
            'radial-gradient(circle, rgba(0,110,254,0.22), transparent 60%)',
        }}
      />

      <div className="relative z-10 container mx-auto px-6 sm:px-10 lg:px-14 pt-9">
        {/* Top accent gradient bar */}
        <div
          aria-hidden="true"
          className="h-[3px] w-full rounded-full mb-7 opacity-70 bg-gradient-to-r from-transparent via-secondary to-transparent"
        />

        {/* ===== 1. Hero row: brand | magazine | newsletter ===== */}
        <section className="grid grid-cols-1 lg:grid-cols-[minmax(260px,1fr)_minmax(300px,1.05fr)_minmax(280px,1fr)] gap-6 items-stretch mb-[22px]">

          {/* Brand column */}
          <div className="flex flex-col">
            <Link href="/" className="inline-block mb-2">
              <Image
                src="/logo_tomobile360.png"
                alt="Tomobile 360"
                width={116}
                height={33}
                className="w-[116px] h-auto block"
              />
            </Link>
            <p className="text-xs leading-[1.5] text-white/[0.62] max-w-[38ch] mb-2.5">
              Tomobile 360 est votre guide d&apos;achat automobile au Maroc — prix, fiches techniques, comparatifs et essais de voitures neuves.
            </p>

            <ul className="list-none m-0 mb-2.5 p-0 flex flex-col gap-[5px]">
              <li className="flex gap-2 items-center text-xs text-white/[0.78] leading-[1.35]">
                <span aria-hidden="true" className="flex-shrink-0 w-5 h-5 rounded-[5px] bg-secondary/[0.16] text-secondary-400 flex items-center justify-center">
                  <MapPin className="w-2.5 h-2.5" />
                </span>
                <span>{BUSINESS_INFO.ADDRESS_FULL}</span>
              </li>
              <li className="flex gap-2 items-center text-xs text-white/[0.78] leading-[1.35]">
                <span aria-hidden="true" className="flex-shrink-0 w-5 h-5 rounded-[5px] bg-secondary/[0.16] text-secondary-400 flex items-center justify-center">
                  <Phone className="w-2.5 h-2.5" />
                </span>
                <a href={`tel:${BUSINESS_INFO.PHONE_TEL}`} className="text-inherit no-underline hover:text-white transition-colors">
                  {BUSINESS_INFO.PHONE_DISPLAY}
                </a>
              </li>
              <li className="flex gap-2 items-center text-xs text-white/[0.78] leading-[1.35]">
                <span aria-hidden="true" className="flex-shrink-0 w-5 h-5 rounded-[5px] bg-secondary/[0.16] text-secondary-400 flex items-center justify-center">
                  <Mail className="w-2.5 h-2.5" />
                </span>
                <a href={`mailto:${BUSINESS_INFO.EMAIL}`} className="text-inherit no-underline hover:text-white transition-colors">
                  {BUSINESS_INFO.EMAIL}
                </a>
              </li>
            </ul>

            <div className="flex gap-[7px] mt-auto" aria-label="Réseaux sociaux">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  title={social.label}
                  style={{ ['--social-brand' as never]: social.color }}
                  className="w-7 h-7 rounded-[7px] flex items-center justify-center bg-white/[0.06] border border-white/[0.10] text-white/85 transition-all duration-200 hover:-translate-y-0.5 hover:text-white hover:border-transparent hover:shadow-lg hover:bg-[var(--social-brand)] focus-visible:bg-[var(--social-brand)] focus-visible:text-white focus-visible:border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-dark-800"
                >
                  {social.icon ? (
                    <social.icon className="w-3 h-3" />
                  ) : (
                    <span className="w-3 h-3 flex items-center justify-center">{social.customIcon}</span>
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* Magazine banner — clickable, redirects to qui-sommes-nous */}
          <Link
            href="/qui-sommes-nous"
            aria-label="Découvrir l'équipe Tomobile 360 Magazine"
            className="group relative block rounded-lg overflow-hidden border border-white/[0.08] min-h-[150px] isolate lg:self-center transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-dark-800"
          >
            <Image
              src="/footer_banner.jpg"
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 400px"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          </Link>

          {/* Newsletter card */}
          <aside className="flex flex-col gap-2.5 p-3.5 rounded-lg border border-white/[0.08] backdrop-blur-md"
            style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))' }}
          >
            <div className="flex items-center gap-2.5">
              <span aria-hidden="true" className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center"
                style={{ boxShadow: '0 0 0 3px rgba(0,110,254,0.18)' }}
              >
                <Mail className="w-3.5 h-3.5 text-white" />
              </span>
              <h3 className="m-0 font-display font-extrabold text-[13px] uppercase tracking-[0.14em] text-white">
                Newsletter
              </h3>
            </div>

            <form
              onSubmit={handleSubscribe}
              className="flex items-stretch bg-white/[0.06] border border-white/[0.12] rounded-xl transition-all duration-200 focus-within:border-secondary"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre email"
                aria-label="Votre email"
                className="flex-1 min-w-0 bg-transparent border-0 outline-none px-3 py-[7px] text-white text-[12.5px] placeholder:text-white/40 disabled:opacity-50"
                required
                disabled={isSubmitting}
              />
              <button
                type="submit"
                disabled={isSubmitting}
                aria-label="S'inscrire"
                className="m-[3px] bg-secondary hover:bg-secondary-600 text-white rounded-md w-[30px] h-[28px] flex items-center justify-center transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-dark-800"
              >
                {isSubmitting ? (
                  <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>

            {message && (
              <div className={`text-[11px] px-2.5 py-1.5 rounded-md ${
                message.type === 'success'
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                  : 'bg-red-500/20 text-red-300 border border-red-500/30'
              }`}>
                {message.text}
              </div>
            )}

            <p className="text-[10.5px] leading-[1.4] text-white/[0.42] -mt-1 m-0">
              En vous inscrivant, vous acceptez notre{' '}
              <Link href="/confidentialite" className="text-secondary no-underline hover:underline">
                politique de confidentialité
              </Link>
              .
            </p>

            <a
              href={EXTERNAL_LINKS.SELL_CAR}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full px-3.5 py-2.5 bg-success hover:bg-success/90 text-white font-bold text-[12.5px] border-0 rounded-lg no-underline transition-all duration-200 hover:-translate-y-0.5 mt-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-dark-800"
              style={{ boxShadow: '0 5px 14px rgba(16,185,129,0.22), inset 0 -2px 0 rgba(0,0,0,0.18)' }}
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
              Déposer votre annonce
            </a>
          </aside>
        </section>

        {/* ===== 2. Link row (Neuf | Occasion | Services) ===== */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-4 border-t border-b border-white/[0.08]">
          {/* Neuf */}
          <nav aria-label="Voitures neuves">
            <h4 className="relative pb-2 mb-3 font-display font-extrabold text-xs uppercase tracking-[0.16em] text-white">
              Neuf
              <span aria-hidden="true" className="absolute left-0 bottom-0 w-6 h-0.5 rounded-sm bg-secondary" />
            </h4>
            <ul className="list-none p-0 m-0 flex flex-wrap gap-x-[18px] gap-y-1.5">
              {neufLinks.map((link) => (
                <li key={link.href}>
                  <FooterPillLink
                    href={link.href}
                    label={link.label}
                    bulletHoverClass="group-hover:bg-secondary"
                  />
                </li>
              ))}
            </ul>
          </nav>

          {/* Occasion */}
          <nav aria-label="Occasion">
            <h4 className="relative pb-2 mb-3 font-display font-extrabold text-xs uppercase tracking-[0.16em] text-white">
              Occasion
              <span aria-hidden="true" className="absolute left-0 bottom-0 w-6 h-0.5 rounded-sm bg-success" />
            </h4>
            <ul className="list-none p-0 m-0 flex flex-wrap gap-x-[18px] gap-y-1.5">
              {occasionLinks.map((link) => (
                <li key={link.href}>
                  <FooterPillLink
                    href={link.href}
                    label={link.label}
                    external={link.external}
                    bulletHoverClass="group-hover:bg-success"
                  />
                </li>
              ))}
            </ul>
          </nav>

          {/* Services */}
          <nav aria-label="Services">
            <h4 className="relative pb-2 mb-3 font-display font-extrabold text-xs uppercase tracking-[0.16em] text-white">
              Services
              <span
                aria-hidden="true"
                className="absolute left-0 bottom-0 w-6 h-0.5 rounded-sm"
                style={{ background: 'linear-gradient(90deg, #006EFE, #10B981)' }}
              />
            </h4>
            <ul className="list-none p-0 m-0 flex flex-wrap gap-x-[18px] gap-y-1.5">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <FooterPillLink
                    href={link.href}
                    label={link.label}
                    bulletHoverClass="group-hover:bg-secondary"
                  />
                </li>
              ))}
            </ul>
          </nav>
        </section>

        {/* ===== 3. Legal bar ===== */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 py-4 pb-[18px] flex-wrap">
          <span className="text-[12.5px] text-white/50 tracking-[0.02em]">
            © {currentYear} Tomobile 360. Tous droits réservés.
          </span>
          <ul className="list-none p-0 m-0 flex gap-1 flex-wrap items-center">
            {legalLinks.map((link, i) => (
              <li key={link.href} className={i === 0 ? '' : 'flex items-center gap-[14px]'}>
                {i > 0 && (
                  <span aria-hidden="true" className="w-[3px] h-[3px] rounded-full bg-white/25" />
                )}
                <Link
                  href={link.href}
                  className="text-[12.5px] text-white/55 no-underline transition-colors duration-150 hover:text-white focus-visible:outline-none focus-visible:text-white focus-visible:ring-1 focus-visible:ring-secondary/50 focus-visible:rounded-sm"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
