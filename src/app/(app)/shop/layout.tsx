import React, { Suspense } from 'react'

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="container flex flex-col gap-8 my-16 pb-4 ">
        {/* <Search className="mb-8" /> */}

        <div className="min-h-screen w-full">{children}</div>
      </div>
    </Suspense>
  )
}
