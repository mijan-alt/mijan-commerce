import { CollectionAfterChangeHook } from 'payload'

export const updateProductSales: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  req,
}:any) => {
  // Only run on updates
  if (operation !== 'update') return

  // Only run if status changed TO completed
  if (previousDoc?.status === 'completed') return
  if (doc.status !== 'completed') return

  const payload = req.payload

  try {
    for (const item of doc.items || []) {
      const productId =
        typeof item.product === 'object'
          ? item.product.id
          : item.product

      if (!productId) continue

      // Fetch current product
      const product = await payload.findByID({
        collection: 'products',
        id: productId,
      })

      if (!product) continue

      const currentSales = product.totalSales || 0
      const quantity = item.quantity || 0

      // Increment totalSales
      await payload.update({
        collection: 'products',
        id: productId,
        data: {
          totalSales: currentSales + quantity,
        },
      })

      payload.logger.info(
        `Product ${productId} sales increased by ${quantity}`
      )
    }
  } catch (error) {
    payload.logger.error(error, 'Failed updating product sales')
  }
}