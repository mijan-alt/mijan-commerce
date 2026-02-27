'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function SortSelect() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentSort = searchParams.get('sort') || '-createdAt'

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('sort', value)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium hidden sm:inline">Sort By</span>
      <Select value={currentSort} onValueChange={handleSortChange}>
        <SelectTrigger className="w-[160px] h-9">
          <SelectValue />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="-createdAt">Latest arrivals</SelectItem>
          <SelectItem value="priceInNGN">Price: Low to high</SelectItem>
          <SelectItem value="-priceInNGN">Price: High to low</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}