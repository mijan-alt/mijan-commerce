// blocks/CategoryCarousel/config.ts
import type { Block } from 'payload'

export const CategoryCarousel: Block = {
  slug: 'categoryCarousel',
  interfaceName: 'CategoryCarouselBlock',
  labels: {
    plural: 'Category Carousels',
    singular: 'Category Carousel',
  },
  fields: [
    // Header Section
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
        description: 'Small text above the title (e.g., "Explore Categories")',
      },
    },
    {
      name: 'title',
      type: 'text',
      label: 'Section Title',
      required: true,
      defaultValue: 'Shop Our Icons',
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
        description: 'e.g., "View All Categories"',
      },
    },
    {
      name: 'ctaLink',
      type: 'text',
      label: 'CTA Button Link',
      admin: {
        condition: (_, siblingData) => siblingData.showHeader && !!siblingData.ctaText,
      },
    },

    // Category Selection
    {
      name: 'populateBy',
      type: 'select',
      defaultValue: 'selection',
      label: 'Populate Categories By',
      options: [
        {
          label: 'Manual Selection',
          value: 'selection',
        },
        {
          label: 'By Parent Category',
          value: 'parent',
        },
      ],
    },
    {
      name: 'selectedCategories',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'selection',
        description: 'Manually select categories to display (e.g., Air Force 1, Air Max, P-6000)',
      },
      hasMany: true,
      label: 'Select Categories',
      relationTo: 'categories',
      required: true,
    },
    {
      name: 'parentCategory',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'parent',
        description: 'Show all child categories of this parent',
      },
      label: 'Parent Category',
      relationTo: 'categories',
    },
    {
      name: 'limit',
      type: 'number',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'parent',
        step: 1,
      },
      defaultValue: 10,
      label: 'Number of Categories',
      min: 3,
      max: 20,
    },

    // Display Settings
    {
      name: 'buttonText',
      type: 'text',
      defaultValue: 'Shop',
      label: 'Button Text on Cards',
      admin: {
        description: 'Text shown on the button (e.g., "Shop", "Explore", "View")',
      },
    },

    // Carousel Settings
    {
      name: 'carouselSpeed',
      type: 'number',
      defaultValue: 0,
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