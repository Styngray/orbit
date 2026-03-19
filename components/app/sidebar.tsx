"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-56 flex-col border-r bg-sidebar">
      {/* Brand */}
      <div className="flex h-14 items-center px-4 border-b border-sidebar-border">
        <span className="text-lg font-bold tracking-tight text-sidebar-foreground">
          Orbit
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname === href
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
