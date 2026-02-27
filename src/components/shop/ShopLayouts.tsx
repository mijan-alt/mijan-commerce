'use client'

// components/shop/ShopLayout.tsx
// Client wrapper that handles sidebar toggle state.
// Used by the server page.tsx to wrap the rendered output.

import { Button } from '@/components/ui/button'
import { SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'

interface ShopLayoutProps {
  sidebar: React.ReactNode
  mobileCategoryBar: React.ReactNode
  header: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode // product grid
}

export function ShopLayouts({
  sidebar,
  mobileCategoryBar,
  header,
  description,
  children,
}: ShopLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div>
      {/* ── Mobile: horizontal scrollable category bar ─────────── */}
      <div className="lg:hidden mb-4 -mx-4 px-4 overflow-x-auto">
        <div className="flex gap-2 pb-2 w-max">{mobileCategoryBar}</div>
      </div>

      <div className="flex gap-8">
        {/* ── Desktop sidebar ────────────────────────────────────── */}
        {sidebarOpen && (
          <aside className="hidden lg:block w-40 shrink-0">
            <div className="sticky top-24 flex flex-col gap-6">{sidebar}</div>
          </aside>
        )}

        {/* ── Main content ───────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Header row with toggle button */}
          <div className="flex items-start justify-between mb-8 gap-4">
            <div className="flex-1">{header}</div>
            <div className="flex items-center gap-2">
              {/* Toggle sidebar on desktop */}
              <Button
                variant="ghost"
                size="sm"
                className="hidden lg:flex gap-2"
                onClick={() => setSidebarOpen((v) => !v)}
                aria-label={sidebarOpen ? 'Hide filters' : 'Show filters'}
              >
                <SlidersHorizontal
                  className={`h-4 w-4 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-40'}`}
                />
              </Button>
            </div>
          </div>

          {description}

          {/* Product grid */}
          {children}
        </div>
      </div>
    </div>
  )
}