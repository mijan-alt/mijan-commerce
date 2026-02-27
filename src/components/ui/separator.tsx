// components/ui/separator.tsx
import * as React from 'react'
import { cn } from '@/utilities/cn'

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The orientation of the separator.
   * @default "horizontal"
   */
  orientation?: 'horizontal' | 'vertical'
  
  /**
   * Whether or not the separator is purely decorative.
   * When true, screen readers will ignore it.
   * @default true
   */
  decorative?: boolean
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  (
    { 
      className, 
      orientation = 'horizontal', 
      decorative = true,
      ...props 
    },
    ref
  ) => {
    // ARIA attributes for accessibility
    const ariaOrientation = orientation === 'vertical' ? 'vertical' : undefined
    const role = decorative ? 'none' : 'separator'

    return (
      <div
        ref={ref}
        role={role}
        aria-orientation={ariaOrientation}
        className={cn(
          'shrink-0 bg-border',
          orientation === 'horizontal' 
            ? 'h-px w-full' 
            : 'h-full w-px',
          className
        )}
        {...props}
      />
    )
  }
)

Separator.displayName = 'Separator'

export { Separator }