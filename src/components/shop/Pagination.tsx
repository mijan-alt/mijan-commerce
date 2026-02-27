// components/shop/Pagination.tsx
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Props = {
  currentPage: number
  totalPages: number
  basePath: string
  searchParams?: Record<string, string>
}

export function Pagination({ currentPage, totalPages, basePath, searchParams = {} }: Props) {
  if (totalPages <= 1) return null

  const buildUrl = (page: number) => {
    const params = new URLSearchParams({ ...searchParams, page: String(page) })
    return `${basePath}?${params.toString()}`
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2,
  )

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <Button variant="outline" size="icon" disabled={currentPage === 1} asChild>
        <Link href={buildUrl(currentPage - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Link>
      </Button>

      {pages.map((p, i) => {
        const prev = pages[i - 1]
        return (
          <div key={p} className="flex items-center gap-2">
            {/* Show ellipsis if there's a gap */}
            {prev && p - prev > 1 && (
              <span className="text-muted-foreground px-1">...</span>
            )}
            <Button
              variant={p === currentPage ? 'default' : 'outline'}
              size="icon"
              asChild={p !== currentPage}
            >
              {p === currentPage ? (
                <span>{p}</span>
              ) : (
                <Link href={buildUrl(p)}>{p}</Link>
              )}
            </Button>
          </div>
        )
      })}

      <Button variant="outline" size="icon" disabled={currentPage === totalPages} asChild>
        <Link href={buildUrl(currentPage + 1)}>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  )
}