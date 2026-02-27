// components/blocks/Hero.tsx
import { Media } from '@/components/Media'
import { Button } from '@/components/ui/button'
import { Hero1BlockProps } from '@/payload-types'
import configPromise from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'
import { SITE_CONFIG, getDepartments } from 'site.config'

const IS_MULTI_GENDER = SITE_CONFIG.useGenderFiltering && !SITE_CONFIG.singleGender
const DEPARTMENT_VALUES = getDepartments().map((d) => d.value)

// ═══════════════════════════════════════════════════════════
// BUILD URL FROM COL RULES
// Mirrors parseSlug logic in shop page
// ═══════════════════════════════════════════════════════════
function buildUrlFromCol(col: any): string {
  if (!col?.slug) return '/shop'

  const colSlug = col.slug
  const rules = col.type === 'dynamic' ? col.dynamicRules : null

  // Extract context from dynamic rules
  const firstGender = rules?.gender?.[0] || null
  const firstCategory = rules?.categories?.[0]
  const firstBrand = rules?.brands?.[0]

  const categorySlug =
    firstCategory && typeof firstCategory === 'object' ? firstCategory.slug : null
  const categoryDept =
    firstCategory && typeof firstCategory === 'object' ? firstCategory.department : null
  const brandSlug = firstBrand && typeof firstBrand === 'object' ? firstBrand.slug : null

  if (IS_MULTI_GENDER) {
    // /shop/men/shoes/running-abc123
    if (firstGender && categoryDept && categorySlug) {
      return `/shop/${firstGender}/${categoryDept}/${categorySlug}`
    }
    // /shop/men/running-abc123
    if (firstGender && categorySlug) {
      return `/shop/${firstGender}/${categorySlug}`
    }
    // /shop/men/summer-sale
    if (firstGender) {
      return `/shop/${firstGender}/${colSlug}`
    }
    // /shop/jordan
    if (brandSlug) {
      return `/shop/${brandSlug}`
    }
    // /shop/summer-sale
    return `/shop/${colSlug}`
  }

  // Single-gender — gender never in URL
  // /shop/dresses/midi-abc123
  if (categoryDept && categorySlug) {
    return `/shop/${categoryDept}/${categorySlug}`
  }
  // /shop/running-abc123
  if (categorySlug) {
    return `/shop/${categorySlug}`
  }
  // /shop/jordan
  if (brandSlug) {
    return `/shop/${brandSlug}`
  }
  // /shop/summer-sale
  return `/shop/${colSlug}`
}

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════
export async function Hero1Block(props: Hero1BlockProps) {
  const {
    badge,
    title,
    description,
    buttons = [],
    media,
    overlay = true,
    alignment = 'center',
  } = props

  const payload = await getPayload({ config: configPromise })

  const resolvedButtons = await Promise.all(
    (buttons || []).map(async (button: any) => {
      // Special hardcoded collections — just build the URL directly
      if (button.linkType === 'special' && button.specialCollection) {
        return { ...button, href: `/shop/${button.specialCollection}` }
      }

      // Regular collection
      if (!button?.linkedCollection) return { ...button, href: '/shop' }

      const colId =
        typeof button.linkedCollection === 'object'
          ? button.linkedCollection.id
          : button.linkedCollection

      const colData =
        typeof button.linkedCollection === 'object' && button.linkedCollection.slug
          ? button.linkedCollection
          : await payload.findByID({ collection: 'col', id: colId, depth: 2 })

      return { ...button, href: buildUrlFromCol(colData) }
    }),
  )
  // On mobile, always center. Respect alignment on desktop.
  const desktopAlignmentClasses = {
    left: 'lg:items-start lg:text-left',
    center: 'lg:items-center lg:text-center',
    right: 'lg:items-end lg:text-right',
  }[alignment || 'center']

  return (
    /*
      -mt-[1px] closes any sub-pixel gap between the sticky header border-b
      and this section. Using a negative margin rather than touching the
      layout so other blocks are unaffected.
    */
    <section className="relative h-[calc(100vh-4rem)] w-full overflow-hidden -mt-[54px]">
      {/* Background Media */}
      <div className="absolute inset-0">
        {media &&
          typeof media === 'object' &&
          media.url &&
          (media.mimeType?.startsWith('video/') ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 size-full object-cover"
              poster={media.thumbnailURL || undefined}
            >
              <source src={media.url} type={media.mimeType} />
            </video>
          ) : (
            <Media resource={media} fill priority imgClassName="object-cover" />
          ))}
      </div>

      {/* Overlay */}
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
      )}

      {/* Content — always centered on mobile, alignment-aware on desktop */}
      <div className="relative z-10 flex size-full flex-col items-center  pb-16 px-6 text-center sm:pb-20 justify-center lg:pb-0">
        <div
          className={`flex w-full max-w-3xl flex-col items-center gap-4 text-center ${desktopAlignmentClasses}`}
        >
          {badge && (
            <span className="inline-block rounded-full bg-white/10 px-4 py-1 text-xs font-medium uppercase tracking-widest text-white backdrop-blur-sm">
              {badge}
            </span>
          )}

          {title && (
            <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
              {title}
            </h1>
          )}

          {description && (
            <p className="max-w-xl text-base text-white/85 sm:text-lg md:text-xl leading-relaxed">
              {description}
            </p>
          )}

          {resolvedButtons.length > 0 && (
            <div className="mt-2 flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
              {resolvedButtons.map((button: any, index: number) => {
                if (!button?.label) return null
                const variant = button.variant || (index === 0 ? 'default' : 'outline')

                return (
                  <Button
                    key={index}
                    asChild
                    size="lg"
                    variant={variant}
                    className={
                      variant === 'outline'
                        ? 'w-full sm:w-auto rounded-full px-8 py-5 text-sm font-medium border-white/30 bg-black/20 text-white hover:bg-black/40 hover:text-white backdrop-blur-sm'
                        : 'w-full sm:w-auto rounded-full px-8 py-5 text-sm font-medium'
                    }
                  >
                    <Link href={button.href}>{button.label}</Link>
                  </Button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
