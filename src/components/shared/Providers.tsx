'use client'

import { useState, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CookiesProvider } from 'next-client-cookies'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from 'sonner'

export function Providers({ children, cookies: cookieRecords = [] }: { children: ReactNode; cookies?: { name: string; value: string }[] }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <CookiesProvider value={cookieRecords}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          {children}
          <Toaster richColors position="top-right" />
        </TooltipProvider>
      </QueryClientProvider>
    </CookiesProvider>
  )
}
