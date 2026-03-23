"use client"

import { useState, useOptimistic, useTransition, useEffect, useCallback, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  closestCorners,
} from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { LayoutGrid, List, Sparkles, Plus } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { TooltipProvider } from "@/components/ui/tooltip"
import { KanbanColumn } from "./kanban-column"
import { KanbanList } from "./kanban-list"
import { TaskSheet } from "./task-sheet"
import { NewIssueDialog } from "./new-issue-dialog"
import { AIChatSheet } from "@/components/app/ai-chat-sheet"
import { createTask, reorderTask, updateTask } from "@/lib/actions/tasks"
import { createBoardStatus, updateBoardStatus, deleteBoardStatus } from "@/lib/actions/statuses"
import type { BoardStatus } from "@/lib/actions/statuses"
import { type TaskPriority } from "@/lib/kanban-constants"
import type { Task } from "@/lib/actions/tasks"
import type { CustomLabel } from "@/lib/label-constants"

type ViewMode = "board" | "list"

const PRIORITY_RANK: Record<TaskPriority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
  none: 4,
}

function sortByPriority(a: Task, b: Task): number {
  const pa = PRIORITY_RANK[a.priority as TaskPriority] ?? 4
  const pb = PRIORITY_RANK[b.priority as TaskPriority] ?? 4
  if (pa !== pb) return pa - pb
  return a.sort_order - b.sort_order
}

interface Member {
  user_id: string
  profiles: {
    id: string
    display_name: string | null
    avatar_url: string | null
  } | null
}

interface KanbanBoardProps {
  initialTasks: Task[]
  initialStatuses: BoardStatus[]
  members: Member[]
  boardId: string
  workspaceId: string
  teamId: string
  boardName: string
  customLabels: CustomLabel[]
  isPro: boolean
}

type OptimisticAction =
  | { type: "add"; task: Task }
  | { type: "move"; taskId: string; status: string; sortOrder: number }
  | { type: "update"; taskId: string; patch: Partial<Task> }
  | { type: "delete"; taskId: string }
  | { type: "moveStatus"; fromStatus: string; toStatus: string }

function applyOptimistic(tasks: Task[], action: OptimisticAction): Task[] {
  switch (action.type) {
    case "add":
      return [...tasks, action.task]
    case "move":
      return tasks.map((t) =>
        t.id === action.taskId
          ? { ...t, status: action.status, sort_order: action.sortOrder }
          : t
      )
    case "update":
      return tasks.map((t) =>
        t.id === action.taskId ? { ...t, ...action.patch } : t
      )
    case "delete":
      return tasks.filter((t) => t.id !== action.taskId)
    case "moveStatus":
      return tasks.map((t) =>
        t.status === action.fromStatus ? { ...t, status: action.toStatus } : t
      )
  }
}

// ── Status color picker ────────────────────────────────────────────────────────

const STATUS_COLORS = [
  "#94a3b8", "#60a5fa", "#fbbf24", "#4ade80", "#f87171",
  "#a78bfa", "#fb923c", "#38bdf8", "#f472b6", "#2dd4bf",
]

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {STATUS_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={cn(
            "size-5 rounded-full transition-transform hover:scale-110",
            value === c && "ring-2 ring-offset-1 ring-ring"
          )}
          style={{ backgroundColor: c }}
        />
      ))}
    </div>
  )
}

// ── Add status button ──────────────────────────────────────────────────────────

function AddStatusButton({ onAdd }: { onAdd: (label: string, color: string) => Promise<void> }) {
  const [open, setOpen] = useState(false)
  const [label, setLabel] = useState("")
  const [color, setColor] = useState(STATUS_COLORS[0])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleOpen() {
    setLabel("")
    setColor(STATUS_COLORS[0])
    setOpen(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = label.trim()
    if (!trimmed) return
    setLoading(true)
    await onAdd(trimmed, color)
    setLoading(false)
    setOpen(false)
  }

  if (!open) {
    return (
      <button
        onClick={handleOpen}
        className="flex items-center gap-1.5 h-8 px-3 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0"
      >
        <Plus className="size-3.5" />
        Add status
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 w-56 shrink-0 p-3 rounded-lg border bg-card shadow-sm"
    >
      <input
        ref={inputRef}
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Status name…"
        className="text-sm bg-transparent border-b border-border focus:outline-none py-0.5"
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
      />
      <ColorPicker value={color} onChange={setColor} />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading || !label.trim()}
          className="flex-1 h-7 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {loading ? "Adding…" : "Add"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex-1 h-7 rounded-md border text-xs font-medium hover:bg-accent transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

// ── Main board ─────────────────────────────────────────────────────────────────

export function KanbanBoard({
  initialTasks,
  initialStatuses,
  members,
  boardId,
  workspaceId,
  teamId,
  boardName,
  customLabels,
  isPro,
}: KanbanBoardProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const [view, setView] = useState<ViewMode>("board")

  const [optimisticTasks, dispatchOptimistic] = useOptimistic(
    initialTasks,
    applyOptimistic
  )

  const [statuses, setStatuses] = useState<BoardStatus[]>(initialStatuses)

  // Local custom labels state so newly created labels appear immediately
  const [localCustomLabels, setLocalCustomLabels] = useState<CustomLabel[]>(customLabels)

  function handleLabelCreated(label: CustomLabel) {
    setLocalCustomLabels((prev) => [...prev, label])
  }

  function handleLabelUpdated(label: CustomLabel) {
    setLocalCustomLabels((prev) => prev.map((l) => l.id === label.id ? label : l))
  }

  function handleLabelDeleted(id: string) {
    setLocalCustomLabels((prev) => prev.filter((l) => l.id !== id))
  }

  // AI chat
  const [aiOpen, setAiOpen] = useState(false)

  // New issue dialog
  const [newIssueOpen, setNewIssueOpen] = useState(false)
  const [newIssueStatus, setNewIssueStatus] = useState<string>("backlog")

  const openNewIssue = useCallback((status: string) => {
    setNewIssueStatus(status)
    setNewIssueOpen(true)
  }, [])

  // Task sheet
  const taskIdParam = searchParams.get("task")
  const [activeTaskId, setActiveTaskId] = useState<string | null>(taskIdParam)
  const activeTask = optimisticTasks.find((t) => t.id === activeTaskId) ?? null

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return

      if (e.key === "n" || e.key === "N") {
        e.preventDefault()
        openNewIssue(statuses[0]?.value ?? "backlog")
      } else if (e.key === "Escape") {
        setActiveTaskId(null)
        setNewIssueOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [openNewIssue, statuses])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const taskId = active.id as string
    const task = optimisticTasks.find((t) => t.id === taskId)
    if (!task) return

    let targetStatus: string
    const statusValues = statuses.map((s) => s.value)
    if (statusValues.includes(over.id as string)) {
      targetStatus = over.id as string
    } else {
      const overTask = optimisticTasks.find((t) => t.id === over.id)
      if (!overTask) return
      targetStatus = overTask.status
    }

    const columnTasks = optimisticTasks
      .filter((t) => t.status === targetStatus && t.id !== taskId)
      .sort(sortByPriority)

    let newOrder: number
    const overTaskId = statusValues.includes(over.id as string)
      ? null
      : (over.id as string)

    if (!overTaskId) {
      const last = columnTasks[columnTasks.length - 1]
      newOrder = last ? last.sort_order + 1 : 0
    } else {
      const overIndex = columnTasks.findIndex((t) => t.id === overTaskId)
      const prev = columnTasks[overIndex - 1]
      const next = columnTasks[overIndex]
      if (!prev && !next) {
        newOrder = 0
      } else if (!prev) {
        newOrder = next.sort_order - 1
      } else if (!next) {
        newOrder = prev.sort_order + 1
      } else {
        newOrder = (prev.sort_order + next.sort_order) / 2
      }
    }

    const statusChanged = task.status !== targetStatus

    startTransition(async () => {
      dispatchOptimistic({ type: "move", taskId, status: targetStatus, sortOrder: newOrder })
      const { error } = await reorderTask(taskId, workspaceId, targetStatus, newOrder)
      if (error) toast.error("Failed to move task")
      if (statusChanged) router.refresh()
    })
  }

  async function handleCreateIssue(data: {
    title: string
    description: string | null
    status: string
    priority: TaskPriority
    assignee_id: string | null
    due_date: string | null
    labels: string[]
  }) {
    const { data: task, error } = await createTask(boardId, workspaceId, data)
    if (error) {
      toast.error(error)
      return
    }
    if (task) {
      startTransition(() => {
        dispatchOptimistic({ type: "add", task })
      })
    }
  }

  function openTask(task: Task) {
    setActiveTaskId(task.id)
    const params = new URLSearchParams(searchParams.toString())
    params.set("task", task.id)
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  function handleTaskUpdate(taskId: string, patch: Partial<Task>) {
    const { id: _id, board_id: _bid, sort_order: _so, created_at: _ca, ...dbPatch } = patch as Task
    startTransition(async () => {
      dispatchOptimistic({ type: "update", taskId, patch })
      const { error } = await updateTask(taskId, workspaceId, dbPatch, boardId)
      if (error) toast.error(error)
      else router.refresh()
    })
  }

  function handleTaskDelete(taskId: string) {
    startTransition(() => {
      dispatchOptimistic({ type: "delete", taskId })
    })
  }

  // ── Status management ────────────────────────────────────────────────────────

  async function handleAddStatus(label: string, color: string) {
    const { data, error } = await createBoardStatus(boardId, workspaceId, label, color)
    if (error) { toast.error(error); return }
    if (data) setStatuses((prev) => [...prev, data])
  }

  async function handleRenameStatus(id: string, label: string) {
    setStatuses((prev) => prev.map((s) => s.id === id ? { ...s, label } : s))
    const { error } = await updateBoardStatus(id, boardId, workspaceId, { label })
    if (error) {
      toast.error(error)
      router.refresh()
    }
  }

  async function handleColorChangeStatus(id: string, color: string) {
    setStatuses((prev) => prev.map((s) => s.id === id ? { ...s, color } : s))
    const { error } = await updateBoardStatus(id, boardId, workspaceId, { color })
    if (error) {
      toast.error(error)
      router.refresh()
    }
  }

  async function handleDeleteStatus(id: string, moveToValue: string) {
    const deletedStatus = statuses.find((s) => s.id === id)
    if (!deletedStatus) return

    // Optimistically remove the status and move tasks
    setStatuses((prev) => prev.filter((s) => s.id !== id))
    startTransition(() => {
      dispatchOptimistic({ type: "moveStatus", fromStatus: deletedStatus.value, toStatus: moveToValue })
    })

    const { error } = await deleteBoardStatus(id, boardId, workspaceId, moveToValue)
    if (error) {
      toast.error(error)
      router.refresh()
    } else {
      router.refresh()
    }
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full">
        {/* Toolbar */}
        <div className="flex items-center border-b shrink-0 h-11 gap-3" style={{ paddingLeft: "24px", paddingRight: "24px" }}>
          <span className="font-semibold text-lg truncate">{boardName}</span>
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => setView("board")}
              className={cn(
                "flex items-center gap-1.5 px-3 h-7 rounded-md text-sm font-medium transition-colors",
                view === "board"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              <LayoutGrid className="size-3.5" />
              Board
            </button>
            <button
              onClick={() => setView("list")}
              className={cn(
                "flex items-center gap-1.5 px-3 h-7 rounded-md text-sm font-medium transition-colors",
                view === "list"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              <List className="size-3.5" />
              List
            </button>
            <button
              onClick={() => setAiOpen(true)}
              className="flex items-center gap-1.5 px-3 h-7 rounded-md text-sm font-medium bg-[#0029bb]/15 hover:bg-[#0029bb]/25 text-[#4d79ff] transition-colors"
            >
              <Sparkles className="size-3.5" />
              Ask AI
            </button>
          </div>
        </div>

        {/* Content */}
        {view === "list" ? (
          <KanbanList
            tasks={optimisticTasks}
            members={members}
            customLabels={localCustomLabels}
            statuses={statuses}
            onTaskClick={openTask}
          />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 p-6 overflow-x-auto flex-1 items-start">
              {statuses.map((statusConfig) => {
                const columnTasks = optimisticTasks
                  .filter((t) => t.status === statusConfig.value)
                  .sort(sortByPriority)

                return (
                  <KanbanColumn
                    key={statusConfig.id}
                    statusId={statusConfig.id}
                    status={statusConfig.value}
                    label={statusConfig.label}
                    color={statusConfig.color}
                    tasks={columnTasks}
                    members={members}
                    customLabels={localCustomLabels}
                    allStatuses={statuses}
                    canDelete={statuses.length > 1}
                    onAddTask={openNewIssue}
                    onTaskClick={openTask}
                    onRename={handleRenameStatus}
                    onColorChange={handleColorChangeStatus}
                    onDelete={handleDeleteStatus}
                  />
                )
              })}
              <AddStatusButton onAdd={handleAddStatus} />
            </div>
          </DndContext>
        )}

        {/* New Issue Dialog */}
        <NewIssueDialog
          open={newIssueOpen}
          onOpenChange={setNewIssueOpen}
          defaultStatus={newIssueStatus}
          members={members}
          workspaceId={workspaceId}
          customLabels={localCustomLabels}
          statuses={statuses}
          onLabelCreated={handleLabelCreated}
          onSubmit={handleCreateIssue}
        />

        {/* AI chat */}
        <AIChatSheet
          open={aiOpen}
          onOpenChange={setAiOpen}
          teamId={teamId}
          isPro={isPro}
        />

        {/* Task sheet */}
        <TaskSheet
          task={activeTask}
          members={members}
          workspaceId={workspaceId}
          customLabels={localCustomLabels}
          statuses={statuses}
          onLabelCreated={handleLabelCreated}
          onLabelUpdated={handleLabelUpdated}
          onLabelDeleted={handleLabelDeleted}
          onClose={() => setActiveTaskId(null)}
          onDelete={handleTaskDelete}
          onUpdate={handleTaskUpdate}
        />
      </div>
    </TooltipProvider>
  )
}
