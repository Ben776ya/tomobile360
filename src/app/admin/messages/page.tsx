import { createClient } from '@supabase/supabase-js'
import { Mail, Phone, Clock } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getMessages() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data, error } = await supabase
    .from('contact_messages')
    .select('id, name, email, phone, subject, message, is_read, created_at')
    .order('created_at', { ascending: false })
    .limit(200)
  if (error) {
    console.error('Failed to load contact messages:', error)
    return []
  }
  return data ?? []
}

const subjectLabels: Record<string, string> = {
  info: "Demande d'information",
  vehicle: 'Question sur un véhicule',
  service: 'Services',
  partnership: 'Partenariat',
  other: 'Autre',
}

export default async function AdminMessagesPage() {
  // Auth enforced by /admin layout (server-side checkAdmin → redirect on fail).
  const messages = await getMessages()
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-700 mb-6">Messages reçus</h1>
      {messages.length === 0 ? (
        <p className="text-gray-500">Aucun message pour l&apos;instant.</p>
      ) : (
        <div className="space-y-4">
          {messages.map((m) => (
            <article
              key={m.id}
              className={`bg-white border rounded-2xl p-5 shadow-sm ${
                m.is_read ? 'border-gray-200' : 'border-secondary/40 bg-secondary/[0.02]'
              }`}
            >
              <header className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div>
                  <h2 className="font-semibold text-slate-700">{m.name}</h2>
                  <p className="text-sm text-gray-500">{subjectLabels[m.subject] ?? m.subject}</p>
                </div>
                <time className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(m.created_at).toLocaleString('fr-FR')}
                </time>
              </header>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                <a href={`mailto:${m.email}`} className="flex items-center gap-1 hover:text-secondary">
                  <Mail className="h-4 w-4" />
                  {m.email}
                </a>
                {m.phone && (
                  <a href={`tel:${m.phone}`} className="flex items-center gap-1 hover:text-secondary">
                    <Phone className="h-4 w-4" />
                    {m.phone}
                  </a>
                )}
              </div>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{m.message}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
