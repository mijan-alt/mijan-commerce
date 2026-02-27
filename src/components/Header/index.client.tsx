'use client'
import { LogoIcon } from '@/components/icons/logo'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import { cn } from '@/utilities/cn'
import { Moon, Sun } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Suspense, useEffect, useRef, useState } from 'react'
import { SITE_CONFIG, getDepartments } from 'site.config'
import type { Header } from 'src/payload-types'
import { MobileMenu } from './MobileMenu'

const DEPARTMENT_VALUES = getDepartments().map((d) => d.value)
const IS_MULTI_GENDER = SITE_CONFIG.useGenderFiltering && !SITE_CONFIG.singleGender

type NavSection = {
  label: string
  value: string
  isSpecial?: boolean
  href?: string
  highlights: any[]
  departments: any[]
  brands: any[]
}

type Props = {
  header: Header
  genderNavigation: NavSection[]
  cartSlot: React.ReactNode
}

export function HeaderClient({ genderNavigation, header, cartSlot }: Props) {
  const pathname = usePathname()
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const [theme, setTheme] = useState<string | null>(null)
  const [activeNav, setActiveNav] = useState<string | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const handleMouseEnter = (value: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setActiveNav(value)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setActiveNav(null), 150)
  }

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setActiveNav(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
  }, [headerTheme, theme])

  // Close on route change
  useEffect(() => {
    setActiveNav(null)
  }, [pathname])

  const toggleTheme = () => {
    const newTheme = headerTheme === 'light' ? 'dark' : 'light'
    setHeaderTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  const getNavLink = (nav: NavSection) => {
    if (nav.href) return nav.href
    if (nav.isSpecial) return '/shop/new-arrivals'
    return `/shop/${nav.value}`
  }

  const getDeptLink = (nav: NavSection, dept: any) => {
    if (nav.href || !IS_MULTI_GENDER) return `/shop/${dept.slug}`
    if (nav.isSpecial) return `/shop/${dept.slug}`
    return `/shop/${nav.value}/${dept.slug}`
  }

  const getCategoryLink = (nav: NavSection, category: any) => {
    const dept = category.department
    if (nav.href || !IS_MULTI_GENDER) {
      return dept ? `/shop/${dept}/${category.slug}` : `/shop/${category.slug}`
    }
    if (nav.isSpecial) {
      return dept ? `/shop/${dept}/${category.slug}` : `/shop/${category.slug}`
    }
    return dept
      ? `/shop/${nav.value}/${dept}/${category.slug}`
      : `/shop/${nav.value}/${category.slug}`
  }

  const getBrandLink = (nav: NavSection, brand: any) => {
    return `/shop/${brand.slug}`
  }

  const isNavActive = (nav: NavSection) => {
    if (nav.href) return pathname.startsWith('/shop')
    if (nav.isSpecial) return false
    return pathname.startsWith(`/shop/${nav.value}`)
  }

  const activeNavData = genderNavigation.find((n) => n.value === activeNav)

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur"
      onMouseLeave={handleMouseLeave}
    >
      {/* ── Main header bar ──────────────────────────────────── */}
      <div className="container flex h-16 items-center justify-between">
        <Link href="/">
          <LogoIcon className="h-6 w-6" />
        </Link>

        <nav className="hidden lg:block">
          <ul className="flex items-center gap-6">
            {genderNavigation.map((nav) => {
              const isActive = isNavActive(nav)
              const isMenuActive = activeNav === nav.value

              return (
                <li
                  key={nav.value}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(nav.value)}
                >
                  <Link
                    href={getNavLink(nav)}
                    className={cn(
                      'text-sm font-medium transition-colors hover:text-foreground inline-block py-2',
                      isActive ? 'text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {nav.label}
                  </Link>

                  {/* Active underline indicator */}
                  <span
                    className={cn(
                      'absolute bottom-0 left-0 h-0.5 w-full bg-foreground transition-all duration-200',
                      isMenuActive ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <button
            className="inline-flex items-center justify-center border border-input bg-background hover:bg-accent hover:text-accent-foreground size-9 rounded-full shadow-xs transition-colors"
            onClick={toggleTheme}
            aria-label={`Switch to ${headerTheme === 'light' ? 'dark' : 'light'} theme`}
          >
            <Sun className="size-4 dark:hidden" />
            <Moon className="size-4 hidden dark:block" />
          </button>

          {cartSlot}

          <div className="lg:hidden">
            <Suspense>
              <MobileMenu genderNavigation={genderNavigation} />
            </Suspense>
          </div>
        </div>
      </div>

      {/* ── Mega menu — single panel anchored to full header width ── */}
      <div
        className={cn(
          'absolute left-0 w-full border-t bg-background shadow-lg',
          'transition-all duration-200 ease-in-out origin-top',
          activeNavData
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-1 pointer-events-none',
        )}
        onMouseEnter={() => activeNav && handleMouseEnter(activeNav)}
      >
        {activeNavData && (
          <div className="container mx-auto py-8 px-6">
            {activeNavData.isSpecial ? (
              // ── "New" special section ──────────────────────────
              <div className="grid grid-cols-2 gap-8 max-w-2xl">
                <div>
                  <h4 className="text-xs font-semibold mb-4 uppercase tracking-wider text-muted-foreground">
                    Highlights
                  </h4>
                  <div className="space-y-3">
                    {activeNavData.highlights.map((highlight: any, idx: number) => (
                      <Link
                        key={idx}
                        href={highlight.href}
                        className="block text-sm hover:text-foreground transition-colors text-muted-foreground"
                        onClick={() => setActiveNav(null)}
                      >
                        {highlight.title}
                      </Link>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-4">Brands</h4>
                  <div className="space-y-3">
                    {activeNavData.brands.slice(0, 8).map((brand: any) => (
                      <Link
                        key={brand.id}
                        href={getBrandLink(activeNavData, brand)}
                        className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setActiveNav(null)}
                      >
                        {brand.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // ── Regular gender / single-gender section ─────────
              <div className="grid grid-cols-5 gap-8">
                {/* Highlights */}
                {activeNavData.highlights.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold mb-4 uppercase tracking-wider text-muted-foreground">
                      Highlights
                    </h4>
                    <div className="space-y-3">
                      {activeNavData.highlights.map((highlight: any, idx: number) => (
                        <Link
                          key={idx}
                          href={highlight.href}
                          className="block text-sm hover:text-foreground transition-colors text-muted-foreground"
                          onClick={() => setActiveNav(null)}
                        >
                          {highlight.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Departments + Categories */}
                {activeNavData.departments.slice(0, 3).map((dept: any) => (
                  <div key={dept.id}>
                    <Link
                      href={getDeptLink(activeNavData, dept)}
                      className="block text-sm font-semibold mb-4 hover:text-foreground transition-colors"
                      onClick={() => setActiveNav(null)}
                    >
                      {dept.title}
                    </Link>
                    <div className="space-y-3">
                      {dept.categories.slice(0, 8).map((category: any) => (
                        <Link
                          key={category.id}
                          href={getCategoryLink(activeNavData, category)}
                          className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => setActiveNav(null)}
                        >
                          {category.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Brands */}
                {activeNavData.brands.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-4">Brands</h4>
                    <div className="space-y-3">
                      {activeNavData.brands.slice(0, 8).map((brand: any) => (
                        <Link
                          key={brand.id}
                          href={getBrandLink(activeNavData, brand)}
                          className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => setActiveNav(null)}
                        >
                          {brand.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
