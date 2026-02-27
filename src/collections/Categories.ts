import { randomBytes } from 'crypto'
import { type CollectionConfig } from 'payload'
import { SITE_CONFIG } from 'site.config'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'parent'],
    group: 'Ecommerce',
  },

  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      index: true,
    },

    {
      name: 'department',
      type: 'select',
      required: true,
      options: SITE_CONFIG.departments, // ← Dynamic from config
      admin: {
        position: 'sidebar',
        description: 'Which department does this category belong to?',
      },
      index: true,
    },

    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: false,
      index: true,

      admin: {
        position: 'sidebar',
        description: 'Select a parent category (leave empty if top-level)',
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
        description: 'URL-friendly identifier (auto-generated)',
      },
      hooks: {
        beforeValidate: [
          async ({ data, operation, value, req, originalDoc }) => {
            // If updating and slug hasn't changed, keep it
            if (operation === 'update' && value && value === originalDoc?.slug) {
              return value
            }

            if (!data?.title) return value

            // Generate base slug from title
            const baseSlug = data.title
              .toLowerCase()
              .replace(/ /g, '-')
              .replace(/[^\w-]+/g, '')

            // Generate a unique suffix (8 characters gives us ~3.4e14 possibilities)
            // Using crypto.randomBytes for cryptographically strong randomness
            const uniqueSuffix = generateUniqueSuffix(8)

            // Combine the hierarchical slug with the unique suffix
            // This ensures uniqueness while maintaining readability
            const finalSlug = `${baseSlug}-${uniqueSuffix}`

            return finalSlug
          },
        ],
      },
    },

    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Category description for display',
      },
    },

    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Category hero/banner image',
      },
    },

    // SEO fields
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          admin: {
            placeholder: "e.g., Men's Running Shoes | Your Store",
            description: 'Custom meta title (leave empty to use category title)',
          },
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          maxLength: 160,
          admin: {
            placeholder: "e.g., Shop the latest men's running shoes from top brands...",
            description: 'Meta description for search engines (max 160 characters)',
          },
        },
        {
          name: 'metaImage',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description:
              'Image for social sharing (Open Graph/Twitter Card). Recommended: 1200x630px',
          },
        },
      ],
    },
  ],
}

/**
 * Generate a URL-safe unique suffix
 * @param length - Number of characters to generate (recommended: 8-12)
 * @returns A URL-safe string of random characters
 */
function generateUniqueSuffix(length: number = 8): string {
  // Character set that's URL-safe: alphanumeric (lowercase + numbers)
  // Avoiding uppercase to maintain consistency with slug format
  const charset = 'abcdefghijklmnopqrstuvwxyz0123456789'

  // Generate random bytes
  const random = randomBytes(length)

  // Convert to characters from our charset
  let result = ''
  for (let i = 0; i < length; i++) {
    // Use the random byte to index into our charset
    const randomIndex = random[i] % charset.length
    result += charset[randomIndex]
  }

  return result
}