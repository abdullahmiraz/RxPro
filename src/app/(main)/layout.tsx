"use client"

import { useState, useEffect, Suspense, type ReactNode } from "react"
import Sidebar from "@/components/shared/sidebar/Sidebar"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"

function Loader() {
  return (
    <div className="flex items-center justify-center py-20" role="status">
      <div className="size-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
    </div>
  )
}

export default function MainLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed")
    if (stored === "true") {
      setCollapsed(true)
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("sidebar-collapsed", String(collapsed))
    }
  }, [collapsed, mounted])

  return (
    <div className="flex min-h-screen">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <main
        className={cn(
          "flex-1 transition-all duration-300",
          "ml-0",
          collapsed ? "md:ml-16" : "md:ml-64"
        )}
      >
        <div className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="flex size-9 items-center justify-center rounded-md text-slate-700 transition-colors hover:bg-slate-100"
          >
            <Menu className="size-5" />
          </button>
          <span className="text-base font-semibold text-slate-900">RxPro</span>
        </div>
        <div
          style={{ minHeight: "calc(100vh - 4rem)" }}
          className="mx-auto max-w-7xl px-6 py-8"
        >
          <Suspense fallback={<Loader />}>{children}</Suspense>
        </div>
      </main>
    </div>
  )
}
