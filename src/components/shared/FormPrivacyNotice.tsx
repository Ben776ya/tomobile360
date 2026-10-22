import Link from 'next/link'
import { BUSINESS_INFO } from '@/lib/business-info'

interface FormPrivacyNoticeProps {
  /** What this form's data is used for and who receives it (one or two sentences). */
  children: React.ReactNode
  className?: string
}

/**
 * Short loi 09-08 notice shown just above a form's submit button: the
 * form-specific purpose and recipient (children), then the rights and the
 * link to the full policy, which are the same for every form.
 */
export function FormPrivacyNotice({ children, className = '' }: FormPrivacyNoticeProps) {
  return (
    <p className={`text-xs leading-relaxed text-gray-500 ${className}`}>
      {children} Conformément à la loi n° 09-08, vous disposez d&apos;un droit d&apos;accès, de
      rectification et d&apos;opposition, à exercer auprès de{' '}
      <a href={`mailto:${BUSINESS_INFO.EMAIL_PRIVACY}`} className="underline hover:text-secondary">
        {BUSINESS_INFO.EMAIL_PRIVACY}
      </a>
      .{' '}
      <Link href="/confidentialite" className="underline hover:text-secondary">
        Politique de confidentialité
      </Link>
    </p>
  )
}
