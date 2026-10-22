'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Car } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { gaEvents } from '@/lib/analytics/gtag'
import { FormPrivacyNotice } from '@/components/shared/FormPrivacyNotice'
import { BUSINESS_INFO, whatsappLink } from '@/lib/business-info'

interface TestDriveDialogProps {
  vehicleName: string
  /** The version shown on the model page, if one is selected. */
  version?: string
  dealerPhone?: string
}

const EMPTY_FORM = {
  name: '',
  phone: '',
  city: '',
  preferredDate: '',
  preferredTime: '',
  message: '',
}

export function TestDriveDialog({ vehicleName, version, dealerPhone }: TestDriveDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState(EMPTY_FORM)
  // WhatsApp link of the request just sent: the dialog then shows its confirmation.
  const [sentUrl, setSentUrl] = useState<string | null>(null)

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) setSentUrl(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const dateInfo = formData.preferredDate
      ? `Date souhaitée: ${formData.preferredDate}${formData.preferredTime ? ` à ${formData.preferredTime}` : ''}`
      : ''
    const message = [
      'Bonjour, je souhaite planifier un essai routier.',
      '',
      `Modèle: ${vehicleName}`,
      ...(version ? [`Version: ${version}`] : []),
      `Nom: ${formData.name}`,
      `Téléphone: ${formData.phone}`,
      `Ville: ${formData.city}`,
      ...(dateInfo ? [dateInfo] : []),
      ...(formData.message ? ['', formData.message] : []),
    ].join('\n')
    const url = whatsappLink(message, dealerPhone ? dealerPhone.replace(/[^0-9]/g, '') : undefined)
    gaEvents.testDriveRequest({ vehicle: vehicleName })
    window.open(url, '_blank')
    setSentUrl(url)
    setFormData(EMPTY_FORM)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full" size="lg">
          <Car className="h-4 w-4 mr-2" />
          Demander un essai
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        {sentUrl ? (
          <>
            <DialogHeader>
              <DialogTitle>Votre demande s&apos;ouvre dans WhatsApp</DialogTitle>
              <DialogDescription>
                Le message pré-rempli est adressé à l&apos;équipe Tomobile 360 : envoyez-le depuis
                WhatsApp pour transmettre votre demande d&apos;essai.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 text-sm text-gray-600">
              <p>
                L&apos;équipe vous répond pendant ses horaires d&apos;ouverture :<br />
                {BUSINESS_INFO.HOURS_WEEKDAY}<br />
                {BUSINESS_INFO.HOURS_SATURDAY}
              </p>
              <p>
                WhatsApp ne s&apos;est pas ouvert ?{' '}
                <a href={sentUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-secondary underline">
                  Ouvrir le message dans WhatsApp
                </a>
              </p>
            </div>
            <Button type="button" onClick={() => handleOpenChange(false)} autoFocus>
              Fermer
            </Button>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Demander un essai</DialogTitle>
              <DialogDescription>
                Remplissez le formulaire pour réserver un essai du {vehicleName}
              </DialogDescription>
            </DialogHeader>

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
                <Label htmlFor="city">Ville *</Label>
                <Input
                  id="city"
                  autoComplete="address-level2"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date souhaitée</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) =>
                      setFormData({ ...formData, preferredDate: e.target.value })
                    }
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <Label htmlFor="time">Heure souhaitée</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.preferredTime}
                    onChange={(e) =>
                      setFormData({ ...formData, preferredTime: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="message">Message (optionnel)</Label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                  placeholder="Questions ou demandes particulières..."
                />
              </div>

              <FormPrivacyNotice>
                Ces informations ne sont pas enregistrées sur notre site : « Envoyer la demande » ouvre
                WhatsApp avec un message pré-rempli adressé à l&apos;équipe Tomobile 360, qui l&apos;utilise pour
                organiser votre essai.
              </FormPrivacyNotice>

              <div className="flex gap-3">
                <Button type="submit" className="flex-1 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                  Envoyer la demande
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
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
