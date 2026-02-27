// blocks/ProductCarousel/config.ts
import type { Block } from 'payload'
import { SITE_CONFIG } from 'site.config'

export const ProductCarousel: Block = {
  slug: 'productCarousel',
  interfaceName: 'ProductCarouselBlock',
  labels: {
    plural: 'Product Carousels',
    singular: 'Product Carousel',
  },
  fields: [
    {
      name: 'showHeader',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show Header Section',
    },
    {
      name: 'tagline',
      type: 'text',
      label: 'Tagline',
      admin: {
        condition: (_, siblingData) => siblingData.showHeader,
        description: 'Small text above the title (e.g., "Shop Our Bestsellers")',
      },
    },
    {
      name: 'title',
      type: 'text',
      label: 'Section Title',
      required: true,
      admin: {
        condition: (_, siblingData) => siblingData.showHeader,
      },
    },
    {
      name: 'ctaText',
      type: 'text',
      label: 'CTA Button Text',
      admin: {
        condition: (_, siblingData) => siblingData.showHeader,
        description: 'e.g., "View All"',
      },
    },
    {
      name: 'ctaLink',
      type: 'text',
      label: 'CTA Button Link (Override)',
      admin: {
        // Only show for collection/manual — auto sources build their own URL
        condition: (_, siblingData) =>
          siblingData.showHeader &&
          !!siblingData.ctaText &&
          ['collection', 'manual'].includes(siblingData.sourceType),
        description: 'Optional: Override the auto-generated link. Leave blank to use the default.',
      },
    },
    {
      name: 'sourceType',
      type: 'select',
      defaultValue: 'collection',
      label: 'Product Source',
      required: true,
      options: [
        { label: 'From Collection (Manual or Dynamic)', value: 'collection' },
        { label: 'Best Sellers (Auto)', value: 'best-sellers' },
        { label: 'New Arrivals (Auto)', value: 'new-arrivals' },
        { label: 'On Sale (Auto)', value: 'on-sale' },
        { label: 'Manual Product Selection', value: 'manual' },
      ],
      admin: {
        description: 'Choose where to pull products from',
      },
    },
    {
      name: 'linkedCollection',
      type: 'relationship',
      relationTo: 'col',
      admin: {
        condition: (_, siblingData) => siblingData.sourceType === 'collection',
        description: 'Select a collection (manual or dynamic rules will apply)',
      },
    },

    // Auto filters — only for auto sources, gender hidden for single-gender stores
    {
      name: 'autoFilters',
      type: 'group',
      label: 'Additional Filters',
      admin: {
        condition: (_, siblingData) =>
          ['best-sellers', 'new-arrivals', 'on-sale'].includes(siblingData.sourceType),
        description: 'Optional: Further narrow the automated results',
      },
      fields: [
        ...(SITE_CONFIG.singleGender
          ? [] // single-gender store — no gender filter exposed
          : [
              {
                name: 'gender',
                type: 'select' as const,
                options: [{ label: 'All', value: '' }, ...SITE_CONFIG.genderOptions],
                admin: {
                  description: 'Filter by gender',
                },
              },
            ]),
        {
          name: 'brand',
          type: 'relationship',
          relationTo: 'brands',
          filterOptions: {
            isActive: { equals: true },
          },
          admin: {
            description: 'Filter by specific brand',
          },
        },
        {
          name: 'category',
          type: 'relationship',
          relationTo: 'categories',
          admin: {
            description: 'Filter by category',
          },
        },
      ],
    },

    {
      name: 'selectedProducts',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      admin: {
        condition: (_, siblingData) => siblingData.sourceType === 'manual',
        description: 'Manually select specific products to display',
      },
    },
    {
      name: 'limit',
      type: 'number',
      defaultValue: 10,
      min: 4,
      max: 30,
      admin: {
        condition: (_, siblingData) => siblingData.sourceType !== 'manual',
        step: 1,
        description: 'Maximum number of products to show',
      },
    },
    {
      name: 'carouselSpeed',
      type: 'number',
      defaultValue: 1,
      label: 'Auto-scroll Speed',
      admin: {
        description: 'Speed of auto-scroll (1 = slow, 3 = fast, 0 = no auto-scroll)',
        step: 0.5,
      },
      min: 0,
      max: 5,
    },
  ],
}
