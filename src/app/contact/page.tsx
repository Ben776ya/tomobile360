'use client'

import { useState, useEffect } from 'react'
import { Mail, Phone, MapPin, Send, Clock, MessageCircle, AlertCircle } from 'lucide-react'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'
import { submitContactMessage } from '@/lib/actions/contact'
import { BUSINESS_INFO, whatsappLink } from '@/lib/business-info'
import { gaEvents } from '@/lib/analytics/gtag'

interface FormErrors {
  name?: string
  email?: string
  phone?: string
  subject?: string
  message?: string
}

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sub = params.get('subject')
    const topic = params.get('topic')
    const allowedSubjects = ['info', 'vehicle', 'service', 'partnership', 'other'] as const
    if (sub && (allowedSubjects as readonly string[]).includes(sub)) {
      const prefilledMessage = topic ? `Sujet : ${topic}\n\n` : ''
      setFormData((prev) => ({ ...prev, subject: sub, message: prefilledMessage }))
    }
  }, [])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Le nom doit contenir au moins 2 caractères'
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis'
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Veuillez entrer un email valide'
    }

    // Phone validation (optional but must be valid if provided)
    if (formData.phone.trim()) {
      const phoneRegex = /^(\+212|0)[5-7]\d{8}$/
      if (!phoneRegex.test(formData.phone.replace(/\s|-/g, ''))) {
        newErrors.phone = 'Numéro de téléphone invalide (format: +212 6XX XXX XXX)'
      }
    }

    // Subject validation
    if (!formData.subject) {
      newErrors.subject = 'Veuillez sélectionner un sujet'
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'Le message est requis'
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Le message doit contenir au moins 10 caractères'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value })
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    const result = await submitContactMessage({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || undefined,
      subject: formData.subject,
      message: formData.message.trim(),
    })
    setIsSubmitting(false)

    if ('error' in result && result.error) {
      setErrors({ message: result.error })
      return
    }

    setSubmitted(true)
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
    setErrors({})
  }

  const InputError = ({ error }: { error?: string }) => {
    if (!error) return null
    return (
      <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
        <AlertCircle className="h-3.5 w-3.5" />
        {error}
      </p>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 pt-6">
        <Breadcrumbs items={[{ name: 'Contact' }]} />
      </div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 via-white to-gray-50 py-10 sm:py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-700 mb-4">
            Contactez-nous
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Notre équipe est à votre disposition pour répondre à toutes vos questions
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-slate-700 mb-6">Nos Coordonnées</h2>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Adresse</p>
                      <p className="text-sm text-gray-500">
                        {BUSINESS_INFO.ADDRESS_SHORT}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Téléphone</p>
                      <a
                        href={`tel:${BUSINESS_INFO.PHONE_TEL}`}
                        className="text-sm text-gray-500 hover:text-secondary transition-colors"
                      >
                        {BUSINESS_INFO.PHONE_DISPLAY}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Email</p>
                      <a
                        href={`mailto:${BUSINESS_INFO.EMAIL}`}
                        className="text-sm text-gray-500 hover:text-secondary transition-colors"
                      >
                        {BUSINESS_INFO.EMAIL}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Horaires</p>
                      <p className="text-sm text-gray-500">
                        {BUSINESS_INFO.HOURS_WEEKDAY}<br />
                        {BUSINESS_INFO.HOURS_SATURDAY}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <MessageCircle className="h-6 w-6 text-secondary" />
                  <h3 className="font-bold text-slate-700">Chat en ligne</h3>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Besoin d&apos;une réponse rapide ? Chattez avec notre équipe en direct.
                </p>
                <a
                  href={whatsappLink('Bonjour Tomobile 360, j\'aimerais discuter avec votre équipe.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => gaEvents.whatsappClick({ context: 'contact' })}
                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-secondary text-white rounded-lg font-semibold hover:bg-secondary-400 transition-colors"
                >
                  Démarrer le chat
                </a>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-8 shadow-card border border-gray-100">
                <h2 className="text-xl font-bold text-slate-700 mb-6">Envoyez-nous un message</h2>

                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send className="h-8 w-8 text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-700 mb-2">Message envoyé !</h3>
                    <p className="text-gray-600 mb-6">
                      Nous vous répondrons dans les plus brefs délais.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="text-secondary font-semibold hover:underline"
                    >
                      Envoyer un autre message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nom complet *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleChange('name', e.target.value)}
                          className={`w-full px-4 py-3 bg-white text-gray-900 border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-transparent transition-all placeholder-gray-400 ${
                            errors.name ? 'border-red-500' : 'border-gray-200'
                          }`}
                          placeholder="Votre nom"
                        />
                        <InputError error={errors.name} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          className={`w-full px-4 py-3 bg-white text-gray-900 border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-transparent transition-all placeholder-gray-400 ${
                            errors.email ? 'border-red-500' : 'border-gray-200'
                          }`}
                          placeholder="votre@email.com"
                        />
                        <InputError error={errors.email} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Téléphone
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleChange('phone', e.target.value)}
                          className={`w-full px-4 py-3 bg-white text-gray-900 border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-transparent transition-all placeholder-gray-400 ${
                            errors.phone ? 'border-red-500' : 'border-gray-200'
                          }`}
                          placeholder="+212 6XX-XXXXXX"
                        />
                        <InputError error={errors.phone} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sujet *
                        </label>
                        <select
                          value={formData.subject}
                          onChange={(e) => handleChange('subject', e.target.value)}
                          className={`w-full px-4 py-3 bg-white text-gray-900 border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-transparent transition-all ${
                            errors.subject ? 'border-red-500' : 'border-gray-200'
                          }`}
                        >
                          <option value="">Sélectionnez un sujet</option>
                          <option value="info">Demande d&apos;information</option>
                          <option value="vehicle">Question sur un véhicule</option>
                          <option value="service">Services (crédit, assurance...)</option>
                          <option value="partnership">Partenariat</option>
                          <option value="other">Autre</option>
                        </select>
                        <InputError error={errors.subject} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message *
                      </label>
                      <textarea
                        rows={5}
                        value={formData.message}
                        onChange={(e) => handleChange('message', e.target.value)}
                        className={`w-full px-4 py-3 bg-white text-gray-900 border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-transparent transition-all resize-none placeholder-gray-400 ${
                          errors.message ? 'border-red-500' : 'border-gray-200'
                        }`}
                        placeholder="Votre message..."
                      />
                      <InputError error={errors.message} />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full md:w-auto px-8 py-3 bg-secondary hover:bg-secondary-400 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5" />
                          Envoyer le message
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
