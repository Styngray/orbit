"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { WorkspaceSwitcher, type Workspace } from "./workspace-switcher"

interface SidebarProps {
  workspaces: Workspace[]
}

export function Sidebar({ workspaces }: SidebarProps) {
  const pathname = usePathname()
  const workspaceId = pathname.match(/^\/w\/([^/]+)/)?.[1]

  const navItems = workspaceId
    ? [
        {
          href: `/w/${workspaceId}`,
          label: "Boards",
          icon: LayoutDashboard,
          exact: true,
        },
        {
          href: `/w/${workspaceId}/settings`,
          label: "Settings",
          icon: Settings,
          exact: false,
        },
      ]
    : []

  return (
    <aside className="flex h-full w-56 flex-col border-r bg-sidebar">
      <WorkspaceSwitcher
        workspaces={workspaces}
        currentWorkspaceId={workspaceId ?? null}
      />
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
