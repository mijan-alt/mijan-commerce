// blocks/ProductCarousel/Component.tsx
import type { Product, ProductCarouselBlock as ProductCarouselProps } from '@/payload-types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { SITE_CONFIG } from 'site.config'
import { ProductCarouselClient } from './Component.client'

const IS_MULTI_GENDER = SITE_CONFIG.useGenderFiltering && !SITE_CONFIG.singleGender

// ═══════════════════════════════════════════════════════════
// BUILD CTA LINK FROM COL RULES
// ═══════════════════════════════════════════════════════════
function buildCtaLink(
  sourceType: string,
  collectionData: any,
  customCtaLink?: string | null,
): string {
  if (customCtaLink) return customCtaLink

  // Auto sources — URLs are hardcoded, gender never in the path
  if (sourceType === 'best-sellers') return '/shop/best-sellers'
  if (sourceType === 'new-arrivals') return '/shop/new-arrivals'
  if (sourceType === 'on-sale') return '/shop/on-sale'
  if (sourceType === 'manual') return '/shop'

  // From collection
  if (sourceType === 'collection' && collectionData?.slug) {
    const colSlug = collectionData.slug
    const rules = collectionData.type === 'dynamic' ? collectionData.dynamicRules : null

    const firstGender = rules?.gender?.[0] || null
    const firstCategory = rules?.categories?.[0]
    const firstBrand = rules?.brands?.[0]

    const categorySlug =
      firstCategory && typeof firstCategory === 'object' ? firstCategory.slug : null
    const categoryDept =
      firstCategory && typeof firstCategory === 'object' ? firstCategory.department : null
    const brandSlug = firstBrand && typeof firstBrand === 'object' ? firstBrand.slug : null

    if (IS_MULTI_GENDER) {
      if (firstGender && categoryDept && categorySlug)
        return `/shop/${firstGender}/${categoryDept}/${categorySlug}`
      if (firstGender && categorySlug) return `/shop/${firstGender}/${categorySlug}`
      if (firstGender) return `/shop/${firstGender}/${colSlug}`
      if (brandSlug) return `/shop/${brandSlug}`
      return `/shop/${colSlug}`
    }

    // Single-gender — gender never appears in the URL
    if (categoryDept && categorySlug) return `/shop/${categoryDept}/${categorySlug}`
    if (categorySlug) return `/shop/${categorySlug}`
    if (brandSlug) return `/shop/${brandSlug}`
    return `/shop/${colSlug}`
  }

  return '/shop'
}

export const ProductCarouselBlock: React.FC<ProductCarouselProps & { id?: string }> = async (
  props,
) => {
  const {
    sourceType,
    linkedCollection,
    autoFilters,
    selectedProducts,
    limit = 10,
    showHeader,
    tagline,
    title,
    ctaText,
    ctaLink: customCtaLink,
    carouselSpeed = 1,
  } = props

  const payload = await getPayload({ config: configPromise })
  let products: Product[] = []
  let collectionData: any = null

  // ═══════════════════════════════════════════════════════════
  // SHARED FILTER BUILDER FOR AUTO SOURCES
  // Gender filter only applies in multi-gender stores

  // ═══════════════════════════════════════════════════════════

  const filters = autoFilters as any

  const buildAutoFilters = () => {
    const conditions: any[] = [{ _status: { equals: 'published' } }]

    // Only apply gender filter in multi-gender stores
    if (IS_MULTI_GENDER && filters?.gender) {
      conditions.push({ gender: { equals: filters.gender } })
    }
    if (filters?.brand) {
      conditions.push({
        brand: {
          equals: typeof filters.brand === 'object' ? filters.brand.id : filters.brand,
        },
      })
    }
    if (filters?.category) {
      conditions.push({
        categories: {
          in: [typeof filters.category === 'object' ? filters.category.id : filters.category],
        },
      })
    }

    return conditions
  }

  // ═══════════════════════════════════════════════════════════
  // 1. FROM COLLECTION
  // ═══════════════════════════════════════════════════════════
  if (sourceType === 'collection' && linkedCollection) {
    collectionData =
      typeof linkedCollection === 'object'
        ? linkedCollection
        : await payload.findByID({ collection: 'col', id: linkedCollection, depth: 2 })

    if (collectionData?.type === 'manual' && collectionData.products?.length) {
      const productIds = collectionData.products
        .map((p: any) => (typeof p === 'object' ? p.id : p))
        .filter(Boolean)

      if (productIds.length > 0) {
        const result = await payload.find({
          collection: 'products',
          where: { id: { in: productIds }, _status: { equals: 'published' } },
          limit: Number(limit),
          depth: 1,
        })
        products = result.docs
      }
    } else if (collectionData?.type === 'dynamic' && collectionData.dynamicRules) {
      const rules = collectionData.dynamicRules
      const whereConditions: any[] = [{ _status: { equals: 'published' } }]

      if (rules.categories?.length) {
        whereConditions.push({
          categories: { in: rules.categories.map((c: any) => (typeof c === 'object' ? c.id : c)) },
        })
      }
      if (rules.brands?.length) {
        whereConditions.push({
          brand: { in: rules.brands.map((b: any) => (typeof b === 'object' ? b.id : b)) },
        })
      }
      // Dynamic collection gender rules only apply in multi-gender stores
      if (IS_MULTI_GENDER && rules.gender?.length) {
        whereConditions.push({ gender: { in: rules.gender } })
      }
      if (rules.onSale) whereConditions.push({ onSale: { equals: true } })
      if (rules.minPrice)
        whereConditions.push({ priceInNGN: { greater_than_equal: rules.minPrice } })
      if (rules.maxPrice) whereConditions.push({ priceInNGN: { less_than_equal: rules.maxPrice } })

      const result = await payload.find({
        collection: 'products',
        where: { and: whereConditions },
        limit: Number(limit),
        depth: 1,
      })
      products = result.docs
    }
  }

  // ═══════════════════════════════════════════════════════════
  // 2. BEST SELLERS
  // ═══════════════════════════════════════════════════════════
  else if (sourceType === 'best-sellers') {
    const whereConditions = [...buildAutoFilters(), { totalSales: { greater_than: 0 } }]
    const result = await payload.find({
      collection: 'products',
      where: { and: whereConditions },
      sort: '-totalSales',
      limit: Number(limit),
      depth: 1,
    })
    products = result.docs
  }

  // ═══════════════════════════════════════════════════════════
  // 3. NEW ARRIVALS
  // ═══════════════════════════════════════════════════════════
  else if (sourceType === 'new-arrivals') {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const whereConditions = [
      ...buildAutoFilters(),
      { createdAt: { greater_than: thirtyDaysAgo.toISOString() } },
    ]
    const result = await payload.find({
      collection: 'products',
      where: { and: whereConditions },
      sort: '-createdAt',
      limit: Number(limit),
      depth: 1,
    })
    products = result.docs
  }

  // ═══════════════════════════════════════════════════════════
  // 4. ON SALE
  // ═══════════════════════════════════════════════════════════
  else if (sourceType === 'on-sale') {
    const whereConditions = [...buildAutoFilters(), { onSale: { equals: true } }]
    const result = await payload.find({
      collection: 'products',
      where: { and: whereConditions },
      limit: Number(limit),
      depth: 1,
    })
    products = result.docs
  }

  // ═══════════════════════════════════════════════════════════
  // 5. MANUAL SELECTION
  // ═══════════════════════════════════════════════════════════
  else if (sourceType === 'manual' && selectedProducts?.length) {
    products = selectedProducts
      .map((item: any) =>
        item && typeof item === 'object' && 'id' in item ? (item as Product) : null,
      )
      .filter(Boolean) as Product[]
  }

  if (!products?.length) return null

  const finalCtaLink = buildCtaLink(sourceType, collectionData, customCtaLink)

  return (
    <ProductCarouselClient
      products={products}
      showHeader={showHeader}
      tagline={tagline}
      title={title}
      ctaText={ctaText}
      ctaLink={finalCtaLink}
      carouselSpeed={carouselSpeed}
    />
  )
}
