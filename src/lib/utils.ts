import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  const formatted = new Intl.NumberFormat('fr-MA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
  return `${formatted} DH`
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('fr-MA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const then = new Date(date)
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000)

  if (seconds < 60) return 'Il y a quelques secondes'
  if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} minutes`
  if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)} heures`
  if (seconds < 604800) return `Il y a ${Math.floor(seconds / 86400)} jours`
  if (seconds < 2592000) return `Il y a ${Math.floor(seconds / 604800)} semaines`
  if (seconds < 31536000) return `Il y a ${Math.floor(seconds / 2592000)} mois`
  return `Il y a ${Math.floor(seconds / 31536000)} ans`
}

/** Safely serialize JSON-LD — prevents </script> injection */
export function safeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
