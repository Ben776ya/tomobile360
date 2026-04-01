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

interface TestDriveDialogProps {
  vehicleName: string
  dealerPhone?: string
}

export function TestDriveDialog({ vehicleName, dealerPhone }: TestDriveDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    preferredDate: '',
    preferredTime: '',
    message: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const dateInfo = formData.preferredDate
      ? `Date souhaitee: ${formData.preferredDate}${formData.preferredTime ? ` a ${formData.preferredTime}` : ''}`
      : ''
    const message = `Bonjour, je souhaite planifier un essai routier pour ${vehicleName}.%0A%0ANom: ${formData.name}%0ATelephone: ${formData.phone}%0A${dateInfo}${formData.message ? `%0A%0A${formData.message}` : ''}`
    const phone = dealerPhone ? dealerPhone.replace(/[^0-9]/g, '') : ''
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
    setOpen(false)
    setFormData({
      name: '',
      email: '',
      phone: '',
      preferredDate: '',
      preferredTime: '',
      message: '',
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full" size="lg">
          <Car className="h-4 w-4 mr-2" />
          Demander un essai
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
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
      </DialogContent>
    </Dialog>
  )
}
