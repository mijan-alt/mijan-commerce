import { Media } from '@/components/Media'
import type { Media as MediaType, Product } from '@/payload-types'
import Link from 'next/link'

interface ProductCardProps {
  product: Product
  showCategory?: boolean | null
  showDescription?: boolean | null
  className?: string
}

export const ProductCard = ({
  product,
  showCategory = true,
  showDescription,
  className = '',
}: ProductCardProps) => {
  const image = (product.gallery?.[0]?.image ||
    product.meta?.image) as MediaType | undefined

  const category =
    Array.isArray(product.categories) && product.categories.length > 0
      ? typeof product.categories[0] === 'object'
        ? product.categories[0].title
        : null
      : null

  const regularPrice = product.priceInNGN
  const isOnSale = product.onSale && product.salePriceInNGN
  const salePrice = product.salePriceInNGN

  return (
    <Link
      href={`/products/${product.slug}`}
      className={`block h-full w-full ${className}`}
    >
      <div className="group flex h-full flex-col overflow-hidden border border-border transition-all hover:shadow-lg bg-background">
        {/* Image */}
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          {image?.url ? (
            <Media
              resource={image}
              fill
              imgClassName="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-sm text-muted-foreground">
                No image
              </span>
            </div>
          )}

          {/* Sale Badge */}
          {isOnSale && (
            <div className="absolute left-3 top-3 bg-black text-white text-xs px-2 py-1">
              Sale
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-4">
          {showCategory && category && (
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {category}
            </p>
          )}

          <h3 className="font-medium leading-tight line-clamp-2 text-sm sm:text-base">
            {product.title}
          </h3>

          {showDescription && product.meta?.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.meta.description}
            </p>
          )}

          {/* Pricing */}
          <div className="mt-auto pt-2 flex items-center gap-2">
            {isOnSale ? (
              <>
                <p className="text-base sm:text-lg font-semibold text-red-600">
                  ₦{salePrice?.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground line-through">
                  ₦{regularPrice?.toLocaleString()}
                </p>
              </>
            ) : (
              <p className="text-base sm:text-lg font-semibold">
                ₦{regularPrice?.toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}