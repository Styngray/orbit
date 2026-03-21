"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@/lib/utils"
import { PriorityIcon } from "./priority-icon"
import { TaskAssigneeAvatar } from "./task-assignee-avatar"
import { LABELS } from "@/lib/label-constants"
import type { Task } from "@/lib/actions/tasks"

interface Member {
  user_id: string
  profiles: {
    id: string
    display_name: string | null
    avatar_url: string | null
  } | null
}

interface KanbanTaskCardProps {
  task: Task
  members: Member[]
  onClick: (task: Task) => void
}

export function KanbanTaskCard({ task, members, onClick }: KanbanTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const taskLabels = LABELS.filter((l) => task.labels?.includes(l.value))

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(task)}
      className="cursor-pointer rounded-md border bg-card p-3 shadow-sm hover:shadow-md transition-shadow text-sm select-none"
    >
      <p className="leading-snug mb-2 text-[13px]">{task.title}</p>
      {taskLabels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {taskLabels.map((label) => (
            <span
              key={label.value}
              className={cn("inline-flex items-center gap-1 text-[11px]", label.text)}
            >
              <span className={cn("size-1.5 rounded-full", label.dot)} />
              {label.label}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between gap-2">
        <PriorityIcon priority={task.priority} />
        <TaskAssigneeAvatar assigneeId={task.assignee_id} members={members} />
      </div>
    </div>
  )
}
