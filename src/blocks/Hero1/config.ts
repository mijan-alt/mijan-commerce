import type { Block } from 'payload'

export const Hero1Block: Block = {
  slug: 'hero1',
  interfaceName: 'Hero1BlockProps',
  labels: {
    singular: 'Hero Section',
    plural: 'Hero Sections',
  },
  fields: [
    {
      name: 'badge',
      type: 'text',
      admin: {
        description: 'Small text above the title (e.g., "NEW ARRIVALS")',
      },
    },
    {
      name: 'title',
      type: 'text',

      admin: {
        description: 'Main headline',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Supporting text below the headline',
      },
    },
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Background video or image (videos will autoplay)',
      },
    },
    {
      name: 'overlay',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Add a dark gradient overlay for better text readability',
      },
    },
    {
      name: 'alignment',
      type: 'radio',
      defaultValue: 'center',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ],
      admin: {
        description: 'Text alignment on desktop',
      },
    },
    {
      name: 'buttons',
      type: 'array',
      minRows: 0,
      maxRows: 3,
      labels: {
        singular: 'Button',
        plural: 'Buttons',
      },
      admin: {
        description: 'Add up to 3 call-to-action buttons',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'variant',
          type: 'select',
          defaultValue: 'default',
          options: [
            { label: 'Primary (Filled)', value: 'default' },
            { label: 'Secondary (Outline)', value: 'outline' },
            { label: 'Ghost', value: 'ghost' },
          ],
        },
        {
          name: 'linkType',
          type: 'radio',
          defaultValue: 'collection',
          options: [
            { label: 'Collection', value: 'collection' },
            { label: 'Special', value: 'special' },
          ],
          admin: {
            layout: 'horizontal',
            description: 'Link to a custom collection or a built-in special page',
          },
        },
        {
          name: 'linkedCollection',
          type: 'relationship',
          relationTo: 'col',
          admin: {
            condition: (_, siblingData) => siblingData?.linkType === 'collection',
            description: "URL is auto-built from the collection's rules",
          },
        },
        {
          name: 'specialCollection',
          type: 'select',
          options: [
            { label: 'New Arrivals', value: 'new-arrivals' },
            { label: 'Best Sellers', value: 'best-sellers' },
            { label: 'On Sale', value: 'on-sale' },
          ],
          admin: {
            condition: (_, siblingData) => siblingData?.linkType === 'special',
            description: 'Links to a built-in programmatic collection',
          },
        },
      ],
    },
  ],
}
