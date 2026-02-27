// app/(app)/shop/[[...slug]]/page.tsx
// Server Component — fetches data, delegates toggle UI to ShopLayout (client)

import { ProductCard } from '@/blocks/ProductCarousel/ProductCard'
import { Categories } from '@/components/layout/search/Categories'

import { Pagination } from '@/components/shop/Pagination'
import { ShopLayouts } from '@/components/shop/ShopLayouts'
import { SortSelect } from '@/components/shop/SortSelect'
import config from '@payload-config'
import { ChevronRight } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import { Suspense } from 'react'
import { SITE_CONFIG, getDepartments, getGenderOptions } from 'site.config'

// ═══════════════════════════════════════════════════════════
// HARDCODED COLLECTIONS (not in database)
// ═══════════════════════════════════════════════════════════
const HARDCODED_COLLECTIONS = ['new-arrivals', 'best-sellers', 'on-sale'] as const
type HardcodedCollection = (typeof HARDCODED_COLLECTIONS)[number]

function isHardcodedCollection(slug: string): slug is HardcodedCollection {
  return HARDCODED_COLLECTIONS.includes(slug as any)
}

// ═══════════════════════════════════════════════════════════
// CONSTANTS FROM SITE CONFIG
// ═══════════════════════════════════════════════════════════
const GENDER_VALUES = getGenderOptions().map((g) => g.value)
const DEPARTMENT_VALUES = getDepartments().map((d) => d.value)
const GENDER_LABELS = Object.fromEntries(getGenderOptions().map((g) => [g.value, g.label]))
const DEPARTMENT_LABELS = Object.fromEntries(getDepartments().map((d) => [d.value, d.label]))
const IS_MULTI_GENDER = SITE_CONFIG.useGenderFiltering && !SITE_CONFIG.singleGender
const FIXED_GENDER = SITE_CONFIG.singleGender || null

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════
interface Props {
  params: Promise<{ slug?: string[] | undefined }>
  searchParams?: Promise<{ sort?: string; brand?: string; page?: string }>
}

type RouteType =
  | 'all'
  | 'gender'
  | 'gender-department'
  | 'gender-department-category'
  | 'gender-collection'
  | 'department'
  | 'department-category'
  | 'collection-or-brand'
  | 'brand-department'
  | 'hardcoded-collection'

interface ParsedRoute {
  type: RouteType
  gender?: string
  department?: string
  categorySlug?: string
  collectionSlug?: string
  brandSlug?: string
  collectionOrBrandSlug?: string
  hardcodedCollection?: HardcodedCollection
}

interface Breadcrumb {
  label: string
  href: string
  current?: boolean
}

// ═══════════════════════════════════════════════════════════
// ROUTE PARSER
// ═══════════════════════════════════════════════════════════
function parseSlug(slug: string[]): ParsedRoute {
  const [seg1, seg2, seg3] = slug

  if (!seg1) return { type: 'all', gender: FIXED_GENDER || undefined }

  if (!IS_MULTI_GENDER) {
    const isDepartment = DEPARTMENT_VALUES.includes(seg1)
    const isHardcoded = isHardcodedCollection(seg1)

    if (isHardcoded && !seg2) {
      return {
        type: 'hardcoded-collection',
        hardcodedCollection: seg1,
        gender: FIXED_GENDER || undefined,
      }
    }
    if (isDepartment && !seg2) {
      return { type: 'department', department: seg1, gender: FIXED_GENDER || undefined }
    }
    if (isDepartment && seg2) {
      return {
        type: 'department-category',
        department: seg1,
        categorySlug: seg2,
        gender: FIXED_GENDER || undefined,
      }
    }
    if (!isDepartment && !isHardcoded && seg2 && DEPARTMENT_VALUES.includes(seg2)) {
      return {
        type: 'brand-department',
        brandSlug: seg1,
        department: seg2,
        gender: FIXED_GENDER || undefined,
      }
    }
    if (!isDepartment && !isHardcoded && !seg2) {
      return {
        type: 'collection-or-brand',
        collectionOrBrandSlug: seg1,
        gender: FIXED_GENDER || undefined,
      }
    }
    return { type: 'all', gender: FIXED_GENDER || undefined }
  }

  const isGender = GENDER_VALUES.includes(seg1)
  const isDepartmentSeg1 = DEPARTMENT_VALUES.includes(seg1)
  const isHardcodedSeg1 = isHardcodedCollection(seg1)

  if (isHardcodedSeg1 && !seg2) return { type: 'hardcoded-collection', hardcodedCollection: seg1 }
  if (isGender && !seg2) return { type: 'gender', gender: seg1 }
  if (isGender && DEPARTMENT_VALUES.includes(seg2) && !seg3)
    return { type: 'gender-department', gender: seg1, department: seg2 }
  if (isGender && DEPARTMENT_VALUES.includes(seg2) && seg3)
    return {
      type: 'gender-department-category',
      gender: seg1,
      department: seg2,
      categorySlug: seg3,
    }
  if (isGender && seg2 && isHardcodedCollection(seg2))
    return { type: 'hardcoded-collection', hardcodedCollection: seg2, gender: seg1 }
  if (isGender && seg2 && !DEPARTMENT_VALUES.includes(seg2) && !isHardcodedCollection(seg2))
    return { type: 'gender-collection', gender: seg1, collectionSlug: seg2 }
  if (isDepartmentSeg1 && !seg2) return { type: 'department', department: seg1 }
  if (isDepartmentSeg1 && seg2)
    return { type: 'department-category', department: seg1, categorySlug: seg2 }
  if (!isGender && !isDepartmentSeg1 && !isHardcodedSeg1) {
    if (!seg2) return { type: 'collection-or-brand', collectionOrBrandSlug: seg1 }
    if (DEPARTMENT_VALUES.includes(seg2))
      return { type: 'brand-department', brandSlug: seg1, department: seg2 }
  }

  return { type: 'all' }
}

// ═══════════════════════════════════════════════════════════
// HARDCODED COLLECTION HANDLER
// ═══════════════════════════════════════════════════════════
function applyHardcodedCollection(
  collection: HardcodedCollection,
  conditions: any[],
): { sortOrder: string; title: string; description: string } {
  switch (collection) {
    case 'new-arrivals':
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      conditions.push({ createdAt: { greater_than: thirtyDaysAgo.toISOString() } })
      return {
        sortOrder: '-createdAt',
        title: 'New Arrivals',
        description: 'Check out our latest products from the last 30 days',
      }
    case 'best-sellers':
      conditions.push({ totalSales: { greater_than: 0 } })
      return {
        sortOrder: '-totalSales',
        title: 'Best Sellers',
        description: 'Our most popular products',
      }
    case 'on-sale':
      conditions.push({ onSale: { equals: true } })
      return { sortOrder: '-createdAt', title: 'Sale', description: 'Products currently on sale' }
  }
}

// ═══════════════════════════════════════════════════════════
// TITLE BUILDER
// ═══════════════════════════════════════════════════════════
function buildPageTitle(
  route: ParsedRoute,
  extra?: {
    categoryTitle?: string
    brandName?: string
    collectionTitle?: string
    count?: number
    hardcodedTitle?: string
  },
): string {
  const parts: string[] = []
  if (IS_MULTI_GENDER && route.gender) parts.push(GENDER_LABELS[route.gender] || route.gender)
  if (extra?.hardcodedTitle) parts.push(extra.hardcodedTitle)
  if (extra?.brandName) parts.push(extra.brandName)
  if (route.department) parts.push(DEPARTMENT_LABELS[route.department] || route.department)
  if (extra?.categoryTitle) parts.push(extra.categoryTitle)
  if (extra?.collectionTitle) parts.push(extra.collectionTitle)
  const title = parts.join(' › ') || 'All Products'
  return extra?.count !== undefined ? `${title} (${extra.count})` : title
}

// ═══════════════════════════════════════════════════════════
// METADATA
// ═══════════════════════════════════════════════════════════
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug = [] } = await params
  const route = parseSlug(slug)
  const title = buildPageTitle(route)
  return {
    title: `${title} | ${SITE_CONFIG.name}`,
    description: `Browse ${title.toLowerCase()} at ${SITE_CONFIG.name}`,
    openGraph: {
      title: `${title} | ${SITE_CONFIG.name}`,
      description: `Browse ${title.toLowerCase()} at ${SITE_CONFIG.name}`,
    },
  }
}

// ═══════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════
export default async function ShopPage({ params, searchParams }: Props) {
  const { slug = [] } = await params
  const { sort, brand: brandParam, page: pageParam } = (await searchParams) || {}
  const page = Math.max(1, parseInt(pageParam || '1', 10))
  const LIMIT = 6

  const payload = await getPayload({ config })
  const route = parseSlug(slug)

  const baseConditions: any[] = [{ _status: { equals: 'published' } }]

  if (route.gender) {
    baseConditions.push({ gender: { equals: route.gender } })
  }
  if (route.department) {
    baseConditions.push({ 'categories.department': { equals: route.department } })
  }

  let sortOrder = sort || '-createdAt'
  let category: any = null
  let colData: any = null
  let resolvedBrand: any = null
  let hardcodedCollectionInfo: any = null

  if (route.hardcodedCollection) {
    hardcodedCollectionInfo = applyHardcodedCollection(route.hardcodedCollection, baseConditions)
    sortOrder = sort || hardcodedCollectionInfo.sortOrder
  }

  const brandSlugToResolve = route.brandSlug || brandParam
  if (brandSlugToResolve) {
    const brandResult = await payload.find({
      collection: 'brands',
      where: { slug: { equals: brandSlugToResolve } },
      limit: 1,
    })
    resolvedBrand = brandResult.docs[0] || null
    if (route.type === 'brand-department' && !resolvedBrand) return notFound()
    if (resolvedBrand) {
      baseConditions.push({ brand: { equals: resolvedBrand.id } })
    }
  }

  if (route.categorySlug) {
    const categoryResult = await payload.find({
      collection: 'categories',
      where: { slug: { equals: route.categorySlug } },
      depth: 2,
      limit: 1,
    })
    category = categoryResult.docs[0]
    if (!category) return notFound()

    const childCategories = await payload.find({
      collection: 'categories',
      where: { parent: { equals: category.id } },
      depth: 0,
      limit: 100,
    })
    const categoryIds = [category.id, ...childCategories.docs.map((c) => c.id)]
    baseConditions.push({ categories: { in: categoryIds } })
  }

  if (route.type === 'gender-collection' && route.collectionSlug) {
    const colResult = await payload.find({
      collection: 'col',
      where: { slug: { equals: route.collectionSlug } },
      depth: 2,
      limit: 1,
    })
    colData = colResult.docs[0]
    if (!colData) return notFound()
    applyColRules(colData, baseConditions)
  }

  if (route.type === 'collection-or-brand' && route.collectionOrBrandSlug) {
    const ambiguousSlug = route.collectionOrBrandSlug
    const colResult = await payload.find({
      collection: 'col',
      where: { slug: { equals: ambiguousSlug } },
      depth: 2,
      limit: 1,
    })
    if (colResult.docs[0]) {
      colData = colResult.docs[0]
      applyColRules(colData, baseConditions)
    } else {
      const brandResult = await payload.find({
        collection: 'brands',
        where: { slug: { equals: ambiguousSlug } },
        limit: 1,
      })
      if (brandResult.docs[0]) {
        resolvedBrand = brandResult.docs[0]
        baseConditions.push({ brand: { equals: resolvedBrand.id } })
      } else {
        return notFound()
      }
    }
  }

  const products = await payload.find({
    collection: 'products',
    where: baseConditions.length > 1 ? { and: baseConditions } : baseConditions[0],
    sort: sortOrder,
    depth: 2,
    limit: LIMIT,
    page,
  })

  const currentPage = Math.max(1, parseInt((await searchParams)?.page || '1', 10))
  const basePath = `/shop${slug.length ? `/${slug.join('/')}` : ''}`
  const currentSearchParams = Object.fromEntries(
    Object.entries({ sort, brand: brandParam }).filter(([, v]) => Boolean(v)) as [string, string][],
  )

  const pageTitle = buildPageTitle(route, {
    categoryTitle: category?.title,
    brandName: resolvedBrand?.name,
    collectionTitle: colData?.title,
    hardcodedTitle: hardcodedCollectionInfo?.title,
    count: products.totalDocs,
  })

  // ── Breadcrumbs ───────────────────────────────────────────
  const breadcrumbs: Breadcrumb[] = [{ label: 'Shop', href: '/shop' }]

  if (IS_MULTI_GENDER && route.gender) {
    breadcrumbs.push({ label: GENDER_LABELS[route.gender], href: `/shop/${route.gender}` })
  }
  if (hardcodedCollectionInfo) {
    const href =
      IS_MULTI_GENDER && route.gender
        ? `/shop/${route.gender}/${route.hardcodedCollection}`
        : `/shop/${route.hardcodedCollection}`
    breadcrumbs.push({
      label: hardcodedCollectionInfo.title,
      href,
      current: !route.department && !category,
    })
  }
  if (resolvedBrand && route.brandSlug) {
    const href =
      IS_MULTI_GENDER && route.gender
        ? `/shop/${route.gender}/${route.brandSlug}`
        : `/shop/${route.brandSlug}`
    breadcrumbs.push({ label: resolvedBrand.name, href })
  }
  if (route.department) {
    let deptHref = ''
    if (IS_MULTI_GENDER && route.gender) deptHref = `/shop/${route.gender}/${route.department}`
    else if (route.brandSlug) deptHref = `/shop/${route.brandSlug}/${route.department}`
    else deptHref = `/shop/${route.department}`
    breadcrumbs.push({
      label: DEPARTMENT_LABELS[route.department] || route.department,
      href: deptHref,
    })
  }
  if (category) breadcrumbs.push({ label: category.title, href: '#', current: true })
  if (colData) breadcrumbs.push({ label: colData.title, href: '#', current: true })
  if (resolvedBrand && !route.brandSlug)
    breadcrumbs.push({ label: resolvedBrand.name, href: '#', current: true })

  // ── Render ────────────────────────────────────────────────
  return (
    <div>
      {/* Breadcrumbs — outside layout so they always show full-width */}
      <nav className="flex items-center gap-2 text-sm mb-6 flex-wrap px-4 sm:px-0">
        {breadcrumbs.map((crumb, index) => (
          <div key={index} className="flex items-center gap-2">
            {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            {crumb.current || index === breadcrumbs.length - 1 ? (
              <span className="font-medium">{crumb.label}</span>
            ) : (
              <Link
                href={crumb.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </div>
        ))}
      </nav>

      <ShopLayouts
        sidebar={
          <Categories
            slug={route.categorySlug}
            gender={route.gender}
            department={route.department}
          />
        }
        mobileCategoryBar={
          <Categories
            slug={route.categorySlug}
            gender={route.gender}
            department={route.department}
            mobileHorizontal
          />
        }
        header={
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-semibold">{pageTitle}</h1>
            <Suspense>
              <SortSelect />
            </Suspense>
          </div>
        }
        description={
          colData?.description || hardcodedCollectionInfo?.description ? (
            <p className="text-muted-foreground mb-8 max-w-2xl">
              {colData?.description || hardcodedCollectionInfo?.description}
            </p>
          ) : undefined
        }
      >
        {/* ── Product grid ─────────────────────────────────────
            Mobile:  2 cols, no gap, edge-to-edge (-mx-4)
            Desktop: 3 cols, with gap
        */}
        <div className="-mx-4 sm:mx-0 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-0 sm:gap-4">
          {products.docs.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={products.totalPages} // payload returns this
          basePath={basePath}
          searchParams={currentSearchParams}
        />

        {products.docs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <p className="text-xl font-medium mb-2">No products found</p>
            <p className="text-muted-foreground">Try adjusting your filters or check back later</p>
            <Link href="/shop" className="mt-4 text-sm text-primary hover:underline">
              Browse all products
            </Link>
          </div>
        )}
      </ShopLayouts>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════
function applyColRules(col: any, conditions: any[]) {
  if (col.type === 'manual') {
    const productIds = col.products
      ?.map((p: any) => (typeof p === 'object' ? p.id : p))
      .filter(Boolean)
    if (productIds?.length) conditions.push({ id: { in: productIds } })
    return
  }
  if (col.type === 'dynamic' && col.dynamicRules) {
    const rules = col.dynamicRules
    if (rules.categories?.length)
      conditions.push({
        categories: { in: rules.categories.map((c: any) => (typeof c === 'object' ? c.id : c)) },
      })
    if (rules.brands?.length)
      conditions.push({
        brand: { in: rules.brands.map((b: any) => (typeof b === 'object' ? b.id : b)) },
      })
    if (rules.gender?.length) conditions.push({ gender: { in: rules.gender } })
    if (rules.onSale) conditions.push({ onSale: { equals: true } })
    if (rules.minPrice) conditions.push({ priceInNGN: { greater_than_equal: rules.minPrice } })
    if (rules.maxPrice) conditions.push({ priceInNGN: { less_than_equal: rules.maxPrice } })
  }
}
