"use client"

import { useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Settings,
  Heart,
  Pill,
  BookOpen,
  Stethoscope,
  Users,
  Calendar,
  FileText,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
} from "lucide-react"

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Setup", href: "/setup", icon: Settings },
  { label: "Favorite Setup", href: "/favorite-setup", icon: Heart },
  { label: "Favorite Medicine", href: "/favorite-medicine", icon: Pill },
  { label: "Instruction", href: "/instruction", icon: BookOpen },
  { label: "Doctor Info", href: "/doctor-info", icon: Stethoscope },
  { label: "Patient Info", href: "/patient-info", icon: Users },
  { label: "Appointments", href: "/appointments", icon: Calendar },
  { label: "Prescription", href: "/prescription", icon: FileText },
]

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()

  const handleToggle = useCallback(() => {
    onToggle()
  }, [onToggle])

  const handleLogout = useCallback(() => {
    document.cookie = "doctor_id=; path=/; max-age=0"
    document.cookie = "rx-token=; path=/; max-age=0"
    window.location.href = "/login"
  }, [])

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-full flex-col bg-slate-900 text-slate-300 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
      aria-label="Sidebar navigation"
    >
      <div className="flex h-16 items-center border-b border-slate-700 px-4">
        <Link href="/dashboard" className="flex items-center gap-2" aria-label="RxPro Home">
          <div className="flex size-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
            Rx
          </div>
          {!collapsed && (
            <span className="text-lg font-semibold text-white">RxPro</span>
          )}
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="size-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-slate-700 px-2 py-4">
        {!collapsed && (
          <div className="mb-4 flex items-center gap-3 px-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-slate-600 text-sm font-semibold text-white">
              D
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">Doctor</p>
              <p className="truncate text-xs text-slate-400">doctor@rxpro.com</p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          aria-label="Logout"
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="size-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      <button
        onClick={handleToggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="flex items-center justify-center border-t border-slate-700 py-3 text-slate-400 transition-colors hover:text-white"
      >
        {collapsed ? (
          <PanelLeftOpen className="size-5" />
        ) : (
          <PanelLeftClose className="size-5" />
        )}
      </button>
    </aside>
  )
}
