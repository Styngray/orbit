"use client"

import { useRouter } from "next/navigation"
import { ChevronDown, Plus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export type Workspace = {
  id: string
  name: string
  slug: string
  team_id: string
}

interface WorkspaceSwitcherProps {
  workspaces: Workspace[]
  currentWorkspaceId: string | null
}

export function WorkspaceSwitcher({
  workspaces,
  currentWorkspaceId,
}: WorkspaceSwitcherProps) {
  const router = useRouter()
  const current = workspaces.find((w) => w.id === currentWorkspaceId)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex h-14 w-full items-center justify-between border-b border-sidebar-border px-4 transition-colors hover:bg-sidebar-accent">
          <span className="truncate text-sm font-semibold text-sidebar-foreground">
            {current?.name ?? "Orbit"}
          </span>
          <ChevronDown className="size-4 shrink-0 text-sidebar-foreground/50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        {workspaces.map((workspace) => (
          <DropdownMenuItem
            key={workspace.id}
            onClick={() => router.push(`/w/${workspace.id}`)}
            className={cn(
              workspace.id === currentWorkspaceId && "font-medium"
            )}
          >
            {workspace.name}
          </DropdownMenuItem>
        ))}
        {workspaces.length > 0 && <DropdownMenuSeparator />}
        <DropdownMenuItem onClick={() => router.push("/onboarding")}>
          <Plus className="mr-2 size-4" />
          New workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
