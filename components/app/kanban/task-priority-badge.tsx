import { PRIORITIES, type TaskPriority } from "@/lib/kanban-constants"
import { cn } from "@/lib/utils"

interface TaskPriorityBadgeProps {
  priority: TaskPriority
  className?: string
}

export function TaskPriorityBadge({
  priority,
  className,
}: TaskPriorityBadgeProps) {
  const config = PRIORITIES.find((p) => p.value === priority)
  if (!config || priority === "none") return null

  return (
    <span className={cn("text-xs font-medium", config.color, className)}>
      {config.label}
    </span>
  )
}
