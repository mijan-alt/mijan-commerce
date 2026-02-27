'use client'
import type { Product, Variant } from '@/payload-types'

import { AddToCart } from '@/components/Cart/AddToCart'
import { Price } from '@/components/Price'
import { RichText } from '@/components/RichText'
import { Suspense } from 'react'

import { StockIndicator } from '@/components/product/StockIndicator'
import { Button } from '@/components/ui/button'
import { useCurrency } from '@payloadcms/plugin-ecommerce/client/react'
import { Heart } from 'lucide-react'
import { ShareProductButton } from './ShareProductButton'
import { VariantSelector } from './VariantSelector'
import { WhatsAppEnquiry } from '../Whatsapp/WhatsappEnquiry'

export function ProductDescription({ product  , whatsappNumber,}: { product: Product, whatsappNumber: string | null }) {
  const { currency } = useCurrency()
 const productUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/products/${product.slug}`


  let amount = 0,
    lowestAmount = 0,
    highestAmount = 0

  const priceField = `priceInNGN` as keyof Product
  const salePriceField = `salePriceInNGN` as keyof Product
  const hasVariants = product.enableVariants && Boolean(product.variants?.docs?.length)

  // priceInNGN is always the original price — salePriceInNGN is the computed discount
  const isOnSale = !hasVariants && product.onSale && typeof product[salePriceField] === 'number'
  const saleAmount = isOnSale ? (product[salePriceField] as number) : null

  if (hasVariants) {
    const variantPriceField = `priceIn${currency.code}` as keyof Variant
    const variantsOrderedByPrice = product.variants?.docs
      ?.filter((variant) => variant && typeof variant === 'object')
      .sort((a, b) => {
        if (
          typeof a === 'object' &&
          typeof b === 'object' &&
          variantPriceField in a &&
          variantPriceField in b &&
          typeof a[variantPriceField] === 'number' &&
          typeof b[variantPriceField] === 'number'
        ) {
          return a[variantPriceField] - b[variantPriceField]
        }
        return 0
      }) as Variant[]

    const lowestVariant = variantsOrderedByPrice[0][variantPriceField]
    const highestVariant =
      variantsOrderedByPrice[variantsOrderedByPrice.length - 1][variantPriceField]
    if (
      variantsOrderedByPrice &&
      typeof lowestVariant === 'number' &&
      typeof highestVariant === 'number'
    ) {
      lowestAmount = lowestVariant
      highestAmount = highestVariant
    }
  } else if (typeof product[priceField] === 'number') {
    amount = product[priceField] as number
  }

  return (
    <div className="sticky top-24 flex flex-col gap-6">
      {/* Brand */}
      {product.brand && typeof product.brand === 'object' && (
        <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {product.brand.name}
        </div>
      )}

      {/* Title and Price */}
      <div className="space-y-2">
        <h1 className="text-3xl lg:text-4xl font-medium tracking-tight">{product.title}</h1>

        <div className="flex items-center gap-3">
          {hasVariants ? (
            <Price
              className="text-2xl font-semibold"
              highestAmount={highestAmount}
              lowestAmount={lowestAmount}
            />
          ) : isOnSale && saleAmount ? (
            <>
              {/* saleAmount is the discounted price */}
              <Price className="text-2xl font-semibold text-red-600" amount={saleAmount} />
              {/* amount is priceInNGN — always the original, never mutated */}
              <Price
                className="text-lg font-medium text-muted-foreground line-through"
                amount={amount}
              />
              <span className="rounded bg-black px-2 py-0.5 text-xs font-medium text-white">
                Sale
              </span>
            </>
          ) : (
            <Price className="text-2xl font-semibold" amount={amount} />
          )}
        </div>
      </div>

      {/* Stock Status */}
      <Suspense>
        <StockIndicator product={product} />
      </Suspense>

      <div className="h-px bg-border" />

      {/* Description */}
      {product.description ? (
        <div className="prose prose-sm max-w-none">
          <RichText data={product.description} enableGutter={false} />
        </div>
      ) : null}

      {/* Variants */}
      {hasVariants && (
        <>
          <div className="h-px bg-border" />
          <Suspense fallback={null}>
            <VariantSelector product={product} />
          </Suspense>
        </>
      )}

      <div className="h-px bg-border" />

      {/* Action Buttons */}
      <div className="space-y-3">
        <Suspense fallback={<div>loading</div>}>
          <AddToCart product={product} />
        </Suspense>

          {whatsappNumber && (
    <WhatsAppEnquiry
      productTitle={product.title}
      productUrl={productUrl}
      phoneNumber={whatsappNumber}
    />
  )}

        <div className="flex gap-3">
          <Button variant="outline" size="lg" className="flex-1">
            <Heart className="mr-2 h-5 w-5" />
            Favorite
          </Button>
          <ShareProductButton product={product} />
        </div>
      </div>

      {/* Product Details */}
      <div className="space-y-4 rounded-lg bg-muted/50 p-6">
        <h3 className="font-medium">Product Details</h3>
        <dl className="space-y-2 text-sm">
          {product.categories && Array.isArray(product.categories) && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Category</dt>
              <dd className="font-medium">
                {product.categories
                  .map((cat) => (typeof cat === 'object' ? cat.title : ''))
                  .filter(Boolean)
                  .join(', ')}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Free Shipping Banner */}
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:bg-green-900/10 dark:text-green-400">
        <p className="font-medium">✓ Free shipping on orders over ₦50,000</p>
        <p className="mt-1 text-xs opacity-80">Estimated delivery: 3-5 business days</p>
      </div>
    </div>
  )
}
