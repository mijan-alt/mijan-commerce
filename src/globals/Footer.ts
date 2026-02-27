// collections/globals/Footer.ts
import type { GlobalConfig } from 'payload'
import { revalidateFooter } from './hooks/revalidateFooter'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
  },

  hooks: {
    afterChange: [revalidateFooter],
  },
  fields: [
    // ═══════════════════════════════════════════════════════════
    // NEWSLETTER SECTION
    // ═══════════════════════════════════════════════════════════
    {
      name: 'newsletter',
      type: 'group',
      label: 'Newsletter Section',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: true,
          label: 'Show Newsletter Section',
        },
        {
          name: 'title',
          type: 'text',
          defaultValue: 'Newsletter',
          required: true,
          admin: {
            condition: (_, siblingData) => siblingData.enabled,
          },
        },
        {
          name: 'description',
          type: 'textarea',
          defaultValue: 'Join our newsletter to receive exclusive deals and early access.',
          required: true,
          admin: {
            condition: (_, siblingData) => siblingData.enabled,
          },
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // INFORMATION LINKS
    // ═══════════════════════════════════════════════════════════
    {
      name: 'informationLinks',
      type: 'group',
      label: 'Information Links',
      fields: [
        {
          name: 'title',
          type: 'text',
          defaultValue: 'Information',
          required: true,
        },
        {
          name: 'links',
          type: 'array',
          minRows: 1,
          maxRows: 6,
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
            },
            {
              name: 'url',
              type: 'text',
              required: true,
              admin: {
                description: 'e.g., /terms, /privacy, /shipping',
              },
            },
          ],
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // COLLECTIONS (Hardcoded + Dynamic from Col)
    // ═══════════════════════════════════════════════════════════
    {
      name: 'collections',
      type: 'group',
      label: 'Collections Section',
      fields: [
        {
          name: 'title',
          type: 'text',
          defaultValue: 'Collections',
          required: true,
        },
        {
          name: 'showHardcodedCollections',
          type: 'checkbox',
          defaultValue: true,
          label: 'Show New Arrivals & Best Sellers',
          admin: {
            description: 'Always shown first if enabled',
          },
        },
        {
          name: 'customCollections',
          type: 'relationship',
          relationTo: 'col',
          hasMany: true,
          maxRows: 4,
          admin: {
            description: 'Additional collections to show (max 4)',
          },
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // CONTACT SECTION
    // ═══════════════════════════════════════════════════════════
    {
      name: 'contact',
      type: 'group',
      label: 'Contact Section',
      fields: [
        {
          name: 'title',
          type: 'text',
          defaultValue: 'Contact',
          required: true,
        },
        {
          name: 'email',
          type: 'email',
          required: true,
        },
        {
          name: 'phone',
          type: 'text',
          admin: {
            description: 'e.g., +1 234 567 8910',
          },
        },
        {
          name: 'hours',
          type: 'text',
          admin: {
            placeholder: 'e.g., Monday - Friday, 9 am - 9 pm',
          },
        },
        {
          name: 'socialLinks',
          type: 'array',
          label: 'Social Media Links',
          maxRows: 5,
          fields: [
            {
              name: 'platform',
              type: 'select',
              required: true,
              options: [
                { label: 'Facebook', value: 'facebook' },
                { label: 'Instagram', value: 'instagram' },
                { label: 'Twitter/X', value: 'twitter' },
                { label: 'TikTok', value: 'tiktok' },
                { label: 'YouTube', value: 'youtube' },
              ],
            },
            {
              name: 'url',
              type: 'text',
              required: true,
              admin: {
                placeholder: 'https://instagram.com/yourstore',
              },
            },
          ],
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // BOTTOM BAR
    // ═══════════════════════════════════════════════════════════
    {
      name: 'bottomBar',
      type: 'group',
      label: 'Bottom Bar',
      fields: [
        {
          name: 'copyrightText',
          type: 'text',
          defaultValue: 'All rights reserved.',
          admin: {
            description: 'Text after "© 2026 Your Store"',
          },
        },
        {
          name: 'tagline',
          type: 'text',
          admin: {
            placeholder: 'e.g., Designed in Michigan, Powered by Payload',
          },
        },
      ],
    },
  ],
}
