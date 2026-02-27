// collections/globals/hooks/revalidateFooter.ts
import type { GlobalAfterChangeHook } from 'payload'

export const revalidateFooter: GlobalAfterChangeHook = async ({ doc, req }) => {
  const { payload } = req

  // Only run on server
  if (typeof window === 'undefined') {
    try {
      const { revalidatePath, revalidateTag } = await import('next/cache')

      // Revalidate all pages since footer appears on every page
      revalidatePath('/', 'layout')
      
      // Or use tags for more granular control
      revalidateTag('footer')

      payload.logger.info('Footer revalidated successfully')
    } catch (error) {
      payload.logger.error(`Failed to revalidate footer: ${error}`)
    }
  }

  return doc
}