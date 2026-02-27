'use client'
import { Media as MediaComponent } from '@/components/Media'
import type { Product } from '@/payload-types'
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

interface ProductCarouselClientProps {
  products: Product[]
  showHeader?: boolean | null
  tagline?: string | null
  title?: string | null
  ctaText?: string | null
  ctaLink?: string | null
  showCategory?: boolean | null
  carouselSpeed?: number | null
}

export const ProductCarouselClient: React.FC<ProductCarouselClientProps> = ({
  products,
  showHeader,
  tagline,
  title,
  ctaText,
  ctaLink,
  showCategory = true,
  carouselSpeed = 1,
}) => {
  if (!products?.length) return null

  // Duplicate products for infinite loop effect
  const carouselProducts = [...products, ...products, ...products]

  // Safely handle carousel speed - convert null to undefined
  const safeCarouselSpeed = carouselSpeed ?? undefined

  // Product Card Component
  const ProductCard = ({ product }: { product: Product }) => {
    const image =
      product.meta?.image && typeof product.meta.image === 'object'
        ? product.meta.image
        : product.gallery?.[0]?.image

    const category =
      Array.isArray(product.categories) && product.categories.length > 0
        ? typeof product.categories[0] === 'object'
          ? product.categories[0].title
          : null
        : null

    const price = product.priceInNGN

    return (
      <Link href={`/products/${product.slug}`} className="block h-full w-full">
        <div className="group flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:shadow-lg">
          {/* Image */}
          <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
            {image  && (
              <MediaComponent
                resource={image}
                fill
                imgClassName="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) }
          </div>

          {/* Content */}
          <div className="flex flex-col gap-1">
            {showCategory && category && (
              <p className="text-xs uppercase text-muted-foreground">{category}</p>
            )}
            <h3 className="font-medium line-clamp-2">{product.title}</h3>
            <p className="text-lg font-semibold">₦{price?.toLocaleString()}</p>
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
            loop: true,
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
            {carouselProducts.map((product, index) => (
              <CarouselItem
                key={`${product.id}-${index}`}
                className="basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
              >
                <ProductCard product={product} />
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Navigation Arrows */}
          <CarouselPrevious className="hidden md:flex -left-4" />
          <CarouselNext className="hidden md:flex -right-4" />

          {/* Mobile Dots */}
          <div className="mt-6 md:hidden">
            {/* <CarouselDots /> */}
          </div>
        </Carousel>
      </div>
    </section>
  )
}