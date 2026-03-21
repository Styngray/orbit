"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface SettingsTabsProps {
  workspaceId: string
}

const tabs = [
  { label: "General", href: (id: string) => `/w/${id}/settings` },
  { label: "Members", href: (id: string) => `/w/${id}/settings/members` },
]

export function SettingsTabs({ workspaceId }: SettingsTabsProps) {
  const pathname = usePathname()

  return (
    <div className="flex gap-1 border-b">
      {tabs.map(({ label, href }) => {
        const url = href(workspaceId)
        const isActive = pathname === url
        return (
          <Link
            key={label}
            href={url}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              isActive
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
          </Link>
        )
      })}
    </div>
  )
}
