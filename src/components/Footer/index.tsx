// components/Footer/index.tsx
import type { Footer } from '@/payload-types'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { SITE_CONFIG } from 'site.config'
import { FooterClient } from './index.client'

export async function Footer() {
  const footer: Footer = await getCachedGlobal('footer', 1)()

  // ═══════════════════════════════════════════════════════════
  // BUILD COLLECTIONS LIST
  // ═══════════════════════════════════════════════════════════
  const collectionLinks: Array<{ label: string; url: string }> = []

  // Add hardcoded collections if enabled
  if (footer.collections?.showHardcodedCollections) {
    collectionLinks.push(
      { label: 'New Arrivals', url: '/shop/new-arrivals' },
      { label: 'Best Sellers', url: '/shop/best-sellers' },
    )
  }

  // Add custom collections from Col
  if (footer.collections?.customCollections) {
    const customCollections = footer.collections.customCollections
      .map((col) => {
        if (typeof col === 'object' && col.slug && col.title) {
          return {
            label: col.title,
            url: `/shop/${col.slug}`,
          }
        }
        return null
      })
      .filter(Boolean) as Array<{ label: string; url: string }>

    collectionLinks.push(...customCollections)
  }

  // ═══════════════════════════════════════════════════════════
  // BUILD CONTACT LINKS
  // ═══════════════════════════════════════════════════════════
  const contactDetails = [
    footer.contact?.email && {
      icon: 'mail' as const,
      text: footer.contact.email,
      link: `mailto:${footer.contact.email}`,
      type: 'email' as const,
    },
    footer.contact?.phone && {
      icon: 'phone' as const,
      text: footer.contact.phone,
      link: `tel:${footer.contact.phone}`,
      type: 'phone' as const,
    },
    footer.contact?.hours && {
      icon: 'clock' as const,
      text: footer.contact.hours,
      type: 'text' as const,
    },
  ].filter(Boolean) as Array<{
    icon: 'mail' | 'phone' | 'clock'
    text: string
    link?: string
    type: 'email' | 'phone' | 'text'
  }>

  const socialLinks = (footer.contact?.socialLinks || []).map((social) => ({
    platform: social.platform,
    url: social.url,
  }))

  // ═══════════════════════════════════════════════════════════
  // BUILD INFORMATION LINKS
  // ═══════════════════════════════════════════════════════════
  const informationLinks = (footer.informationLinks?.links || []).map((link) => ({
    label: link.label,
    url: link.url,
  }))

  // ═══════════════════════════════════════════════════════════
  // RENDER CLIENT COMPONENT
  // ═══════════════════════════════════════════════════════════
  return (
    <FooterClient
      newsletter={{
        enabled: footer.newsletter?.enabled ?? true,
        title: footer.newsletter?.title || 'Newsletter',
        description:
          footer.newsletter?.description ||
          'Join our newsletter to receive exclusive deals and early access.',
      }}
      informationLinks={{
        title: footer.informationLinks?.title || 'Information',
        links: informationLinks,
      }}
      collectionsLinks={{
        title: footer.collections?.title || 'Collections',
        links: collectionLinks,
      }}
      contact={{
        title: footer.contact?.title || 'Contact',
        details: contactDetails,
        socialLinks,
      }}
      bottomBar={{
        copyrightText: footer.bottomBar?.copyrightText || 'All rights reserved.',
        tagline: footer.bottomBar?.tagline,
        storeName: SITE_CONFIG.name,
      }}
    />
  )
}
