import { Product } from "@/payload-types"

export function getEffectivePrice(product: Product, currencyCode: string): number {
  const priceField = `priceInNGN` as keyof Product
  const salePriceField = `salePriceInNGN` as keyof Product

  if (product.onSale && typeof product[salePriceField] === 'number') {
    return product[salePriceField] as number
  }

  return product[priceField] as number
}