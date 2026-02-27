'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import { Category } from '@/payload-types'
import { SITE_CONFIG, getDepartments } from 'site.config'

const DEPARTMENT_VALUES = getDepartments().map((d) => d.value)
const IS_MULTI_GENDER = SITE_CONFIG.useGenderFiltering && !SITE_CONFIG.singleGender

type Props = {
  category: Category
  gender?: string
  mobileHorizontal?: boolean
}

export const CategoryItem: React.FC<Props> = ({ category, gender, mobileHorizontal }) => {
  const href = useMemo(() => {
    const segments: string[] = []
    let current: any = category

    while (current) {
      if (current.slug) segments.unshift(current.slug)
      if (current.parent && typeof current.parent === 'object') {
        current = current.parent
      } else {
        break
      }
    }

    if (IS_MULTI_GENDER && gender) {
      const department = category.department
      if (department && DEPARTMENT_VALUES.includes(department)) {
        return `/shop/${gender}/${department}/${segments[segments.length - 1]}`
      }
      return `/shop/${gender}/${segments[segments.length - 1]}`
    }

    const department = category.department
    if (department && DEPARTMENT_VALUES.includes(department)) {
      return `/shop/${department}/${segments[segments.length - 1]}`
    }

    return `/shop/${segments.join('/')}`
  }, [category, gender])

  if (mobileHorizontal) {
    return (
      <Link
        href={href}
        className="inline-flex items-center whitespace-nowrap rounded-full border border-border px-4 py-1.5 text-sm font-medium transition-colors shrink-0 hover:border-foreground/50 hover:bg-muted"
      >
        {category.title}
      </Link>
    )
  }

  return (
    <Link
      href={href}
      className="block text-sm py-0.5 hover:text-primary transition-colors"
    >
      {category.title}
    </Link>
  )
}