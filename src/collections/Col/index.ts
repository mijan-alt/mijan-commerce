import { slugField } from '@/fields/slug'
import type { CollectionConfig } from 'payload'
import { SITE_CONFIG } from 'site.config'

export const Col: CollectionConfig = {
  slug: 'col',
  labels: {
    singular: 'Collection',
    plural: 'Collections',
  },
  admin: {
    useAsTitle: 'title',
    group: 'Ecommerce',
    defaultColumns: ['title', 'type'],
    description: 'Create marketing collections like "Summer Sale", "Jordan Exclusives", etc.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Collection name (e.g., "Summer Sale", "Air Max Classics")',
      },
    },

    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Short description for collection pages',
      },
    },

    {
      name: 'type',
      type: 'radio',
      required: true,
      defaultValue: 'manual',
      options: [
        {
          label: 'Manual Selection',
          value: 'manual',
        },
        {
          label: 'Dynamic (Auto-filtered)',
          value: 'dynamic',
        },
      ],
      admin: {
        description: 'Manual: Hand-pick products. Dynamic: Auto-filter by rules.',
        layout: 'horizontal',
      },
    },

    // ═══════════════════════════════════════════════════════════
    // MANUAL TYPE: Select specific products
    // ═══════════════════════════════════════════════════════════
    {
      name: 'products',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      admin: {
        condition: (_, siblingData) => siblingData.type === 'manual',
        description: 'Manually select which products appear in this collection',
      },
    },

    // ═══════════════════════════════════════════════════════════
    // DYNAMIC TYPE: Auto-filter products by rules
    // ═══════════════════════════════════════════════════════════
    {
      name: 'dynamicRules',
      type: 'group',
      label: 'Filter Rules',
      admin: {
        condition: (_, siblingData) => siblingData.type === 'dynamic',
        description: 'Products matching ALL selected filters will appear in this collection',
      },
      fields: [
        {
          name: 'categories',
          type: 'relationship',
          relationTo: 'categories',
          hasMany: true,
          admin: {
            description: 'Filter by categories (leave empty for all)',
          },
        },
        {
          name: 'brands',
          type: 'relationship',
          relationTo: 'brands',
          hasMany: true,
          filterOptions: {
            isActive: { equals: true },
          },
          admin: {
            description: 'Filter by brands (leave empty for all)',
          },
        },

        // ⭐ Config-driven: mirrors the gender field in Products
        ...(SITE_CONFIG.useGenderFiltering || !SITE_CONFIG.singleGender
          ? [
              {
                name: 'gender',
                type: 'select' as const,
                hasMany: true,
                options: SITE_CONFIG.genderOptions,
                admin: {
                  description: SITE_CONFIG.singleGender
                    ? `Filtering by ${SITE_CONFIG.singleGender} (set in site config)`
                    : 'Filter by gender (leave empty for all)',
                  // Hide if store is single-gender — no point filtering what's already fixed
                  condition: () => !SITE_CONFIG.singleGender,
                },
              },
            ]
          : []),

     
      
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // VISUAL CONTENT
    // ═══════════════════════════════════════════════════════════
    {
      name: 'media',
      type: 'group',
      label: 'Visual Content',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          admin: {
            description: 'Hero/banner image for collection page',
          },
        },
        {
          name: 'mobileImage',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Optional: Different image for mobile',
          },
        },
      ],
    },

    {
      name: 'startDate',
      type: 'date',
      admin: {
        position: 'sidebar',
        description: 'Optional: Collection goes live on this date',
      },
    },

    {
      name: 'endDate',
      type: 'date',
      admin: {
        position: 'sidebar',
        description: 'Optional: Collection expires on this date',
      },
    },

    ...slugField(),
  ],
}