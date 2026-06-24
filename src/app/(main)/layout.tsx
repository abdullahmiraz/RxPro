"use client"

import { useState, useEffect, Suspense, type ReactNode } from "react"
import Sidebar from "@/components/shared/sidebar/Sidebar"
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
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <main
        className={cn(
          "flex-1 transition-all duration-300",
          collapsed ? "ml-16" : "ml-64"
        )}
      >
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
