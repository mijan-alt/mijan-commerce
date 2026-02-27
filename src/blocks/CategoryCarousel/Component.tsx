// blocks/CategoryCarousel/Component.tsx
import type { CategoryCarouselBlock } from '@/payload-types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { CategoryCarouselClient } from './component.client'

export async function CategoryCarousel(props: CategoryCarouselBlock) {
  const {
    populateBy,
    selectedCategories,
    parentCategory,
    limit = 10,
    showHeader,
    tagline,
    title,
    ctaText,
    ctaLink,
    buttonText,
    carouselSpeed,
  } = props

  let categories: any[] = []

  try {
    const payload = await getPayload({ config: configPromise })

    if (populateBy === 'selection' && selectedCategories) {
      const ids = selectedCategories
        .map((cat: any) => (typeof cat === 'object' ? cat.id : cat))
        .filter(Boolean)

      const result = await payload.find({
        collection: 'categories',
        where: { id: { in: ids } },
        depth: 3,
      })
      categories = result.docs
    } else if (populateBy === 'parent' && parentCategory) {
      // Fetch children of parent category
      const parentId = typeof parentCategory === 'object' ? parentCategory.id : parentCategory

      const result = await payload.find({
        collection: 'categories',
        where: {
          parent: {
            equals: parentId,
          },
        },
        // limit,
        depth: 3, // ⭐ Important: populate parent chain for link building
      })

      categories = result.docs
    }
  } catch (error) {
    console.error('Error fetching categories for carousel:', error)
  }

  // Don't render if no categories
  if (!categories.length) {
    return null
  }

  return (
    <CategoryCarouselClient
      categories={categories}
      showHeader={showHeader}
      tagline={tagline}
      title={title}
      ctaText={ctaText}
      ctaLink={ctaLink}
      buttonText={buttonText}
      carouselSpeed={carouselSpeed}
    />
  )
}
