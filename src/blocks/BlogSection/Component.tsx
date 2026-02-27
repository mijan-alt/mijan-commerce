import { Media } from '@/components/Media'
import { Button } from '@/components/ui/button'
import { BlogSectionBlockProps } from '@/payload-types'
import configPromise from '@payload-config'
import { ArrowRight, Calendar, Tag } from 'lucide-react'
import Link from 'next/link'
import { getPayload } from 'payload'

const CATEGORY_LABELS: Record<string, string> = {
  'style-tips': 'Style Tips',
  'trend-report': 'Trend Report',
  'behind-the-brand': 'Behind the Brand',
  'how-to-wear': 'How to Wear',
  news: 'News',
}

export async function BlogSectionBlock({
  heading,
  subheading,
  displayMode,
  posts: manualPosts,
  limit = 3,
  showViewAll,
}: BlogSectionBlockProps) {
  const payload = await getPayload({ config: configPromise })

  let posts: any[] = []

  if (displayMode === 'manual' && manualPosts?.length) {
    // Resolve manually selected posts
    const ids = manualPosts.map((p: any) => (typeof p === 'object' ? p.id : p))
    const result = await payload.find({
      collection: 'blogs',
      where: { id: { in: ids }, _status: { equals: 'published' } },
      depth: 1,
      limit: 6,
    })
    posts = result.docs
  } else if (displayMode === 'featured') {
    const result = await payload.find({
      collection: 'blogs',
      where: { featured: { equals: true }, _status: { equals: 'published' } },
      sort: '-publishedAt',
      depth: 1,
      limit: 6,
    })
    posts = result.docs
  } else {
    // latest
    const result = await payload.find({
      collection: 'blogs',
      where: { _status: { equals: 'published' } },
      sort: '-publishedAt',
      depth: 1,
      limit: 6,
    })
    posts = result.docs
  }

  if (!posts.length) return null

  const [featuredPost, ...restPosts] = posts

  return (
    <section className="py-16 px-4 sm:px-16 container mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between mb-10">
        <div>
          {heading && <h2 className="text-3xl font-semibold tracking-tight">{heading}</h2>}
          {subheading && <p className="text-muted-foreground mt-1">{subheading}</p>}
        </div>
        {showViewAll && (
          <Button variant="ghost" asChild className="hidden sm:flex">
            <Link href="/blog">
              View all posts <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Featured / first post — spans 2 cols on desktop */}
        <Link
          href={`/blog/${featuredPost.slug}`}
          className="group lg:col-span-2 relative overflow-hidden rounded-xl border bg-card hover:shadow-md transition-shadow"
        >
          <div className="relative aspect-[16/9] overflow-hidden">
            {featuredPost.coverImage && typeof featuredPost.coverImage !== 'string' && (
              <Media
                resource={featuredPost.coverImage}
                fill
                imgClassName="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            )}
          </div>
          <div className="p-6">
            <PostMeta post={featuredPost} />
            <h3 className="text-xl font-semibold mt-2 group-hover:underline underline-offset-4">
              {featuredPost.title}
            </h3>
            {featuredPost.excerpt && (
              <p className="text-muted-foreground text-sm mt-2 line-clamp-2">
                {featuredPost.excerpt}
              </p>
            )}
          </div>
        </Link>

        {/* Remaining posts — stacked in 1 col */}
        {restPosts.length > 0 && (
          <div className="flex flex-col gap-6">
            {restPosts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex gap-4 rounded-xl border bg-card p-4 hover:shadow-md transition-shadow"
              >
                {/* Thumbnail */}
                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg">
                  {post.coverImage && typeof post.coverImage !== 'string' && (
                    <Media
                      resource={post.coverImage}
                      fill
                      imgClassName="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="flex flex-col justify-center min-w-0">
                  <PostMeta post={post} />
                  <h3 className="font-medium mt-1 group-hover:underline underline-offset-4 line-clamp-2">
                    {post.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Mobile view all */}
      {showViewAll && (
        <div className="mt-8 flex sm:hidden">
          <Button variant="outline" asChild className="w-full">
            <Link href="/blog">
              View all posts <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </section>
  )
}

function PostMeta({ post }: { post: any }) {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
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
      {post.author && <span>by {post.author}</span>}
    </div>
  )
}
