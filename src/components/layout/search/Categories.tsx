// components/layout/search/Categories.tsx
import configPromise from '@payload-config'
import clsx from 'clsx'
import { getPayload } from 'payload'
import { Suspense } from 'react'
import { CategoryItem } from './Categories.client'

interface CategoryListProps {
  slug?: string
  gender?: string
  department?: string
  mobileHorizontal?: boolean
}

async function CategoryList({ slug, gender, department, mobileHorizontal }: CategoryListProps) {
  const payload = await getPayload({ config: configPromise })

  const departmentFilter = department ? { department: { equals: department } } : undefined

  // ─── Wrapper that switches between vertical list and horizontal pills ──────
  const Wrapper = ({ title, children }: { title: string; children: React.ReactNode }) => {
    if (mobileHorizontal) {
      // Mobile: render as horizontally scrollable pills (no title label needed)
      return <>{children}</>
    }
    return (
      <div>
        <h3 className="text-xs mb-2 text-neutral-500 dark:text-neutral-400">{title}</h3>
        <ul className="space-y-1">{children}</ul>
      </div>
    )
  }

  const renderCategory = (category: any) => {
    if (mobileHorizontal) {
      return (
        <CategoryItem
          key={category.id}
          category={category}
          gender={gender}
          mobileHorizontal
        />
      )
    }
    return (
      <li key={category.id}>
        <CategoryItem category={category} gender={gender} />
      </li>
    )
  }

  if (!slug) {
    const categories = await payload.find({
      collection: 'categories',
      where: { parent: { exists: false }, ...(departmentFilter || {}) },
      sort: 'title',
    })

    return (
      <Wrapper title="Categories">
        {categories.docs.map(renderCategory)}
      </Wrapper>
    )
  }

  // ─── Find current category ───────────────────────────────
  const currentCategoryResult = await payload.find({
    collection: 'categories',
    where: { slug: { equals: slug } },
    depth: 1,
    limit: 1,
  })

  const currentCategory = currentCategoryResult.docs[0]
  if (!currentCategory) return null

  // ─── Show children if they exist ─────────────────────────
  const childCategories = await payload.find({
    collection: 'categories',
    where: { parent: { equals: currentCategory.id } },
    sort: 'title',
  })

  if (childCategories.docs.length > 0) {
    return (
      <Wrapper title={currentCategory.title}>
        {childCategories.docs.map(renderCategory)}
      </Wrapper>
    )
  }

  // ─── Show siblings if no children ────────────────────────
  const parentId =
    typeof currentCategory.parent === 'object'
      ? currentCategory.parent?.id
      : currentCategory.parent

  if (parentId) {
    const [siblingCategories, parentCategory] = await Promise.all([
      payload.find({
        collection: 'categories',
        where: { parent: { equals: parentId } },
        sort: 'title',
      }),
      payload.findByID({ collection: 'categories', id: parentId }),
    ])

    return (
      <Wrapper title={parentCategory.title}>
        {siblingCategories.docs.map(renderCategory)}
      </Wrapper>
    )
  }

  // ─── Fallback: top-level categories ──────────────────────
  const topLevelCategories = await payload.find({
    collection: 'categories',
    where: { parent: { exists: false }, ...(departmentFilter || {}) },
    sort: 'title',
  })

  return (
    <Wrapper title="Categories">
      {topLevelCategories.docs.map(renderCategory)}
    </Wrapper>
  )
}

const skeleton = 'mb-3 h-4 w-5/6 animate-pulse rounded'
const activeAndTitles = 'bg-neutral-800 dark:bg-neutral-300'
const items = 'bg-neutral-400 dark:bg-neutral-700'

export function Categories({
  slug,
  gender,
  department,
  mobileHorizontal,
}: {
  slug?: string
  gender?: string
  department?: string
  mobileHorizontal?: boolean
}) {
  return (
    <Suspense
      fallback={
        mobileHorizontal ? (
          // Mobile pill skeletons
          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 w-20 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700 shrink-0" />
            ))}
          </div>
        ) : (
          // Desktop sidebar skeletons
          <div className="col-span-2 hidden h-[400px] w-full flex-none py-4 lg:block">
            <div className={clsx(skeleton, activeAndTitles)} />
            <div className={clsx(skeleton, activeAndTitles)} />
            {[...Array(8)].map((_, i) => (
              <div key={i} className={clsx(skeleton, items)} />
            ))}
          </div>
        )
      }
    >
      <CategoryList slug={slug} gender={gender} department={department} mobileHorizontal={mobileHorizontal} />
    </Suspense>
  )
}