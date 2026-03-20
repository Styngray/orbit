"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Trash2 } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { updateTask, deleteTask } from "@/lib/actions/tasks"
import {
  STATUSES,
  PRIORITIES,
  type TaskStatus,
  type TaskPriority,
} from "@/lib/kanban-constants"
import type { Task } from "@/lib/actions/tasks"

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
  onClose: () => void
  onDelete: (taskId: string) => void
  onUpdate: (taskId: string, patch: Partial<Task>) => void
}

// Inner component keyed by task.id so state resets automatically on task change
function TaskSheetContent({
  task,
  members,
  workspaceId,
  onClose,
  onDelete,
  onUpdate,
}: {
  task: Task
  members: Member[]
  workspaceId: string
  onClose: () => void
  onDelete: (taskId: string) => void
  onUpdate: (taskId: string, patch: Partial<Task>) => void
}) {
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description ?? "")

  async function handleTitleBlur() {
    if (title === task.title) return
    const trimmed = title.trim()
    if (!trimmed) {
      setTitle(task.title)
      return
    }
    onUpdate(task.id, { title: trimmed })
    const { error } = await updateTask(task.id, workspaceId, { title: trimmed })
    if (error) toast.error(error)
  }

  async function handleDescriptionBlur() {
    if (description === (task.description ?? "")) return
    const trimmed = description.trim() || null
    onUpdate(task.id, { description: trimmed })
    const { error } = await updateTask(task.id, workspaceId, {
      description: trimmed,
    })
    if (error) toast.error(error)
  }

  async function handleStatusChange(value: string) {
    const status = value as TaskStatus
    onUpdate(task.id, { status })
    const { error } = await updateTask(task.id, workspaceId, { status })
    if (error) toast.error(error)
    else router.refresh()
  }

  async function handlePriorityChange(value: string) {
    const priority = value as TaskPriority
    onUpdate(task.id, { priority })
    const { error } = await updateTask(task.id, workspaceId, { priority })
    if (error) toast.error(error)
  }

  async function handleAssigneeChange(value: string) {
    const assignee_id = value === "unassigned" ? null : value
    onUpdate(task.id, { assignee_id })
    const { error } = await updateTask(task.id, workspaceId, { assignee_id })
    if (error) toast.error(error)
  }

  async function handleDelete() {
    const { error } = await deleteTask(task.id, workspaceId)
    if (error) {
      toast.error(error)
    } else {
      onDelete(task.id)
      onClose()
    }
  }

  return (
    <>
      {/* Title — must be first so it renders at the top of the sheet */}
      <input
        className="text-lg font-semibold bg-transparent border-none outline-none w-full"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={handleTitleBlur}
        aria-label="Task title"
      />

      <div className="flex flex-col gap-4">
        {/* Status */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground w-20 shrink-0">
            Status
          </span>
          <Select value={task.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Priority */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground w-20 shrink-0">
            Priority
          </span>
          <Select value={task.priority} onValueChange={handlePriorityChange}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITIES.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Assignee */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground w-20 shrink-0">
            Assignee
          </span>
          <Select
            value={task.assignee_id ?? "unassigned"}
            onValueChange={handleAssigneeChange}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {members.map((m) => {
                if (!m.profiles) return null
                const name = m.profiles.display_name ?? m.user_id
                const initials = name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)
                return (
                  <SelectItem key={m.user_id} value={m.user_id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="size-4">
                        <AvatarImage
                          src={m.profiles.avatar_url ?? undefined}
                        />
                        <AvatarFallback className="text-[8px]">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      {name}
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <span className="text-sm text-muted-foreground">Description</span>
          <Textarea
            placeholder="Add a description…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleDescriptionBlur}
            className="min-h-[120px] resize-none text-sm"
          />
        </div>

        {/* Delete */}
        <div className="mt-auto pt-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="mr-2 size-4" />
            Delete task
          </Button>
        </div>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{task.title}&quot;. This cannot
              be undone.
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

    </>
  )
}

export function TaskSheet({
  task,
  members,
  workspaceId,
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
    <Sheet open={!!task} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col gap-4 overflow-y-auto">
        {task && (
          <>
            <SheetHeader>
              <SheetTitle className="sr-only">Task details</SheetTitle>
            </SheetHeader>
            <TaskSheetContent
              key={task.id}
              task={task}
              members={members}
              workspaceId={workspaceId}
              onClose={() => handleOpenChange(false)}
              onDelete={onDelete}
              onUpdate={onUpdate}
            />
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
