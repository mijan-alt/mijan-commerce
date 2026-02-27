'use client'
import { Media as MediaComponent } from '@/components/Media'
import type { Category } from '@/payload-types'
import Link from 'next/link'
import React from 'react'

import {
    Carousel,
    CarouselContent,
      // CarouselDots,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel'
import AutoScroll from 'embla-carousel-auto-scroll'

interface CategoryCarouselClientProps {
  categories: Category[]
  showHeader?: boolean | null
  tagline?: string | null
  title?: string | null
  ctaText?: string | null
  ctaLink?: string | null
  buttonText?: string | null
  carouselSpeed?: number | null
}

// Helper function to build the full category path (same as FeaturedCards)
function buildCategoryPath(category: any): string {
  if (!category?.slug) return ''

  // Get the department from the category
  // Categories have a 'department' field (e.g. 'dresses', 'shoes')
  const department = category.department || category.parent?.department

  if (department) {
    return `${department}/${category.slug}`
  }

  // Fallback: if category IS a department-level item (no parent), just use its slug
  return category.slug
}

export const CategoryCarouselClient: React.FC<CategoryCarouselClientProps> = ({
  categories,
  showHeader,
  tagline,
  title,
  ctaText,
  ctaLink,
  buttonText = 'Shop',
  carouselSpeed = 0,
}) => {
  if (!categories?.length) return null

  // Duplicate categories for infinite loop effect (only if auto-scrolling)
  const carouselCategories =
    carouselSpeed && carouselSpeed > 0 ? [...categories, ...categories, ...categories] : categories

  // Safely handle carousel speed - convert null to undefined
  const safeCarouselSpeed = carouselSpeed ?? undefined

  // Category Card Component
  const CategoryCard = ({ category }: { category: Category }) => {
    const image = category.image && typeof category.image === 'object' ? category.image : null

    // Build the category link using parent traversal
    const categoryPath = buildCategoryPath(category)
    const href = categoryPath ? `/shop/${categoryPath}` : '#'

    return (
      <Link href={href} className="block h-full w-full">
        <div className="group relative aspect-square overflow-hidden rounded-lg bg-muted">
          {/* Background Image */}
          {image && (
            <MediaComponent
              resource={image}
              fill
              imgClassName="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}

          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

          {/* Content Overlay - Bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-4 z-10 flex flex-col items-start">
            {/* Category Title */}
            <h3 className="text-white text-lg font-semibold mb-3 line-clamp-2">{category.title}</h3>

            {/* Shop Button */}
            <button className="bg-white text-black px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors">
              {buttonText}
            </button>
          </div>
        </div>
      </Link>
    )
  }

  // Render Header
  const renderHeader = () => {
    if (!showHeader) return null

    return (
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          {tagline && <p className="text-sm font-medium text-primary">{tagline}</p>}
          {title && <h2 className="text-3xl font-bold md:text-4xl">{title}</h2>}
        </div>
        <div className="flex items-center gap-4">
          {ctaText && ctaLink && (
            <Link
              href={ctaLink}
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {ctaText}
            </Link>
          )}
        </div>
      </div>
    )
  }

  return (
    <section className="w-full py-12 md:py-16">
      <div className="container">
        {renderHeader()}

        <Carousel
          className="w-full"
          opts={{
            align: 'start',
            loop: carouselSpeed && carouselSpeed > 0 ? true : false,
            dragFree: true,
          }}
          plugins={
            safeCarouselSpeed && safeCarouselSpeed > 0
              ? [
                  AutoScroll({
                    playOnInit: true,
                    speed: safeCarouselSpeed,
                    stopOnInteraction: true,
                    stopOnMouseEnter: true,
                  }),
                ]
              : []
          }
        >
          <CarouselContent>
            {carouselCategories.map((category, index) => (
              <CarouselItem
                key={`${category.id}-${index}`}
                className="basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
              >
                <CategoryCard category={category} />
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Navigation Arrows */}
          <CarouselPrevious className="hidden md:flex -left-4" />
          <CarouselNext className="hidden md:flex -right-4" />

          {/* Mobile Dots */}
          {/* <div className="mt-6 md:hidden">
            <CarouselDots />
          </div> */}
        </Carousel>
      </div>
    </section>
  )
}
