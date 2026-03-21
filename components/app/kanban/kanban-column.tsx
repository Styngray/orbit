"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Plus } from "lucide-react"
import { StatusIcon } from "./status-icon"
import { KanbanTaskCard } from "./kanban-task-card"
import type { Task } from "@/lib/actions/tasks"
import type { TaskStatus } from "@/lib/kanban-constants"
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
  status: TaskStatus
  label: string
  color: string
  tasks: Task[]
  members: Member[]
  customLabels: CustomLabel[]
  onAddTask: (status: TaskStatus) => void
  onTaskClick: (task: Task) => void
}

export function KanbanColumn({
  status,
  label,
  tasks,
  members,
  customLabels,
  onAddTask,
  onTaskClick,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div className="flex flex-col w-72 shrink-0">
      {/* Column header */}
      <div className="flex items-center gap-1.5 mb-3 px-1">
        <StatusIcon status={status} className="size-3.5" />
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-muted-foreground ml-1">{tasks.length}</span>
        <button
          onClick={() => onAddTask(status)}
          className="ml-auto flex items-center justify-center size-5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          aria-label={`Add task to ${label}`}
        >
          <Plus className="size-3.5" />
        </button>
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
    </div>
  )
}
