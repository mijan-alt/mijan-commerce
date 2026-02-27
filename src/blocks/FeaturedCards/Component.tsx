// components/blocks/FeaturedCards.tsx
import { FeaturedCardsProps } from '@/payload-types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { SITE_CONFIG, getDepartments } from 'site.config'
import Image from 'next/image'
import Link from 'next/link'

const IS_MULTI_GENDER = SITE_CONFIG.useGenderFiltering && !SITE_CONFIG.singleGender

// ⭐ Shared URL builder — same logic as Hero and ProductCarousel
function buildUrlFromCol(col: any): string {
  if (!col?.slug) return '/shop'

  const colSlug = col.slug
  const rules = col.type === 'dynamic' ? col.dynamicRules : null

  const firstGender = rules?.gender?.[0] || null
  const firstCategory = rules?.categories?.[0]
  const firstBrand = rules?.brands?.[0]

  const categorySlug =
    firstCategory && typeof firstCategory === 'object' ? firstCategory.slug : null
  const categoryDept =
    firstCategory && typeof firstCategory === 'object' ? firstCategory.department : null
  const brandSlug =
    firstBrand && typeof firstBrand === 'object' ? firstBrand.slug : null

  if (IS_MULTI_GENDER) {
    if (firstGender && categoryDept && categorySlug)
      return `/shop/${firstGender}/${categoryDept}/${categorySlug}`
    if (firstGender && categorySlug)
      return `/shop/${firstGender}/${categorySlug}`
    if (firstGender)
      return `/shop/${firstGender}/${colSlug}`
    if (brandSlug)
      return `/shop/${brandSlug}`
    return `/shop/${colSlug}`
  }

  // Single-gender — gender never in URL
  if (categoryDept && categorySlug) return `/shop/${categoryDept}/${categorySlug}`
  if (categorySlug) return `/shop/${categorySlug}`
  if (brandSlug) return `/shop/${brandSlug}`
  return `/shop/${colSlug}`
}

export async function FeaturedCards(props: FeaturedCardsProps) {
  const { cards } = props
  const payload = await getPayload({ config: configPromise })

  // Resolve all card collections in parallel
  const resolvedCards = await Promise.all(
    cards.map(async (card) => {
      if (!card.linkedCollection) return { ...card, href: '/shop' }

      const colData =
        typeof card.linkedCollection === 'object' && (card.linkedCollection as any).slug
          ? card.linkedCollection
          : await payload.findByID({
              collection: 'col',
              id: typeof card.linkedCollection === 'object'
                ? (card.linkedCollection as any).id
                : card.linkedCollection,
              depth: 2,
            })

      return {
        ...card,
        href: buildUrlFromCol(colData),
      }
    }),
  )

  const gridCols = cards.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2'

  return (
    <section className="w-full py-3 px-2 md:px-4">
      <div className={`grid grid-cols-1 ${gridCols} gap-3`}>
        {resolvedCards.map((card, index) => {
          const image = card.image && typeof card.image === 'object' ? card.image : null

          return (
            <Link
              key={index}
              href={card.href}
              className="group relative aspect-square overflow-hidden bg-gray-100"
            >
              {image?.url && (
                <Image
                  src={image.url}
                  alt={card.headline}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}

              <div className="absolute bottom-0 left-0 p-6 md:p-8 z-10">
                {card.label && (
                  <p className="text-white text-sm md:text-base font-medium mb-1">{card.label}</p>
                )}
                <h3 className="text-white text-2xl md:text-3xl font-bold mb-4 max-w-xs">
                  {card.headline}
                </h3>
                <button className="bg-white text-black px-6 py-2.5 rounded-full text-sm md:text-base font-medium hover:bg-gray-200 transition-colors">
                  Shop
                </button>
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
            </Link>
          )
        })}
      </div>
    </section>
  )
}