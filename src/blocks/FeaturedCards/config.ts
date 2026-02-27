import type { Block } from 'payload'

export const FeaturedCardsBlock: Block = {
  slug: 'featuredCards',
  interfaceName: 'FeaturedCardsProps',
  labels: {
    singular: 'Featured Cards Section',
    plural: 'Featured Cards Sections',
  },
  fields: [
    {
      name: 'cards',
      type: 'array',
      required: true,
      minRows: 2,
      maxRows: 4,
      admin: {
        description: 'Add 2 or 4 cards (2 = side-by-side, 4 = 2x2 grid)',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          admin: {
            description: 'Card image (recommended: 600x600px)',
          },
        },
        {
          name: 'label',
          type: 'text',
          admin: {
            description: 'Small text above headline (e.g., "Nike Football")',
          },
        },
        {
          name: 'headline',
          type: 'text',
          required: true,
        },
        // ⭐ Just a collection — URL built from its rules
        {
          name: 'linkedCollection',
          type: 'relationship',
          relationTo: 'col',
          required: true,
          admin: {
            description: 'URL is auto-built from the collection\'s rules',
          },
        },
      ],
    },
  ],
}