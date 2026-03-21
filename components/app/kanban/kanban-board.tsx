"use client"

import { useState, useOptimistic, useTransition, useEffect, useCallback } from "react"
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
import { LayoutGrid, List } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { TooltipProvider } from "@/components/ui/tooltip"
import { KanbanColumn } from "./kanban-column"
import { KanbanList } from "./kanban-list"
import { TaskSheet } from "./task-sheet"
import { NewIssueDialog } from "./new-issue-dialog"
import { createTask, reorderTask } from "@/lib/actions/tasks"
import { STATUSES, type TaskStatus } from "@/lib/kanban-constants"
import type { Task } from "@/lib/actions/tasks"
import type { TaskPriority } from "@/lib/kanban-constants"
import type { CustomLabel } from "@/lib/label-constants"

type ViewMode = "board" | "list"

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
  members: Member[]
  boardId: string
  workspaceId: string
  boardName: string
  customLabels: CustomLabel[]
}

type OptimisticAction =
  | { type: "add"; task: Task }
  | { type: "move"; taskId: string; status: TaskStatus; sortOrder: number }
  | { type: "update"; taskId: string; patch: Partial<Task> }
  | { type: "delete"; taskId: string }

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
  }
}

export function KanbanBoard({
  initialTasks,
  members,
  boardId,
  workspaceId,
  boardName,
  customLabels,
}: KanbanBoardProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const [view, setView] = useState<ViewMode>("board")

  const [optimisticTasks, dispatchOptimistic] = useOptimistic(
    initialTasks,
    applyOptimistic
  )

  // Local custom labels state so newly created labels appear immediately
  const [localCustomLabels, setLocalCustomLabels] = useState<CustomLabel[]>(customLabels)

  function handleLabelCreated(label: CustomLabel) {
    setLocalCustomLabels((prev) => [...prev, label])
  }

  // New issue dialog
  const [newIssueOpen, setNewIssueOpen] = useState(false)
  const [newIssueStatus, setNewIssueStatus] = useState<TaskStatus>("backlog")

  const openNewIssue = useCallback((status: TaskStatus) => {
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
        openNewIssue("backlog")
      } else if (e.key === "Escape") {
        setActiveTaskId(null)
        setNewIssueOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [openNewIssue])

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

    let targetStatus: TaskStatus
    const statusValues = STATUSES.map((s) => s.value)
    if (statusValues.includes(over.id as TaskStatus)) {
      targetStatus = over.id as TaskStatus
    } else {
      const overTask = optimisticTasks.find((t) => t.id === over.id)
      if (!overTask) return
      targetStatus = overTask.status
    }

    const columnTasks = optimisticTasks
      .filter((t) => t.status === targetStatus && t.id !== taskId)
      .sort((a, b) => a.sort_order - b.sort_order)

    let newOrder: number
    const overTaskId = statusValues.includes(over.id as TaskStatus)
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
    status: TaskStatus
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
    startTransition(() => {
      dispatchOptimistic({ type: "update", taskId, patch })
    })
  }

  function handleTaskDelete(taskId: string) {
    startTransition(() => {
      dispatchOptimistic({ type: "delete", taskId })
    })
  }

  const totalCount = optimisticTasks.length

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full">
        {/* Toolbar */}
        <div className="flex items-center border-b shrink-0 px-4 h-11">
          <button
            onClick={() => setView("board")}
            className={cn(
              "flex items-center gap-1.5 px-3 h-full text-sm border-b-2 transition-colors",
              view === "board"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutGrid className="size-4" />
            Board
          </button>
          <button
            onClick={() => setView("list")}
            className={cn(
              "flex items-center gap-1.5 px-3 h-full text-sm border-b-2 transition-colors",
              view === "list"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <List className="size-4" />
            List
          </button>
          <span className="ml-3 text-sm text-muted-foreground">
            {totalCount} {totalCount === 1 ? "task" : "tasks"}
          </span>
        </div>

        {/* Content */}
        {view === "list" ? (
          <KanbanList
            tasks={optimisticTasks}
            members={members}
            customLabels={localCustomLabels}
            onTaskClick={openTask}
          />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 p-6 overflow-x-auto flex-1 items-start">
              {STATUSES.map((statusConfig) => {
                const columnTasks = optimisticTasks
                  .filter((t) => t.status === statusConfig.value)
                  .sort((a, b) => a.sort_order - b.sort_order)

                return (
                  <KanbanColumn
                    key={statusConfig.value}
                    status={statusConfig.value}
                    label={statusConfig.label}
                    color={statusConfig.color}
                    tasks={columnTasks}
                    members={members}
                    customLabels={localCustomLabels}
                    onAddTask={openNewIssue}
                    onTaskClick={openTask}
                  />
                )
              })}
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
          onLabelCreated={handleLabelCreated}
          onSubmit={handleCreateIssue}
        />

        {/* Task sheet */}
        <TaskSheet
          task={activeTask}
          members={members}
          workspaceId={workspaceId}
          customLabels={localCustomLabels}
          onLabelCreated={handleLabelCreated}
          onClose={() => setActiveTaskId(null)}
          onDelete={handleTaskDelete}
          onUpdate={handleTaskUpdate}
        />
      </div>
    </TooltipProvider>
  )
}
