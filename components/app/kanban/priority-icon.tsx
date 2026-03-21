import { AlertCircle, ChevronUp, ChevronDown, Minus, Equal } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TaskPriority } from "@/lib/kanban-constants"

const priorityMap: Record<TaskPriority, { icon: React.ElementType; cls: string }> = {
  urgent: { icon: AlertCircle, cls: "text-red-500" },
  high:   { icon: ChevronUp,   cls: "text-orange-400" },
  medium: { icon: Equal,       cls: "text-amber-400" },
  low:    { icon: ChevronDown, cls: "text-blue-400" },
  none:   { icon: Minus,       cls: "text-muted-foreground" },
}

export function PriorityIcon({ priority, className }: { priority: TaskPriority; className?: string }) {
  const { icon: Icon, cls } = priorityMap[priority]
  return <Icon className={cn("size-3.5 shrink-0", cls, className)} />
}
