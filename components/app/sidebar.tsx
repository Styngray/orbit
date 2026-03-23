"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Settings, Plus, ChevronDown, LogOut, User, ChevronUp, CreditCard, Bot, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { signOut } from "@/lib/actions/auth"
import { AIChatSheet } from "./ai-chat-sheet"
import { PLAN_LIMITS } from "@/lib/plans"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CreateBoardDialog } from "./create-board-dialog"
import { deleteBoard } from "@/lib/actions/boards"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { CreateWorkspaceDialog } from "./create-workspace-dialog"
import { ThemeToggle } from "./theme-toggle"
import { PlanBadge } from "./plan-badge"
import type { Plan } from "@/lib/plans"

const BOARD_COLORS = [
  "#0029bb", // blue
  "#22c55e", // green
  "#f97316", // orange
  "#3b82f6", // blue
  "#ec4899", // pink
  "#eab308", // yellow
  "#14b8a6", // teal
  "#ef4444", // red
]

function boardColor(index: number) {
  return BOARD_COLORS[index % BOARD_COLORS.length]
}

interface Board {
  id: string
  name: string
  workspace_id: string
}

interface Workspace {
  id: string
  name: string
  slug: string
  team_id: string
  teams: { id: string; name: string } | null
}

interface SidebarProps {
  workspaces: Workspace[]
  boards: Board[]
  userDisplayName: string
  userInitials: string
  userEmail: string
  teamPlans: Record<string, string>
}

export function Sidebar({
  workspaces,
  boards,
  userDisplayName,
  userInitials,
  userEmail,
  teamPlans,
}: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [chatOpen, setChatOpen] = useState(false)
  const [deletingBoard, setDeletingBoard] = useState<Board | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  async function handleDeleteBoard() {
    if (!deletingBoard) return
    setDeleteLoading(true)
    const { error } = await deleteBoard(deletingBoard.id, deletingBoard.workspace_id)
    setDeleteLoading(false)
    if (error) {
      toast.error(error)
      setDeletingBoard(null)
      return
    }
    setDeletingBoard(null)
    if (boardId === deletingBoard.id) {
      router.push(`/w/${deletingBoard.workspace_id}`)
    }
  }
  const workspaceId =
    pathname.match(/^\/w\/([^/]+)/)?.[1] ?? workspaces[0]?.id
  const boardId = pathname.match(/^\/w\/[^/]+\/b\/([^/?]+)/)?.[1]

  const currentWorkspace = workspaces.find((w) => w.id === workspaceId)
  const teamId = currentWorkspace?.team_id ?? ""
  const teamName =
    currentWorkspace?.teams?.name ?? currentWorkspace?.name ?? "Orbit"
  const teamInitial = teamName.charAt(0).toUpperCase()
  const currentPlan = (teamPlans[teamId] ?? "free") as Plan

  const workspaceBoards = boards.filter((b) => b.workspace_id === workspaceId)

  return (
    <aside className="flex h-full w-56 flex-col border-r bg-sidebar">
      {/* Team + Workspace header */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex h-14 w-full items-center gap-2.5 border-b border-sidebar-border px-3 hover:bg-sidebar-accent transition-colors">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-[#0029bb] text-white text-xs font-bold select-none">
              {teamInitial}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold text-sidebar-foreground truncate leading-tight">
                {teamName}
              </p>
              <p className="text-xs text-sidebar-foreground/50 truncate leading-tight">
                {currentWorkspace?.name ?? ""}
              </p>
            </div>
            <ChevronDown className="size-3.5 shrink-0 text-sidebar-foreground/40" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-52">
          <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
            Switch workspace
          </DropdownMenuLabel>
          {workspaces.map((ws) => (
            <DropdownMenuItem
              key={ws.id}
              onClick={() => router.push(`/w/${ws.id}`)}
              className={cn(ws.id === workspaceId && "font-medium")}
            >
              {ws.name}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          {currentWorkspace?.team_id ? (
            <CreateWorkspaceDialog
              teamId={currentWorkspace.team_id}
              trigger={
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Plus className="mr-2 size-4" />
                  New workspace
                </DropdownMenuItem>
              }
            />
          ) : (
            <DropdownMenuItem onClick={() => router.push("/onboarding")}>
              <Plus className="mr-2 size-4" />
              New workspace
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Projects section */}
      <div className="flex-1 overflow-y-auto px-3 pt-4">
        <div className="flex items-center justify-between mb-1 px-1">
          <span className="text-[11px] font-medium text-sidebar-foreground/50 uppercase tracking-wider">
            Projects
          </span>
          {workspaceId && (
            <CreateBoardDialog
              workspaceId={workspaceId}
              teamId={teamId}
              currentPlan={currentPlan}
              trigger={
                <button className="size-5 flex items-center justify-center rounded hover:bg-sidebar-accent text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors">
                  <Plus className="size-3.5" />
                </button>
              }
            />
          )}
        </div>

        <nav className="space-y-0.5">
          {workspaceBoards.map((board, i) => (
            <div key={board.id} className="group/row relative flex items-center">
              <Link
                href={`/w/${workspaceId}/b/${board.id}`}
                className={cn(
                  "flex flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors min-w-0",
                  board.id === boardId
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <span
                  className="size-2 rounded-full shrink-0"
                  style={{ backgroundColor: boardColor(i) }}
                />
                <span className="truncate">{board.name}</span>
              </Link>
              <button
                onClick={() => setDeletingBoard(board)}
                className="absolute right-1 opacity-0 group-hover/row:opacity-100 size-5 flex items-center justify-center rounded hover:bg-destructive/15 text-sidebar-foreground/40 hover:text-destructive transition-all"
                title="Delete board"
              >
                <Trash2 className="size-3" />
              </button>
            </div>
          ))}

          {workspaceBoards.length === 0 && workspaceId && (
            <p className="text-xs text-sidebar-foreground/40 px-2 py-1">
              No projects yet
            </p>
          )}
        </nav>
      </div>

      {/* Bottom: Theme toggle + AI chat + Settings + User */}
      <div className="border-t border-sidebar-border">
        <div className="flex items-center px-3 py-1.5">
          <ThemeToggle />
          <button
            onClick={() => setChatOpen(true)}
            className="ml-auto size-7 flex items-center justify-center rounded-md hover:bg-sidebar-accent text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
            title="AI Assistant"
          >
            <Bot className="size-4" />
          </button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-2.5 px-3 py-2.5 hover:bg-sidebar-accent transition-colors">
              <Avatar className="size-6 shrink-0">
                <AvatarFallback className="text-[10px]">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm text-sidebar-foreground/80 truncate leading-tight">
                  {userDisplayName}
                </p>
                <p className="text-[11px] text-sidebar-foreground/40 truncate leading-tight">
                  {userEmail}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <PlanBadge plan={currentPlan} />
                <ChevronUp className="size-3.5 shrink-0 text-sidebar-foreground/40" />
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-52">
            <DropdownMenuItem asChild>
              <a href="/settings/profile" className="cursor-pointer">
                <User className="mr-2 size-4" />
                Profile
              </a>
            </DropdownMenuItem>
            {workspaceId && (
              <DropdownMenuItem onClick={() => router.push(`/w/${workspaceId}/settings`)}>
                <Settings className="mr-2 size-4" />
                Team settings
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild>
              <a href="/settings/billing" className="cursor-pointer">
                <CreditCard className="mr-2 size-4" />
                Billing
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <form action={signOut}>
                <button
                  type="submit"
                  className="flex w-full items-center cursor-pointer"
                >
                  <LogOut className="mr-2 size-4" />
                  Sign out
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AIChatSheet
        open={chatOpen}
        onOpenChange={setChatOpen}
        teamId={teamId}
        isPro={PLAN_LIMITS[currentPlan].ai}
      />

      <AlertDialog open={!!deletingBoard} onOpenChange={(open) => !open && setDeletingBoard(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &quot;{deletingBoard?.name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the board and all its tasks. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBoard}
              disabled={deleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading ? "Deleting…" : "Delete board"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </aside>
  )
}
