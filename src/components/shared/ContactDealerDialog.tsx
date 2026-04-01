'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Phone, Mail, MessageSquare } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface ContactDealerDialogProps {
  vehicleName: string
  dealerEmail?: string
  dealerPhone?: string
}

export function ContactDealerDialog({
  vehicleName,
  dealerEmail,
  dealerPhone,
}: ContactDealerDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: `Bonjour, je suis intéressé par le véhicule ${vehicleName}. Pouvez-vous me contacter pour plus d'informations?`,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const message = `Bonjour, je suis interesse(e) par ${vehicleName}.%0A%0ANom: ${formData.name}%0ATelephone: ${formData.phone}%0AEmail: ${formData.email}%0A%0A${formData.message}`
    const phone = dealerPhone ? dealerPhone.replace(/[^0-9]/g, '') : ''
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
    setOpen(false)
    setFormData({
      name: '',
      email: '',
      phone: '',
      message: `Bonjour, je suis intéressé par le véhicule ${vehicleName}. Pouvez-vous me contacter pour plus d'informations?`,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" size="lg">
          <Phone className="h-4 w-4 mr-2" />
          Contacter le concessionnaire
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Contacter le concessionnaire</DialogTitle>
          <DialogDescription>
            Remplissez le formulaire ci-dessous et nous vous mettrons en contact avec le concessionnaire.
          </DialogDescription>
        </DialogHeader>

        {/* Contact Info */}
        {(dealerPhone || dealerEmail) && (
          <div className="bg-gray-100 rounded-lg p-4 space-y-2 border border-gray-200">
            <p className="text-sm font-semibold text-gray-900">Coordonnées du concessionnaire:</p>
            {dealerPhone && (
              <a
                href={`tel:${dealerPhone}`}
                className="flex items-center gap-2 text-sm text-secondary hover:underline"
              >
                <Phone className="h-4 w-4" />
                {dealerPhone}
              </a>
            )}
            {dealerEmail && (
              <a
                href={`mailto:${dealerEmail}`}
                className="flex items-center gap-2 text-sm text-secondary hover:underline"
              >
                <Mail className="h-4 w-4" />
                {dealerEmail}
              </a>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nom complet *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Téléphone *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="message">Message</Label>
            <textarea
              id="message"
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              rows={4}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="flex-1 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
              Envoyer le message
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="shadow-sm hover:shadow-md transition-all duration-300"
            >
              Annuler
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
