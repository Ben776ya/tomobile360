import Image from 'next/image'
import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-muted">
      {/* Simple header with logo */}
      <div className="py-4 px-4 border-b border-border bg-white">
        <div className="container mx-auto">
          <Link href="/" className="inline-block">
            <Image
              src="/logo_tomobil360.png"
              alt="Tomobile 360"
              width={150}
              height={40}
              className="h-10 w-auto"
            />
          </Link>
        </div>
      </div>

      {children}
    </div>
  )
}
