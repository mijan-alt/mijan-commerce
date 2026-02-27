// components/Footer/index.client.tsx
'use client'

// import {zodResolver} from '@hookform/resolvers/zod'
import {
  ChevronUp,
  Clock,
  Facebook,
  Instagram,
  Mail,
  Phone,
  Youtube,
} from 'lucide-react'

import Link from 'next/link'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LogoIcon } from '@/components/icons/logo'
import { cn } from '@/utilities/cn'

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════
type FooterClientProps = {
  newsletter: {
    enabled: boolean
    title: string
    description: string
  }
  informationLinks: {
    title: string
    links: Array<{ label: string; url: string }>
  }
  collectionsLinks: {
    title: string
    links: Array<{ label: string; url: string }>
  }
  contact: {
    title: string
    details: Array<{
      icon: 'mail' | 'phone' | 'clock'
      text: string
      link?: string
      type: 'email' | 'phone' | 'text'
    }>
    socialLinks: Array<{
      platform: string
      url: string
    }>
  }
  bottomBar: {
    copyrightText: string
    tagline: any
    storeName: string
  }
}

const ICON_MAP = {
  mail: Mail,
  phone: Phone,
  clock: Clock,
}

const SOCIAL_ICON_MAP: Record<string, any> = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: (props: any) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
      <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
    </svg>
  ),
  tiktok: (props: any) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  ),
  youtube: Youtube,
}

const newsletterFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type NewsletterFormType = z.infer<typeof newsletterFormSchema>

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
export function FooterClient({
  newsletter,
  informationLinks,
  collectionsLinks,
  contact,
  bottomBar,
}: FooterClientProps) {
  const currentYear = new Date().getFullYear()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="pt-8 pb-8 xl:pt-12 border-t">
      <div className="container space-y-10">
        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-x-16 gap-y-8 md:grid-cols-2 xl:grid-cols-4">
          {/* Newsletter Section */}
          {newsletter.enabled && (
            <div>
              <NewsletterSection {...newsletter} />
            </div>
          )}

          {/* Information Links */}
          <div>
            <FooterLinksSection
              title={informationLinks.title}
              links={informationLinks.links}
            />
          </div>

          {/* Collections Links */}
          <div>
            <FooterLinksSection
              title={collectionsLinks.title}
              links={collectionsLinks.links}
            />
          </div>

          {/* Contact Section */}
          <div>
            <ContactSection {...contact} />
          </div>
        </div>

        {/* Language Selector */}
        <div className="flex justify-between pt-4">
          <div>
            <Select defaultValue="english">
              <SelectTrigger className="w-28">
                <SelectValue placeholder="Select a Language..." />
              </SelectTrigger>
              <SelectContent align="start">
                <SelectGroup>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="français">Français</SelectItem>
                  <SelectItem value="arabic">Arabic</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Logo Divider */}
        <div>
          <div className="flex items-center justify-between gap-4 md:gap-12">
            <Separator className="flex-1" />
            <Link href="/" className="flex items-center gap-2">
              <LogoIcon className="w-8 h-8" />
            </Link>
            <Separator className="flex-1" />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <p className="text-muted-foreground max-md:text-xs">
            © {currentYear} {bottomBar.storeName}
          </p>
          {bottomBar.copyrightText && (
            <>
              <Separator orientation="vertical" className="!h-4 bg-foreground/60 max-sm:hidden" />
              <p className="max-md:text-xs text-muted-foreground">{bottomBar.copyrightText}</p>
            </>
          )}
          {bottomBar.tagline && (
            <>
              <Separator orientation="vertical" className="!h-4 bg-foreground/60 max-sm:hidden" />
              <p className="max-md:text-xs">{bottomBar.tagline}</p>
            </>
          )}
          <Button size="icon" variant="outline" onClick={scrollToTop}>
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </footer>
  )
}

// ═══════════════════════════════════════════════════════════
// NEWSLETTER SECTION
// ═══════════════════════════════════════════════════════════
function NewsletterSection({
  title,
  description,
}: {
  title: string
  description: string
}) {
  const form = useForm<NewsletterFormType>({
    // resolver: zodResolver(newsletterFormSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (data: NewsletterFormType) => {
    try {
      // TODO: Implement newsletter subscription
      console.log('Newsletter subscription:', data)
      form.reset()
    } catch (error) {
      console.error('Newsletter subscription failed:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-3xl leading-none font-medium">{title}</h3>
        <p className="leading-normal font-light text-muted-foreground">{description}</p>
      </div>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <div className="space-y-2">
              <Input
                {...field}
                type="email"
                placeholder="Email Address"
                aria-invalid={fieldState.invalid}
                className={cn(fieldState.invalid && 'border-red-500')}
              />
              {fieldState.error && (
                <p className="text-xs text-red-500">{fieldState.error.message}</p>
              )}
            </div>
          )}
        />
        <Button type="submit" className="w-full">
          Subscribe
        </Button>
      </form>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// FOOTER LINKS SECTION
// ═══════════════════════════════════════════════════════════
function FooterLinksSection({
  title,
  links,
}: {
  title: string
  links: Array<{ label: string; url: string }>
}) {
  if (!links.length) return null

  return (
    <div>
      <h2 className="mb-6 text-sm leading-tight font-medium text-muted-foreground uppercase">
        {title}
      </h2>
      <ul className="space-y-3">
        {links.map((link, index) => (
          <li key={index}>
            <Link
              href={link.url}
              className="text-foreground hover:text-primary underline-offset-4 hover:underline transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// CONTACT SECTION
// ═══════════════════════════════════════════════════════════
function ContactSection({
  title,
  details,
  socialLinks,
}: {
  title: string
  details: Array<{
    icon: 'mail' | 'phone' | 'clock'
    text: string
    link?: string
    type: 'email' | 'phone' | 'text'
  }>
  socialLinks: Array<{
    platform: string
    url: string
  }>
}) {
  return (
    <div>
      <h2 className="mb-6 text-sm leading-tight font-medium text-muted-foreground uppercase">
        {title}
      </h2>
      <div className="space-y-6">
        {/* Contact Details */}
        {details.length > 0 && (
          <ul className="space-y-3">
            {details.map((item, index) => {
              const Icon = ICON_MAP[item.icon]
              return (
                <li className="flex items-center gap-3" key={index}>
                  <Icon className="size-4 shrink-0" />
                  <div className="flex-1">
                    {item.link ? (
                      <a
                        href={item.link}
                        className="underline-offset-4 hover:underline transition-colors"
                      >
                        {item.text}
                      </a>
                    ) : (
                      <p className="text-sm">{item.text}</p>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        {/* Social Links */}
        {socialLinks.length > 0 && (
          <ul className="flex flex-wrap gap-3">
            {socialLinks.map((social, index) => {
              const SocialIcon = SOCIAL_ICON_MAP[social.platform] || Mail
              return (
                <li key={index}>
                  <Button size="icon" variant="outline" asChild>
                    <a href={social.url} target="_blank" rel="noopener noreferrer">
                      <SocialIcon className="h-5 w-5" />
                    </a>
                  </Button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}