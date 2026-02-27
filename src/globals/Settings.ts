import { revalidateTag } from 'next/cache'
import type { GlobalConfig } from 'payload'

export const Settings: GlobalConfig = {
  slug: 'settings',
  label: 'Site Settings',
  admin: {
    group: 'Admin',
    description: 'Global site settings — WhatsApp, announcements, and more.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'whatsapp',
      type: 'group',
      label: 'WhatsApp',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: true,
          label: 'Show WhatsApp Button',
          admin: {
            description: 'Toggle the floating WhatsApp button site wide',
          },
        },
        {
          name: 'phoneNumber',
          type: 'text',
          label: 'Phone Number',
          admin: {
            description: 'Include country code, no spaces or dashes. e.g. 2348012345678',
            condition: (_, siblingData) => siblingData?.enabled,
          },
        },
        {
          name: 'message',
          type: 'text',
          label: 'Pre-filled Message',
          defaultValue: 'Hi! I have a question about a product.',
          admin: {
            description: 'Default message that appears in WhatsApp when customer clicks the button',
            condition: (_, siblingData) => siblingData?.enabled,
          },
        },
        {
          name: 'tooltipText',
          type: 'text',
          label: 'Tooltip Text',
          defaultValue: 'Chat with us on WhatsApp',
          admin: {
            description: 'Text shown on hover',
            condition: (_, siblingData) => siblingData?.enabled,
          },
        },
      ],
    },
  ],
  hooks: {
    afterChange: [
      () => {
        revalidateTag('settings')
      },
    ],
  },
}
