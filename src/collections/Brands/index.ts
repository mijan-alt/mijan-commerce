// collections/Brands.ts
import type { CollectionConfig } from 'payload'


export const Brands: CollectionConfig = {
  slug: 'brands',
  labels: {
    singular: 'Brand',
    plural: 'Brands',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'isActive', 'featured'],
    group: 'Ecommerce',
  },
//   access: {
//     create: authenticated,
//     delete: authenticated,
//     update: authenticated,
//     read: () => true,
//   },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Brand name (e.g., "Nike", "Adidas")',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'URL-friendly version (e.g., "nike", "adidas")',
      },
      hooks: {
        beforeValidate: [
          ({ data, value }) => {
            if (value) return value // Keep if manually set
            if (data?.name) {
              return data.name
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^\w-]+/g, '')
            }
          },
        ],
      },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Brand logo',
      },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Hero/banner image for brand page',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Show this brand on the site?',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Show in navigation menu?',
      },
    },

  ],
}