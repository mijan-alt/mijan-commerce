// components/Header/index.tsx
import { getCachedGlobal } from '@/utilities/getGlobals'
import config from '@payload-config'
import { getPayload } from 'payload'
import { SITE_CONFIG } from 'site.config'
import { HeaderClient } from './index.client'
import { Suspense } from 'react'
import { OpenCartButton } from '../Cart/OpenCart'
import { Cart } from '../Cart'

export async function Header() {
  const payload = await getPayload({ config })
  const header = await getCachedGlobal('header', 1)()

  const allCategories = await payload.find({
    collection: 'categories',
    depth: 2,
    limit: 500,
    sort: 'title',
  })

  const allBrands = await payload.find({
    collection: 'brands',
    where: { isActive: { equals: true }, featured: { equals: true } },
    limit: 50,
    sort: 'displayOrder',
  })

  // Group categories by department
  const departmentGroups = SITE_CONFIG.departments.map((dept) => {
    const deptCategories = allCategories.docs.filter((cat: any) => cat.department === dept.value)
    return {
      id: dept.value,
      title: dept.label,
      slug: dept.value,
      department: dept.value,
      categories: deptCategories,
    }
  })

  let genderNavigation

  if (SITE_CONFIG.useGenderFiltering) {
    // ── Multi-gender: Nike/Adidas style ──────────────────
    genderNavigation = [
      {
        label: 'New',
        value: 'new',
        isSpecial: true,
        highlights: [
          // ⭐ Col slugs as path segments — resolved by shop page
          { title: 'New Arrivals', href: '/shop/new-arrivals' },
          { title: 'Best Sellers', href: '/shop/best-sellers' },
        ],
        departments: [],
        brands: allBrands.docs,
      },
      ...SITE_CONFIG.genderOptions.map((gender) => ({
        label: gender.label,
        value: gender.value,
        isSpecial: false,
        highlights: [
          // ⭐ Gender as path segment + col slug
          { title: `New in ${gender.label}`, href: `/shop/${gender.value}/new-arrivals` },
          { title: 'Best Sellers', href: `/shop/${gender.value}/best-sellers` },
        ],
        departments: departmentGroups,
        brands: allBrands.docs,
      })),
    ]
  } else {
    // ── Single-gender / unisex ────────────────────────────
    genderNavigation =
      SITE_CONFIG.navigationSections?.map((section) => ({
        label: section.label,
        value: section.value,
        isSpecial: section.collection === 'new-arrivals',
        href: section.collection ? `/shop/${section.collection}` : '/shop',
        highlights: [],
        departments: departmentGroups,
        brands: allBrands.docs,
      })) || []
  }

  return (
    <HeaderClient
      genderNavigation={genderNavigation}
      header={header}
      cartSlot={
        <Suspense fallback={<OpenCartButton />}>
          <Cart />
        </Suspense>
      }
    />
  )
}
