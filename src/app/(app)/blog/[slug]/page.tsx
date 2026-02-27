// app/(app)/blog/[slug]/page.tsx

import { Media } from '@/components/Media'
import { RichText } from '@/components/RichText'
import { Button } from '@/components/ui/button'
import configPromise from '@payload-config'
import { ArrowLeft, Calendar, Tag, User } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import { cache } from 'react'
import { SITE_CONFIG } from 'site.config'

const CATEGORY_LABELS: Record<string, string> = {
  'style-tips': 'Style Tips',
  'trend-report': 'Trend Report',
  'behind-the-brand': 'Behind the Brand',
  'how-to-wear': 'How to Wear',
  news: 'News',
}

interface Props {
  params: Promise<{ slug: string }>
}

// ═══════════════════════════════════════════════════════════
// STATIC PARAMS — pre-render all published blog posts at build time
// ═══════════════════════════════════════════════════════════
export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'blogs',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: { slug: true },
  })

  return posts.docs.map(({ slug }) => ({ slug }))
}

// ═══════════════════════════════════════════════════════════
// CACHED QUERY — shared between generateMetadata and the page
// so Payload is only hit once per request
// ═══════════════════════════════════════════════════════════
const queryBlogBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'blogs',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    depth: 2,
    where: { slug: { equals: slug } },
  })

  return result.docs?.[0] || null
})

// ═══════════════════════════════════════════════════════════
// METADATA
// ═══════════════════════════════════════════════════════════
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const post = await queryBlogBySlug({ slug: decodedSlug })

  if (!post) return {}

  const ogImage =
    post.meta?.image && typeof post.meta.image === 'object'
      ? post.meta.image.url
      : post.coverImage && typeof post.coverImage === 'object'
        ? post.coverImage.url
        : undefined

  return {
    title: post.meta?.title || `${post.title} | ${SITE_CONFIG.name}`,
    description: post.meta?.description || post.excerpt || '',
    openGraph: {
      title: post.meta?.title || post.title,
      description: post.meta?.description || post.excerpt || '',
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
  }
}

// ═══════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════
export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)

  // Uses the cached result — no second DB hit if generateMetadata ran first
  const post = await queryBlogBySlug({ slug: decodedSlug })
  if (!post) return notFound()

  // Fetch related posts from same category (excluding current)
  const relatedResult = post.category
    ? await (async () => {
        const payload = await getPayload({ config: configPromise })
        return payload.find({
          collection: 'blogs',
          where: {
            category: { equals: post.category },
            slug: { not_equals: decodedSlug },
            _status: { equals: 'published' },
          },
          sort: '-publishedAt',
          depth: 1,
          limit: 3,
          pagination: false,
        })
      })()
    : null

  const relatedPosts = relatedResult?.docs || []

  return (
    <article className="py-12 container mx-auto ">
      {/* Back */}
      <div className="mb-8 max-w-4xl mx-auto">
        <Button variant="ghost" asChild className="pl-0 text-muted-foreground">
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="mb-10 max-w-4xl mx-auto">
        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap mb-4">
          {post.category && (
            <Link
              href={`/blog?category=${post.category}`}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Tag className="h-3.5 w-3.5" />
              {CATEGORY_LABELS[post.category] || post.category}
            </Link>
          )}
          {post.publishedAt && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(post.publishedAt).toLocaleDateString('en-NG', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          )}
          {post.author && (
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {post.author}
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-tight mb-4">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="text-lg text-muted-foreground leading-relaxed">{post.excerpt}</p>
        )}
      </div>

      {/* Cover Image */}
      {post.coverImage && typeof post.coverImage !== 'string' && (
        <div className="relative aspect-[16/9] overflow-hidden rounded-xl mb-12 max-w-4xl mx-auto">
          <Media resource={post.coverImage} fill priority imgClassName="object-cover" />
        </div>
      )}

      {/* Body */}
      <div className="max-w-4xl mx-auto">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <RichText data={post.content} enableGutter={false} />
        </div>

        {/* Related Products */}
        {post.relatedProducts &&
          Array.isArray(post.relatedProducts) &&
          post.relatedProducts.length > 0 && (
            <div className="mt-16 pt-10 border-t">
              <h3 className="text-xl font-semibold mb-6">Products in this post</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {post.relatedProducts.map((product: any) => {
                  if (typeof product !== 'object') return null
                  const image =
                    typeof product.gallery?.[0]?.image === 'object'
                      ? product.gallery[0].image
                      : undefined

                  return (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      className="group rounded-lg border bg-card overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="relative aspect-square overflow-hidden">
                        {image && (
                          <Media
                            resource={image}
                            fill
                            imgClassName="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-medium line-clamp-1 group-hover:underline underline-offset-2">
                          {product.title}
                        </p>
                        {product.priceInNGN && (
                          <p className="text-sm text-muted-foreground mt-0.5">
                            ₦{product.priceInNGN.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-16 pt-10 border-t">
            <h3 className="text-xl font-semibold mb-6">
              More in {CATEGORY_LABELS[post.category!]}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedPosts.map((related) => (
                <Link
                  key={related.id}
                  href={`/blog/${related.slug}`}
                  className="group rounded-xl border bg-card overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {related.coverImage && typeof related.coverImage !== 'string' && (
                      <Media
                        resource={related.coverImage}
                        fill
                        imgClassName="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    {related.publishedAt && (
                      <p className="text-xs text-muted-foreground mb-1">
                        {new Date(related.publishedAt).toLocaleDateString('en-NG', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    )}
                    <h4 className="font-medium line-clamp-2 group-hover:underline underline-offset-2">
                      {related.title}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back to blog */}
        <div className="mt-16 pt-10 border-t flex justify-center">
          <Button variant="outline" asChild>
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to all posts
            </Link>
          </Button>
        </div>
      </div>
    </article>
  )
}