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
import { toast } from "sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { KanbanColumn } from "./kanban-column"
import { TaskSheet } from "./task-sheet"
import { createTask, reorderTask } from "@/lib/actions/tasks"
import { STATUSES, type TaskStatus } from "@/lib/kanban-constants"
import type { Task } from "@/lib/actions/tasks"

type QuickAddState = "idle" | "editing" | "submitting"

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
}: KanbanBoardProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const [optimisticTasks, dispatchOptimistic] = useOptimistic(
    initialTasks,
    applyOptimistic
  )

  // Quick-add state per column
  const [quickAddStates, setQuickAddStates] = useState<
    Record<TaskStatus, QuickAddState>
  >({
    backlog: "idle",
    todo: "idle",
    in_progress: "idle",
    done: "idle",
    cancelled: "idle",
  })

  // Task sheet
  const taskIdParam = searchParams.get("task")
  const [activeTaskId, setActiveTaskId] = useState<string | null>(taskIdParam)
  const activeTask = optimisticTasks.find((t) => t.id === activeTaskId) ?? null

  // Keyboard shortcuts
  const triggerQuickAdd = useCallback((status: TaskStatus) => {
    setQuickAddStates((prev) => ({ ...prev, [status]: "editing" }))
  }, [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return

      if (e.key === "n" || e.key === "N") {
        e.preventDefault()
        triggerQuickAdd("backlog")
      } else if (e.key === "Escape") {
        setActiveTaskId(null)
        setQuickAddStates({
          backlog: "idle",
          todo: "idle",
          in_progress: "idle",
          done: "idle",
          cancelled: "idle",
        })
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [triggerQuickAdd])

  // DnD sensors
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

    // Determine target status: over could be a column id (status) or a task id
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

    // Find new sort_order using midpoint strategy
    let newOrder: number
    const overTaskId = statusValues.includes(over.id as TaskStatus)
      ? null
      : (over.id as string)

    if (!overTaskId) {
      // Dropped on column — place at end
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

  async function handleQuickAdd(title: string, status: TaskStatus) {
    const { data, error } = await createTask(boardId, workspaceId, {
      title,
      status,
    })
    if (error) {
      toast.error(error)
      return
    }
    if (data) {
      startTransition(() => {
        dispatchOptimistic({ type: "add", task: data })
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

  return (
    <TooltipProvider>
    <div className="flex flex-col h-full">
      {/* Board header */}
      <div className="px-6 py-4 border-b shrink-0">
        <h1 className="text-lg font-semibold">{boardName}</h1>
      </div>

      {/* Kanban columns */}
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
                quickAddState={quickAddStates[statusConfig.value]}
                onQuickAddStateChange={(state) =>
                  setQuickAddStates((prev) => ({
                    ...prev,
                    [statusConfig.value]: state,
                  }))
                }
                onQuickAdd={handleQuickAdd}
                onTaskClick={openTask}
              />
            )
          })}
        </div>
      </DndContext>

      {/* Task sheet */}
      <TaskSheet
        task={activeTask}
        members={members}
        workspaceId={workspaceId}
        onClose={() => setActiveTaskId(null)}
        onDelete={handleTaskDelete}
        onUpdate={handleTaskUpdate}
      />
    </div>
    </TooltipProvider>
  )
}
