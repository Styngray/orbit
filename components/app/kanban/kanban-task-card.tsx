"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { TaskPriorityBadge } from "./task-priority-badge"
import { TaskAssigneeAvatar } from "./task-assignee-avatar"
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(task)}
      className="group cursor-pointer rounded-md border bg-card p-3 shadow-sm hover:shadow-md transition-shadow text-sm select-none"
    >
      <p className="font-medium leading-snug mb-2">{task.title}</p>
      <div className="flex items-center justify-between gap-2">
        <TaskPriorityBadge priority={task.priority} />
        <TaskAssigneeAvatar assigneeId={task.assignee_id} members={members} />
      </div>
    </div>
  )
}
