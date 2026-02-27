import type { Block } from 'payload'

export const BlogSectionBlock: Block = {
  slug: 'blogSection',
  interfaceName: 'BlogSectionBlockProps',
  labels: {
    singular: 'Blog Section',
    plural: 'Blog Sections',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      defaultValue: 'From the Blog',
      admin: {
        description: 'Section heading',
      },
    },
    {
      name: 'subheading',
      type: 'text',
      admin: {
        description: 'Optional supporting text below the heading',
      },
    },
    {
      name: 'displayMode',
      type: 'radio',
      defaultValue: 'featured',
      options: [
        { label: 'Featured Posts', value: 'featured' },
        { label: 'Latest Posts', value: 'latest' },
        { label: 'Manual Selection', value: 'manual' },
      ],
      admin: {
        layout: 'horizontal',
        description:
          'Featured: posts marked as featured. Latest: most recent. Manual: hand-pick.',
      },
    },
    {
      name: 'posts',
      type: 'relationship',
      relationTo: 'blogs',
      hasMany: true,
      minRows: 1,
      maxRows: 6,
      admin: {
        condition: (_, siblingData) => siblingData?.displayMode === 'manual',
        description: 'Hand-pick which posts to show',
      },
    },
    {
      name: 'limit',
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 6,
      admin: {
        condition: (_, siblingData) => siblingData?.displayMode !== 'manual',
        description: 'How many posts to show (max 6)',
      },
    },
    {
      name: 'showViewAll',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Show a "View all posts" link',
      },
    },
  ],
}