// Single source of truth for Tomobile 360 business identity.
// USER: fill the values marked PLACEHOLDER before launch.
// Anything imported from EXTERNAL_LINKS lives in src/lib/links.ts.

export const BUSINESS_INFO = {
  // Public-facing contact channels
  EMAIL: 'contact@tomobile360.ma',
  EMAIL_PRIVACY: 'privacy@tomobile360.ma',
  PHONE_DISPLAY: '+212 522-123456', // PLACEHOLDER — USER: real landline
  PHONE_TEL: '+212522123456',        // PLACEHOLDER — same number, no spaces, for tel: links
  WHATSAPP_DISPLAY: '+212 XXX-000000', // PLACEHOLDER — USER: real WhatsApp number
  WHATSAPP_E164: '212XXX000000',       // PLACEHOLDER — same WhatsApp, no +/spaces, for wa.me/ links

  // Physical address
  ADDRESS_SHORT: 'Casablanca, Maroc',                                  // PLACEHOLDER — keep short form for cards
  ADDRESS_FULL: '123 Boulevard Mohammed V, Casablanca 20250, Maroc',   // PLACEHOLDER — USER: real street address
  CITY: 'Casablanca',
  COUNTRY: 'Maroc',

  // Operating hours (displayed on contact page)
  HOURS_WEEKDAY: 'Lun - Ven: 9h00 - 18h00',
  HOURS_SATURDAY: 'Sam: 9h00 - 13h00',

  // Legal identifiers (Morocco — required on mentions légales)
  COMPANY_LEGAL_NAME: 'Tomobile 360 SARL',
  RC_NUMBER: 'PLACEHOLDER',          // USER: real Registre de Commerce number
  ICE_NUMBER: 'PLACEHOLDER',         // USER: real ICE number
  DIRECTOR_NAME: 'PLACEHOLDER',      // USER: real director of publication
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
