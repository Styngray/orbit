"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Trash2,
  ChevronDown,
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { deleteTask } from "@/lib/actions/tasks"
import { StatusIcon } from "./status-icon"
import { PriorityIcon } from "./priority-icon"
import { LabelSelector } from "./label-selector"
import {
  PRIORITIES,
  type TaskStatus,
  type TaskPriority,
} from "@/lib/kanban-constants"
import type { CustomLabel } from "@/lib/label-constants"
import type { Task } from "@/lib/actions/tasks"
import type { BoardStatus } from "@/lib/actions/statuses"

interface Member {
  user_id: string
  profiles: {
    id: string
    display_name: string | null
    avatar_url: string | null
  } | null
}

interface TaskSheetProps {
  task: Task | null
  members: Member[]
  workspaceId: string
  customLabels: CustomLabel[]
  statuses: BoardStatus[]
  onLabelCreated: (label: CustomLabel) => void
  onLabelUpdated?: (label: CustomLabel) => void
  onLabelDeleted?: (id: string) => void
  onClose: () => void
  onDelete: (taskId: string) => void
  onUpdate: (taskId: string, patch: Partial<Task>) => void
}

// ── Property row ──────────────────────────────────────────────────────────────

function PropRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start min-h-9 gap-4">
      <span className="w-20 shrink-0 text-sm text-muted-foreground pt-1">{label}</span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}

// ── Inner content (keyed by task.id so state resets on task change) ───────────

function TaskSheetContent({
  task,
  members,
  workspaceId,
  customLabels,
  statuses,
  onLabelCreated,
  onLabelUpdated,
  onLabelDeleted,
  onClose,
  onDelete,
  onUpdate,
}: {
  task: Task
  members: Member[]
  workspaceId: string
  customLabels: CustomLabel[]
  statuses: BoardStatus[]
  onLabelCreated: (label: CustomLabel) => void
  onLabelUpdated?: (label: CustomLabel) => void
  onLabelDeleted?: (id: string) => void
  onClose: () => void
  onDelete: (taskId: string) => void
  onUpdate: (taskId: string, patch: Partial<Task>) => void
}) {
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description ?? "")
  const [dueDate, setDueDate] = useState(task.due_date ?? "")

  function handleTitleBlur() {
    if (title === task.title) return
    const trimmed = title.trim()
    if (!trimmed) { setTitle(task.title); return }
    onUpdate(task.id, { title: trimmed })
  }

  function handleDescriptionBlur() {
    if (description === (task.description ?? "")) return
    const trimmed = description.trim() || null
    onUpdate(task.id, { description: trimmed })
  }

  function handleDueDateChange(value: string) {
    setDueDate(value)
    onUpdate(task.id, { due_date: value || null })
  }

  function handleStatusChange(value: string) {
    onUpdate(task.id, { status: value as TaskStatus })
  }

  function handlePriorityChange(value: string) {
    onUpdate(task.id, { priority: value as TaskPriority })
  }

  function handleAssigneeChange(value: string) {
    onUpdate(task.id, { assignee_id: value === "unassigned" ? null : value })
  }

  async function handleDelete() {
    const { error } = await deleteTask(task.id, workspaceId)
    if (error) { toast.error(error) }
    else { onDelete(task.id); onClose() }
  }

  function handleLabelsChange(labels: string[]) {
    onUpdate(task.id, { labels })
  }

  const currentStatus = statuses.find((s) => s.value === task.status)
  const currentPriority = PRIORITIES.find((p) => p.value === task.priority)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Title row */}
      <div className="flex items-start gap-3 px-6 pt-6 pb-5 pr-14">
        <StatusIcon status={task.status} color={currentStatus?.color} className="mt-0.5" />
        <input
          className="flex-1 text-[15px] font-medium bg-transparent border-none outline-none leading-snug resize-none"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          aria-label="Task title"
        />
      </div>

      {/* Properties */}
      <div className="px-6 pb-2 space-y-0.5">
        {/* Status */}
        <PropRow label="Status">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-8 flex items-center gap-1.5 rounded-md px-2 text-sm hover:bg-accent transition-colors">
                <StatusIcon status={task.status} color={currentStatus?.color} />
                <span>{currentStatus?.label}</span>
                <ChevronDown className="size-3 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {statuses.map((s) => (
                <DropdownMenuItem key={s.value} onSelect={() => handleStatusChange(s.value)}>
                  <StatusIcon status={s.value} color={s.color} />
                  {s.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </PropRow>

        {/* Priority */}
        <PropRow label="Priority">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-8 flex items-center gap-1.5 rounded-md px-2 text-sm hover:bg-accent transition-colors">
                <PriorityIcon priority={task.priority} />
                <span>{currentPriority?.label}</span>
                <ChevronDown className="size-3 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {PRIORITIES.map((p) => (
                <DropdownMenuItem key={p.value} onSelect={() => handlePriorityChange(p.value)}>
                  <PriorityIcon priority={p.value} />
                  {p.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </PropRow>

        {/* Assignee */}
        <PropRow label="Assignee">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-8 flex items-center gap-1.5 rounded-md px-2 text-sm hover:bg-accent transition-colors">
                {task.assignee_id ? (() => {
                  const m = members.find((m) => m.user_id === task.assignee_id)
                  if (!m?.profiles) return <span className="text-muted-foreground">Unassigned</span>
                  const name = m.profiles.display_name ?? m.user_id
                  const initials = name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
                  return (
                    <>
                      <Avatar className="size-4">
                        <AvatarImage src={m.profiles.avatar_url ?? undefined} />
                        <AvatarFallback className="text-[8px]">{initials}</AvatarFallback>
                      </Avatar>
                      <span>{name}</span>
                    </>
                  )
                })() : <span className="text-muted-foreground">Unassigned</span>}
                <ChevronDown className="size-3 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onSelect={() => handleAssigneeChange("unassigned")}>
                Unassigned
              </DropdownMenuItem>
              {members.map((m) => {
                if (!m.profiles) return null
                const name = m.profiles.display_name ?? m.user_id
                const initials = name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
                return (
                  <DropdownMenuItem key={m.user_id} onSelect={() => handleAssigneeChange(m.user_id)}>
                    <Avatar className="size-4">
                      <AvatarImage src={m.profiles.avatar_url ?? undefined} />
                      <AvatarFallback className="text-[8px]">{initials}</AvatarFallback>
                    </Avatar>
                    {name}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </PropRow>

        {/* Due date */}
        <PropRow label="Due date">
          <div className="relative flex items-center">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => handleDueDateChange(e.target.value)}
              className={cn(
                "h-8 rounded-md px-2 text-sm bg-transparent border-0 hover:bg-accent cursor-pointer",
                "focus:outline-none focus:ring-0",
                "[color-scheme:dark]",
                !dueDate && "text-muted-foreground"
              )}
            />
          </div>
        </PropRow>

        {/* Labels */}
        <PropRow label="Labels">
          <LabelSelector
            selected={task.labels ?? []}
            onChange={handleLabelsChange}
            workspaceId={workspaceId}
            customLabels={customLabels}
            onLabelCreated={onLabelCreated}
            onLabelUpdated={onLabelUpdated}
            onLabelDeleted={onLabelDeleted}
          />
        </PropRow>
      </div>

      <Separator className="my-4" />

      {/* Description */}
      <div className="px-6 flex-1 overflow-y-auto space-y-2 min-h-0">
        <p className="text-sm text-muted-foreground">Description</p>
        <Textarea
          placeholder="Add a description…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={handleDescriptionBlur}
          className="border-0 shadow-none px-3 py-2 resize-none text-sm min-h-[160px] focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/60"
        />
      </div>

      {/* Footer */}
      <div className="px-6 py-4 flex justify-end border-t">
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="size-4" />
          Delete issue
        </Button>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete issue?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{task.title}&quot;. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ── Public component ──────────────────────────────────────────────────────────

export function TaskSheet({
  task,
  members,
  workspaceId,
  customLabels,
  statuses,
  onLabelCreated,
  onLabelUpdated,
  onLabelDeleted,
  onClose,
  onDelete,
  onUpdate,
}: TaskSheetProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleOpenChange(open: boolean) {
    if (!open) {
      onClose()
      const params = new URLSearchParams(searchParams.toString())
      params.delete("task")
      router.replace(`?${params.toString()}`, { scroll: false })
    }
  }

  return (
    <Sheet open={!!task} onOpenChange={handleOpenChange} modal={false}>
      <SheetContent className="w-full sm:max-w-md p-0 gap-0 overflow-hidden flex flex-col">
        <SheetTitle className="sr-only">Task details</SheetTitle>
        {task && (
          <TaskSheetContent
            key={task.id}
            task={task}
            members={members}
            workspaceId={workspaceId}
            customLabels={customLabels}
            statuses={statuses}
            onLabelCreated={onLabelCreated}
            onLabelUpdated={onLabelUpdated}
            onLabelDeleted={onLabelDeleted}
            onClose={() => handleOpenChange(false)}
            onDelete={onDelete}
            onUpdate={onUpdate}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}
