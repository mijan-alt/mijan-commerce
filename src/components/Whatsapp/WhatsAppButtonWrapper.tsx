import { getSettings } from '@/utilities/getSettings'
import { WhatsAppButton } from './WhatsAppButton'

export async function WhatsAppButtonWrapper() {
  const settings = await getSettings()
  const whatsapp = settings?.whatsapp

  if (!whatsapp?.enabled || !whatsapp?.phoneNumber) return null

  return (
    <WhatsAppButton
      phoneNumber={whatsapp.phoneNumber}
      message={whatsapp.message || undefined}
      tooltipText={whatsapp.tooltipText || undefined}
    />
  )
}