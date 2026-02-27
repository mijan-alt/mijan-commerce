'use client'

import { Media as MediaComponent } from '@/components/Media'
import type { Media } from '@/payload-types'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/utilities/cn'

type GalleryItem = {
  image: Media
}

export function Gallery({
  gallery,
  layout = 'desktop',
}: {
  gallery: GalleryItem[]
  layout?: 'desktop' | 'mobile'
}) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!gallery?.length) return null

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? gallery.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === gallery.length - 1 ? 0 : prev + 1))
  }

  if (layout === 'mobile') {
    return (
      <div className="relative">
        {/* Main Image - Full bleed */}
        <div className="relative aspect-square w-full bg-neutral-100">
          <MediaComponent
            resource={gallery[currentIndex].image}
            fill
            imgClassName="object-cover"
            priority
          />

          {/* Navigation arrows */}
          {gallery.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg transition hover:bg-white"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg transition hover:bg-white"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Image counter */}
          <div className="absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
            {currentIndex + 1} / {gallery.length}
          </div>
        </div>

        {/* Horizontal thumbnail strip */}
        {gallery.length > 1 && (
          <div className="container">
            <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide">
              {gallery.map((item, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    'relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition',
                    index === currentIndex
                      ? 'border-black'
                      : 'border-transparent opacity-60 hover:opacity-100',
                  )}
                >
                  <MediaComponent
                    resource={item.image}
                    fill
                    imgClassName="object-cover"
                  
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Desktop layout - vertical thumbnails
  return (
    <div className="flex gap-4">
      {/* Vertical thumbnails */}
      {gallery.length > 1 && (
        <div className="flex flex-col gap-3 overflow-y-auto max-h-[600px] scrollbar-thin">
          {gallery.map((item, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border-2 transition',
                index === currentIndex
                  ? 'border-black'
                  : 'border-transparent opacity-60 hover:opacity-100',
              )}
            >
              <MediaComponent
                resource={item.image}
                fill
                imgClassName="object-cover"
              
              />
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <div className="relative flex-1 overflow-hidden rounded-2xl bg-neutral-100">
        <div className="relative aspect-square">
          <MediaComponent
            resource={gallery[currentIndex].image}
            fill
            imgClassName="object-cover"
            priority
          />

          {/* Navigation arrows - only show on hover */}
          {gallery.length > 1 && (
            <div className="absolute inset-0 flex items-center justify-between opacity-0 transition hover:opacity-100 px-4">
              <button
                onClick={handlePrevious}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg transition hover:bg-white hover:scale-110"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={handleNext}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg transition hover:bg-white hover:scale-110"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          )}

          {/* Image counter */}
          <div className="absolute bottom-4 right-4 rounded-full bg-black/60 px-4 py-2 text-sm font-medium text-white">
            {currentIndex + 1} / {gallery.length}
          </div>
        </div>
      </div>
    </div>
  )
}