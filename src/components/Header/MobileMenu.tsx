'use client'
import { Button } from '@/components/ui/button'
import {
  Sheet, SheetContent, SheetDescription,
  SheetHeader, SheetTitle, SheetTrigger,
} from '@/components/ui/sheet'
import { useAuth } from '@/providers/Auth'
import { cn } from '@/utilities/cn'
import { ChevronDown, MenuIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { SITE_CONFIG, getDepartments } from 'site.config'

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

interface Props {
  genderNavigation: NavSection[]
}

export function MobileMenu({ genderNavigation }: Props) {
  const { user } = useAuth()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const [openNav, setOpenNav] = useState<string | null>(null)
  const [openDepartment, setOpenDepartment] = useState<string | null>(null)

  const toggleNav = (value: string) => {
    setOpenNav((prev) => (prev === value ? null : value))
    if (openNav !== value) setOpenDepartment(null)
  }

  const toggleDepartment = (deptId: string) => {
    setOpenDepartment((prev) => (prev === deptId ? null : deptId))
  }

  const closeMobileMenu = () => {
    setIsOpen(false)
    setOpenNav(null)
    setOpenDepartment(null)
  }

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth > 1024) setIsOpen(false) }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isOpen])

  useEffect(() => {
    setIsOpen(false); setOpenNav(null); setOpenDepartment(null)
  }, [pathname, searchParams])

  // ⭐ All link builders mirror HeaderClient exactly
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

  const getBrandLink = (nav: NavSection, brand: any) => `/shop/${brand.slug}`

  return (
    <Sheet onOpenChange={setIsOpen} open={isOpen}>
      <SheetTrigger className="relative flex h-11 w-11 items-center justify-center rounded-md border border-neutral-200 text-black transition-colors dark:border-neutral-700 dark:bg-black dark:text-white">
        <MenuIcon className="h-4" />
      </SheetTrigger>

      <SheetContent side="left" className="px-4 overflow-y-auto">
        <SheetHeader className="px-0 pt-4 pb-0">
          <SheetTitle>{SITE_CONFIG.name}</SheetTitle>
          <SheetDescription />
        </SheetHeader>

        <div className="py-4 space-y-6">
          <div className="mt-6">
            <h2 className="text-sm font-semibold mb-4 uppercase tracking-wide text-muted-foreground">
              Shop
            </h2>

            <div className="flex flex-col">
              {genderNavigation.map((nav) => {
                const isNavOpen = openNav === nav.value

                return (
                  <div key={nav.value} className="border-b">
                    <div className="flex items-center justify-between py-3">
                      <Link
                        href={getNavLink(nav)}
                        onClick={closeMobileMenu}
                        className="text-sm font-semibold transition-colors text-foreground hover:text-primary"
                      >
                        {nav.label}
                      </Link>

                      {(nav.highlights.length > 0 || nav.departments.length > 0) && (
                        <button
                          onClick={() => toggleNav(nav.value)}
                          className="p-1"
                          aria-label={`Toggle ${nav.label}`}
                        >
                          <ChevronDown
                            className={cn(
                              'h-4 w-4 transition-transform duration-200',
                              isNavOpen && 'rotate-180',
                            )}
                          />
                        </button>
                      )}
                    </div>

                    {isNavOpen && (
                      <div className="pb-3 pl-4 flex flex-col gap-2">
                        {/* Highlights */}
                        {nav.highlights.length > 0 && (
                          <div className="mb-4">
                            <h3 className="text-xs font-semibold mb-3 uppercase tracking-wide text-muted-foreground">
                              Highlights
                            </h3>
                            <div className="flex flex-col gap-2">
                              {nav.highlights.map((highlight: any, idx: number) => (
                                <Link
                                  key={idx}
                                  href={highlight.href}
                                  onClick={closeMobileMenu}
                                  className="text-sm transition-colors text-muted-foreground hover:text-foreground py-1"
                                >
                                  {highlight.title}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Departments */}
                        {nav.departments.length > 0 && nav.departments.map((dept: any) => {
                          const isDeptOpen = openDepartment === String(dept.id)
                          return (
                            <div key={dept.id} className="mb-2">
                              <div className="flex items-center justify-between py-2">
                                <Link
                                  href={getDeptLink(nav, dept)}
                                  onClick={closeMobileMenu}
                                  className="text-sm font-medium transition-colors text-foreground hover:text-primary"
                                >
                                  {dept.title}
                                </Link>
                                {dept.categories?.length > 0 && (
                                  <button
                                    onClick={() => toggleDepartment(String(dept.id))}
                                    className="p-1"
                                  >
                                    <ChevronDown
                                      className={cn(
                                        'h-3 w-3 transition-transform duration-200',
                                        isDeptOpen && 'rotate-180',
                                      )}
                                    />
                                  </button>
                                )}
                              </div>

                              {isDeptOpen && dept.categories?.length > 0 && (
                                <div className="pl-4 flex flex-col gap-2">
                                  {dept.categories.map((category: any) => (
                                    <Link
                                      key={category.id}
                                      href={getCategoryLink(nav, category)}
                                      onClick={closeMobileMenu}
                                      className="text-sm transition-colors text-muted-foreground hover:text-foreground py-1"
                                    >
                                      {category.title}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        })}

                        {/* Brands */}
                        {nav.brands?.length > 0 && (
                          <div className="mt-4 pt-4 border-t">
                            <h3 className="text-xs font-semibold mb-3 uppercase tracking-wide text-muted-foreground">
                              Brands
                            </h3>
                            <div className="flex flex-col gap-2">
                              {nav.brands.map((brand: any) => (
                                <Link
                                  key={brand.id}
                                  href={getBrandLink(nav, brand)}
                                  onClick={closeMobileMenu}
                                  className="text-sm transition-colors text-muted-foreground hover:text-foreground py-1"
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
                )
              })}
            </div>
          </div>
        </div>

        {/* Account */}
        {user ? (
          <div className="mt-4 pt-4 border-t">
            <h2 className="text-xl mb-4">My account</h2>
            <ul className="flex flex-col gap-2">
              <li><Link href="/orders" onClick={closeMobileMenu}>Orders</Link></li>
              <li><Link href="/account/addresses" onClick={closeMobileMenu}>Addresses</Link></li>
              <li><Link href="/account" onClick={closeMobileMenu}>Manage account</Link></li>
              <li className="mt-6">
                <Button asChild variant="outline">
                  <Link href="/logout" onClick={closeMobileMenu}>Log out</Link>
                </Button>
              </li>
            </ul>
          </div>
        ) : (
          <div className="mt-4 pt-4 border-t">
            <h2 className="text-xl mb-4">My account</h2>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button asChild className="w-full sm:flex-1" variant="outline">
                <Link href="/login" onClick={closeMobileMenu}>Log in</Link>
              </Button>
              <span className="text-center text-sm text-muted-foreground sm:text-base">or</span>
              <Button asChild className="w-full sm:flex-1">
                <Link href="/create-account" onClick={closeMobileMenu}>Create an account</Link>
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}