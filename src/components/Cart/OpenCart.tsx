import { Button } from '@/components/ui/button'
import clsx from 'clsx'
import { ShoppingBag } from 'lucide-react'
import React from 'react'

export function OpenCartButton({
  className,
  quantity,
  ...rest
}: {
  className?: string
  quantity?: number
}) {
  return (
    <button
      className={clsx(
        'relative inline-flex items-center justify-center border border-input bg-background hover:bg-accent hover:text-accent-foreground size-9 rounded-full shadow-xs transition-colors',
        className
      )}
      aria-label={`Shopping cart with ${quantity || 0} items`}
      {...rest}
    >
      <ShoppingBag className="size-4" strokeWidth={2} />
      
      {quantity && quantity > 0 ? (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-background">
          {quantity > 9 ? '9+' : quantity}
        </span>
      ) : null}
    </button>
  )
}