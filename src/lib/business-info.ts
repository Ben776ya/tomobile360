// Single source of truth for Tomobile 360 business identity.
// Values marked USER_REQUIRED are read from env vars at build time.
// Set them in .env.local for dev / Vercel project settings for production.
//
// Env vars are accessed through ENV_VARS below (static keys). This is required
// because Next.js webpack only inlines NEXT_PUBLIC_* env vars when the key is
// a literal string in source — dynamic bracket access like process.env[name]
// would not be inlined and would return undefined in client bundles.

const ENV_VARS = {
  NEXT_PUBLIC_RC_NUMBER:        process.env.NEXT_PUBLIC_RC_NUMBER,
  NEXT_PUBLIC_ICE_NUMBER:       process.env.NEXT_PUBLIC_ICE_NUMBER,
  NEXT_PUBLIC_DIRECTOR_NAME:    process.env.NEXT_PUBLIC_DIRECTOR_NAME,
  NEXT_PUBLIC_WHATSAPP_DISPLAY: process.env.NEXT_PUBLIC_WHATSAPP_DISPLAY,
  NEXT_PUBLIC_WHATSAPP_E164:    process.env.NEXT_PUBLIC_WHATSAPP_E164,
  NEXT_PUBLIC_CAPITAL_SOCIAL:   process.env.NEXT_PUBLIC_CAPITAL_SOCIAL,
  NEXT_PUBLIC_CNDP_DECLARATION: process.env.NEXT_PUBLIC_CNDP_DECLARATION,
} as const

type EnvKey = keyof typeof ENV_VARS

function required(name: EnvKey, fallback?: string): string {
  const v = ENV_VARS[name]
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
  // Public-facing contact channels
  EMAIL: 'contact@tomobile360.ma',
  EMAIL_PRIVACY: 'privacy@tomobile360.ma',
  PHONE_DISPLAY: '+212 522 54 81 50 à 52', // landline range (3 lines: 50, 51, 52)
  PHONE_TEL: '+212522548150',              // first line of the range, for tel: links

  // USER_REQUIRED — real WhatsApp number, set via env
  WHATSAPP_DISPLAY: required('NEXT_PUBLIC_WHATSAPP_DISPLAY', '+212 522 54 81 50'),
  WHATSAPP_E164: required('NEXT_PUBLIC_WHATSAPP_E164', '212522548150'),

  // Physical address
  ADDRESS_SHORT: 'Quartier El Manar, Casablanca',
  ADDRESS_FULL: '2, Rue Mohamed Laghzaoui, Quartier El Manar, Casablanca 20370, Maroc',
  CITY: 'Casablanca',
  COUNTRY: 'Maroc',

  // Operating hours (displayed on contact page)
  HOURS_WEEKDAY: 'Lun - Ven: 9h00 - 18h00',
  HOURS_SATURDAY: 'Sam: 9h00 - 13h00',

  // Legal identifiers (Morocco — required on mentions légales)
  COMPANY_LEGAL_NAME: 'Tomobile 360 SARL',
  RC_NUMBER: required('NEXT_PUBLIC_RC_NUMBER'),
  ICE_NUMBER: required('NEXT_PUBLIC_ICE_NUMBER'),
  DIRECTOR_NAME: required('NEXT_PUBLIC_DIRECTOR_NAME'),

  // USER_REQUIRED — Capital social, only printed if set
  CAPITAL_SOCIAL: ENV_VARS.NEXT_PUBLIC_CAPITAL_SOCIAL || '',

  // USER_REQUIRED — CNDP declaration number, only printed if set
  CNDP_DECLARATION: ENV_VARS.NEXT_PUBLIC_CNDP_DECLARATION || '',
} as const

// Helper used everywhere we open WhatsApp with a prefilled message
export function whatsappLink(message: string, phone: string = BUSINESS_INFO.WHATSAPP_E164): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}

// Helper for tel: links
export function telLink(phone: string = BUSINESS_INFO.PHONE_TEL): string {
  return `tel:${phone}`
}

// Helper for mailto: links
export function mailLink(email: string = BUSINESS_INFO.EMAIL, subject?: string): string {
  const base = `mailto:${email}`
  return subject ? `${base}?subject=${encodeURIComponent(subject)}` : base
}
