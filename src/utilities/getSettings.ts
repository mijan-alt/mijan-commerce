import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'

export const getSettings = unstable_cache(
  async () => {
    const payload = await getPayload({ config: configPromise })
    const settings = await payload.findGlobal({
      slug: 'settings',
      depth: 0,
    })
    return settings
  },
  ['settings'],
  {
    tags: ['settings'],
    revalidate: 3600,
  },
)