"use client"

import { useState, useRef, useEffect } from "react"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Plus, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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
import { StatusIcon } from "./status-icon"
import { KanbanTaskCard } from "./kanban-task-card"
import type { Task } from "@/lib/actions/tasks"
import type { BoardStatus } from "@/lib/actions/statuses"
import type { CustomLabel } from "@/lib/label-constants"

interface Member {
  user_id: string
  profiles: {
    id: string
    display_name: string | null
    avatar_url: string | null
  } | null
}

interface KanbanColumnProps {
  statusId: string
  status: string
  label: string
  color: string
  tasks: Task[]
  members: Member[]
  customLabels: CustomLabel[]
  allStatuses: BoardStatus[]
  canDelete: boolean
  onAddTask: (status: string) => void
  onTaskClick: (task: Task) => void
  onRename: (id: string, label: string) => void
  onColorChange: (id: string, color: string) => void
  onDelete: (id: string, moveToValue: string) => void
}

const STATUS_COLORS = [
  "#94a3b8", "#60a5fa", "#fbbf24", "#4ade80", "#f87171",
  "#a78bfa", "#fb923c", "#38bdf8", "#f472b6", "#2dd4bf",
]

export function KanbanColumn({
  statusId,
  status,
  label,
  color,
  tasks,
  members,
  customLabels,
  allStatuses,
  canDelete,
  onAddTask,
  onTaskClick,
  onRename,
  onColorChange,
  onDelete,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  const [isEditing, setIsEditing] = useState(false)
  const [editLabel, setEditLabel] = useState(label)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [colorOpen, setColorOpen] = useState(false)
  const [moveToValue, setMoveToValue] = useState<string>("")
  const inputRef = useRef<HTMLInputElement>(null)

  // Keep editLabel in sync when label changes from outside
  useEffect(() => {
    setEditLabel(label)
  }, [label])

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isEditing])

  // Set default move-to when opening delete dialog
  useEffect(() => {
    if (deleteOpen) {
      const other = allStatuses.find((s) => s.id !== statusId)
      setMoveToValue(other?.value ?? "")
    }
  }, [deleteOpen, allStatuses, statusId])

  function commitRename() {
    const trimmed = editLabel.trim()
    if (trimmed && trimmed !== label) {
      onRename(statusId, trimmed)
    } else {
      setEditLabel(label)
    }
    setIsEditing(false)
  }

  function handleDeleteConfirm() {
    if (!moveToValue && tasks.length > 0) return
    onDelete(statusId, moveToValue)
    setDeleteOpen(false)
  }

  const otherStatuses = allStatuses.filter((s) => s.id !== statusId)

  return (
    <div className="flex flex-col w-72 shrink-0">
      {/* Column header */}
      <div className="flex items-center gap-1.5 mb-3 px-1 group/header">
        {isEditing ? (
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <StatusIcon status={status} color={color} className="size-3.5 shrink-0" />
            <input
              ref={inputRef}
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitRename()
                if (e.key === "Escape") {
                  setEditLabel(label)
                  setIsEditing(false)
                }
              }}
              className="text-sm font-medium bg-transparent border-b border-border focus:outline-none w-full"
            />
          </div>
        ) : (
          <>
            <StatusIcon status={status} color={color} className="size-3.5 shrink-0" />
            <span className="text-sm font-medium">{label}</span>
            <span className="text-xs text-muted-foreground ml-1">{tasks.length}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="ml-auto opacity-0 group-hover/header:opacity-100 flex items-center justify-center size-5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors focus:opacity-100">
                  <MoreHorizontal className="size-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-36">
                <DropdownMenuItem onSelect={() => setIsEditing(true)}>
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setColorOpen(true)}>
                  Change color
                </DropdownMenuItem>
                {canDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={() => setDeleteOpen(true)}
                      className="text-destructive focus:text-destructive"
                    >
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              onClick={() => onAddTask(status)}
              className="flex items-center justify-center size-5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              aria-label={`Add task to ${label}`}
            >
              <Plus className="size-3.5" />
            </button>
          </>
        )}
      </div>

      {/* Task list */}
      <div
        ref={setNodeRef}
        className={`flex flex-col gap-2 flex-1 rounded-lg p-1 min-h-[60px] transition-colors ${
          isOver ? "bg-muted/50" : ""
        }`}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <KanbanTaskCard
              key={task.id}
              task={task}
              members={members}
              customLabels={customLabels}
              onClick={onTaskClick}
            />
          ))}
        </SortableContext>
      </div>

      {/* Add task button */}
      <button
        onClick={() => onAddTask(status)}
        className="mt-2 flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors w-full"
      >
        <Plus className="size-3.5" />
        Add task
      </button>

      {/* Color picker popover */}
      <Popover open={colorOpen} onOpenChange={setColorOpen}>
        <PopoverTrigger asChild>
          <span className="sr-only" />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          <p className="text-xs font-medium text-muted-foreground mb-2">Color</p>
          <div className="flex flex-wrap gap-1.5">
            {STATUS_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => { onColorChange(statusId, c); setColorOpen(false) }}
                className={cn(
                  "size-5 rounded-full border-2 transition-transform hover:scale-110",
                  color === c ? "border-foreground" : "border-transparent"
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{label}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              {tasks.length > 0
                ? `This column has ${tasks.length} task${tasks.length !== 1 ? "s" : ""}. Move them to another status before deleting.`
                : "This column will be permanently deleted."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {tasks.length > 0 && (
            <Select value={moveToValue} onValueChange={setMoveToValue}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Move tasks to…" />
              </SelectTrigger>
              <SelectContent>
                {otherStatuses.map((s) => (
                  <SelectItem key={s.id} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={tasks.length > 0 && !moveToValue}
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
