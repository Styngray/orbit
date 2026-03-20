"use client"

import { useDroppable } from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { KanbanTaskCard } from "./kanban-task-card"
import { QuickAddTask } from "./quick-add-task"
import type { Task } from "@/lib/actions/tasks"
import type { TaskStatus } from "@/lib/kanban-constants"

type QuickAddState = "idle" | "editing" | "submitting"

interface Member {
  user_id: string
  profiles: {
    id: string
    display_name: string | null
    avatar_url: string | null
  } | null
}

interface KanbanColumnProps {
  status: TaskStatus
  label: string
  color: string
  tasks: Task[]
  members: Member[]
  quickAddState: QuickAddState
  onQuickAddStateChange: (state: QuickAddState) => void
  onQuickAdd: (title: string, status: TaskStatus) => Promise<void>
  onTaskClick: (task: Task) => void
}

export function KanbanColumn({
  status,
  label,
  color,
  tasks,
  members,
  quickAddState,
  onQuickAddStateChange,
  onQuickAdd,
  onTaskClick,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div className="flex flex-col w-72 shrink-0">
      {/* Column header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className={`size-2.5 rounded-full ${color}`} />
        <span className="text-sm font-medium">{label}</span>
        <span className="ml-auto text-xs text-muted-foreground">
          {tasks.length}
        </span>
      </div>

      {/* Task list */}
      <div
        ref={setNodeRef}
        className={`flex flex-col gap-2 flex-1 rounded-lg p-1 min-h-[60px] transition-colors ${
          isOver ? "bg-muted/50" : ""
        }`}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <KanbanTaskCard
              key={task.id}
              task={task}
              members={members}
              onClick={onTaskClick}
            />
          ))}
        </SortableContext>
      </div>

      {/* Quick add */}
      <div className="mt-2">
        <QuickAddTask
          status={status}
          state={quickAddState}
          onStateChange={onQuickAddStateChange}
          onSubmit={onQuickAdd}
        />
      </div>
    </div>
  )
}
