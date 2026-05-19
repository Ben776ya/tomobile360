'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin, Send, ArrowRight } from 'lucide-react'
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
    <footer className="bg-dark-800 text-white relative overflow-hidden border-t border-white/10">
      {/* Subtle grid texture */}
      <div className="absolute inset-0 bg-grid pointer-events-none opacity-50" />
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-8 sm:py-12 lg:py-16 relative z-10">

        {/* Top: Brand identity (left) + Magazine Banner (center) + Newsletter (right) */}
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-8 xl:gap-10 xl:items-center mb-10 sm:mb-12 lg:mb-14">

          {/* Brand Identity Block */}
          <div>
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/logo_tomobile360.png"
                alt="Tomobile 360"
                width={140}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-dark-300 text-sm mb-6 leading-relaxed">
              Tomobile 360 est votre guide d&apos;achat automobile au Maroc — prix, fiches techniques, comparatifs et essais de voitures neuves.
            </p>
            {/* Contact Info */}
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-dark-300">
                <MapPin className="h-4 w-4 text-secondary flex-shrink-0 mt-0.5" />
                <span>{BUSINESS_INFO.ADDRESS_FULL}</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-dark-300">
                <Phone className="h-4 w-4 text-secondary flex-shrink-0" />
                <a href={`tel:${BUSINESS_INFO.PHONE_TEL}`} className="hover:text-secondary transition-colors">
                  {BUSINESS_INFO.PHONE_DISPLAY}
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-dark-300">
                <Mail className="h-4 w-4 text-secondary flex-shrink-0" />
                <a href={`mailto:${BUSINESS_INFO.EMAIL}`} className="hover:text-secondary transition-colors">
                  {BUSINESS_INFO.EMAIL}
                </a>
              </li>
            </ul>
            {/* Social Icons */}
            <div className="flex gap-2 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-300"
                  style={{ backgroundColor: social.color }}
                  aria-label={social.label}
                  title={social.label}
                >
                  {social.icon ? (
                    <social.icon className="h-4 w-4" />
                  ) : (
                    social.customIcon
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* Magazine Banner (center) */}
          <Link
            href="/qui-sommes-nous"
            aria-label="Découvrir l'équipe Tomobile 360 Magazine"
            className="group block relative max-w-2xl mx-auto overflow-hidden rounded-xl border border-white/10 shadow-elevated hover:shadow-glow-cyan-lg transition-all duration-500 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-dark-800"
          >
            <Image
              src="/footer_banner.jpg"
              alt=""
              width={1006}
              height={282}
              sizes="(max-width: 640px) 100vw, 672px"
              className="w-full h-auto block transition-transform duration-700 group-hover:scale-[1.02]"
              priority={false}
            />
            {/* Soft edge gradient so the banner blends into the dark footer */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-dark-800/30 via-transparent to-dark-800/30" />
            {/* Hover CTA chip (bottom-right) */}
            <div className="pointer-events-none absolute bottom-3 right-3 sm:bottom-4 sm:right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/95 text-white text-xs sm:text-sm font-semibold shadow-lg backdrop-blur-sm opacity-100 translate-y-0 sm:opacity-0 sm:group-hover:opacity-100 sm:translate-y-1 sm:group-hover:translate-y-0 transition-all duration-300">
              <span>Qui sommes-nous</span>
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </Link>

          {/* Newsletter Block */}
          <div className="w-full">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-5 text-white font-display">
              Newsletter
            </h3>
            <p className="text-sm text-dark-300 mb-4">
              Inscrivez-vous pour recevoir nos offres et actualités.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre email"
                  className="w-full px-4 py-3 pr-12 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 text-sm disabled:opacity-50"
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-secondary text-white hover:bg-secondary-600 hover:scale-110 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  aria-label="Subscribe"
                >
                  {isSubmitting ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </div>
              {message && (
                <div className={`text-xs px-3 py-2 rounded-lg ${
                  message.type === 'success'
                    ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}>
                  {message.text}
                </div>
              )}
            </form>
            <p className="text-[11px] sm:text-xs text-dark-400 mt-3">
              En vous inscrivant, vous acceptez notre{' '}
              <Link href="/confidentialite" className="text-secondary hover:text-secondary-600 hover:underline transition-all duration-300">
                politique de confidentialité
              </Link>
              .
            </p>

            {/* CTA Button */}
            <a
              href={EXTERNAL_LINKS.SELL_CAR}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center justify-center w-full px-6 py-3 bg-secondary hover:bg-secondary-600 text-white font-semibold rounded-xl transition-all duration-300"
            >
              Déposer votre annonce
            </a>
          </div>
        </div>

        {/* Bottom: Navigation Links (Neuf | Occasion | Services) — aligned under banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-2xl mx-auto">

          {/* Neuf */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-5 text-white font-display">
              Neuf
            </h3>
            <ul className="space-y-3">
              {neufLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-dark-300 hover:text-secondary hover:translate-x-1 inline-block transition-all duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Occasion */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-5 text-white font-display">
              Occasion
            </h3>
            <ul className="space-y-3">
              {occasionLinks.map((link) => (
                <li key={link.href}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-dark-300 hover:text-secondary hover:translate-x-1 inline-block transition-all duration-300"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-dark-300 hover:text-secondary hover:translate-x-1 inline-block transition-all duration-300"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-5 text-white font-display">
              Services
            </h3>
            <ul className="space-y-3">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-dark-300 hover:text-secondary hover:translate-x-1 inline-block transition-all duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5 relative z-10">
        <div className="container mx-auto px-4 py-5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-dark-400">
              © {currentYear} Tomobile 360. Tous droits réservés.
            </p>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              <Link href="/qui-sommes-nous" className="text-sm text-dark-400 hover:text-secondary hover:underline transition-all duration-300">
                Qui Sommes-Nous
              </Link>
              <Link href="/mentions-legales" className="text-sm text-dark-400 hover:text-secondary hover:underline transition-all duration-300">
                Mentions Légales
              </Link>
              <Link href="/confidentialite" className="text-sm text-dark-400 hover:text-secondary hover:underline transition-all duration-300">
                Confidentialité
              </Link>
              <Link href="/conditions" className="text-sm text-dark-400 hover:text-secondary hover:underline transition-all duration-300">
                Conditions d&apos;utilisation
              </Link>
              <Link href="/cookies" className="text-sm text-dark-400 hover:text-secondary hover:underline transition-all duration-300">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
