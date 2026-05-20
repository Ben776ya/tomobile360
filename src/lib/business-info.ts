// Single source of truth for Tomobile 360 business identity.
// Values marked USER_REQUIRED are read from env vars at build time.
// Set them in .env.local for dev / Vercel project settings for production.

function required(name: string, fallback?: string): string {
  const v = process.env[name]
  if (v && v.trim().length > 0) return v
  if (fallback !== undefined) return fallback
  // In production builds, surface the missing value loudly.
  // In dev, return a clearly-tagged sentinel so it shows up at runtime.
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`Missing required env var: ${name}`)
  }
  return `__MISSING_${name}__`
}

export const BUSINESS_INFO = {
  EMAIL: 'contact@tomobile360.ma',
  EMAIL_PRIVACY: 'privacy@tomobile360.ma',
  PHONE_DISPLAY: '+212 522 54 81 50 à 52',
  PHONE_TEL: '+212522548150',

  // USER_REQUIRED — real WhatsApp number, set via env
  WHATSAPP_DISPLAY: required('NEXT_PUBLIC_WHATSAPP_DISPLAY', '+212 522 54 81 50'),
  WHATSAPP_E164: required('NEXT_PUBLIC_WHATSAPP_E164', '212522548150'),

  ADDRESS_SHORT: 'Quartier El Manar, Casablanca',
  ADDRESS_FULL: '2, Rue Mohamed Laghzaoui, Quartier El Manar, Casablanca 20370, Maroc',
  CITY: 'Casablanca',
  COUNTRY: 'Maroc',

  HOURS_WEEKDAY: 'Lun - Ven: 9h00 - 18h00',
  HOURS_SATURDAY: 'Sam: 9h00 - 13h00',

  COMPANY_LEGAL_NAME: 'Tomobile 360 SARL',

  // USER_REQUIRED — Moroccan legal identifiers
  RC_NUMBER: required('NEXT_PUBLIC_RC_NUMBER'),
  ICE_NUMBER: required('NEXT_PUBLIC_ICE_NUMBER'),
  DIRECTOR_NAME: required('NEXT_PUBLIC_DIRECTOR_NAME'),

  // USER_REQUIRED — Capital social, only printed if set
  CAPITAL_SOCIAL: process.env.NEXT_PUBLIC_CAPITAL_SOCIAL || '',

  // USER_REQUIRED — CNDP declaration number, only printed if set
  CNDP_DECLARATION: process.env.NEXT_PUBLIC_CNDP_DECLARATION || '',
} as const

export function whatsappLink(message: string, phone: string = BUSINESS_INFO.WHATSAPP_E164): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}

export function telLink(phone: string = BUSINESS_INFO.PHONE_TEL): string {
  return `tel:${phone}`
}

export function mailLink(email: string = BUSINESS_INFO.EMAIL, subject?: string): string {
  const base = `mailto:${email}`
  return subject ? `${base}?subject=${encodeURIComponent(subject)}` : base
}
