// app/(app)/blog/page.tsx

import { Media } from '@/components/Media'
import { Button } from '@/components/ui/button'
import configPromise from '@payload-config'
import { ArrowRight, Calendar, Tag } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayload } from 'payload'
import { SITE_CONFIG } from 'site.config'

const CATEGORY_LABELS: Record<string, string> = {
  'style-tips': 'Style Tips',
  'trend-report': 'Trend Report',
  'behind-the-brand': 'Behind the Brand',
  'how-to-wear': 'How to Wear',
  news: 'News',
}

const LIMIT = 9

interface Props {
  searchParams?: Promise<{ page?: string; category?: string }>
}

export const metadata: Metadata = {
  title: `Blog | ${SITE_CONFIG.name}`,
  description: `Style tips, trend reports and fashion inspiration from ${SITE_CONFIG.name}`,
}

export default async function BlogPage({ searchParams }: Props) {
  const { page: pageParam, category } = (await searchParams) || {}
  const page = Math.max(1, parseInt(pageParam || '1', 10))

  const payload = await getPayload({ config: configPromise })

  const where: any = { _status: { equals: 'published' } }
  if (category) where.category = { equals: category }

  const posts = await payload.find({
    collection: 'blogs',
    where,
    sort: '-publishedAt',
    depth: 1,
    limit: LIMIT,
    page,
  })

  const buildUrl = (p: number, cat?: string) => {
    const params = new URLSearchParams()
    if (p > 1) params.set('page', String(p))
    if (cat) params.set('category', cat)
    const qs = params.toString()
    return `/blog${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="py-12 container mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-semibold tracking-tight mb-2">The Blog</h1>
        <p className="text-muted-foreground">Style tips, trend reports and fashion inspiration.</p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap mb-10">
        <Link href={buildUrl(1)}>
          <Button variant={!category ? 'default' : 'outline'} size="sm" className="rounded-full">
            All
          </Button>
        </Link>
        {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
          <Link key={value} href={buildUrl(1, value)}>
            <Button
              variant={category === value ? 'default' : 'outline'}
              size="sm"
              className="rounded-full"
            >
              {label}
            </Button>
          </Link>
        ))}
      </div>

      {/* Grid */}
      {posts.docs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-xl font-medium mb-2">No posts found</p>
          <p className="text-muted-foreground">Check back later or browse another category</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/blog">View all posts</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.docs.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group rounded-xl border bg-card overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Cover Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                {post.coverImage && typeof post.coverImage !== 'string' && (
                  <Media
                    resource={post.coverImage}
                    fill
                    imgClassName="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                {/* Meta */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap mb-2">
                  {post.category && (
                    <span className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {CATEGORY_LABELS[post.category] || post.category}
                    </span>
                  )}
                  {post.publishedAt && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.publishedAt).toLocaleDateString('en-NG', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  )}
                </div>

                <h2 className="font-semibold text-lg leading-snug group-hover:underline underline-offset-4 line-clamp-2">
                  {post.title}
                </h2>

                {post.excerpt && (
                  <p className="text-muted-foreground text-sm mt-2 line-clamp-2">{post.excerpt}</p>
                )}

                <span className="inline-flex items-center gap-1 text-sm font-medium mt-4">
                  Read more <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {posts.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          <Button variant="outline" size="sm" disabled={page === 1} asChild={page !== 1}>
            {page === 1 ? (
              <span>Previous</span>
            ) : (
              <Link href={buildUrl(page - 1, category)}>Previous</Link>
            )}
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: posts.totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === posts.totalPages || Math.abs(p - page) <= 1)
              .map((p, i, arr) => (
                <span key={p} className="flex items-center gap-1">
                  {i > 0 && arr[i - 1] !== p - 1 && (
                    <span className="text-muted-foreground px-1">...</span>
                  )}
                  <Button
                    variant={p === page ? 'default' : 'outline'}
                    size="sm"
                    className="w-9"
                    asChild={p !== page}
                  >
                    {p === page ? <span>{p}</span> : <Link href={buildUrl(p, category)}>{p}</Link>}
                  </Button>
                </span>
              ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={page === posts.totalPages}
            asChild={page !== posts.totalPages}
          >
            {page === posts.totalPages ? (
              <span>Next</span>
            ) : (
              <Link href={buildUrl(page + 1, category)}>Next</Link>
            )}
          </Button>
        </div>
      )}

      {/* Post count */}
      {posts.totalDocs > 0 && (
        <p className="text-center text-sm text-muted-foreground mt-4">
          Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, posts.totalDocs)} of{' '}
          {posts.totalDocs} posts
        </p>
      )}
    </div>
  )
}
