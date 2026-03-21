import { Circle, CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TaskStatus } from "@/lib/kanban-constants"

const statusMap: Record<TaskStatus, { icon: React.ElementType; cls: string }> = {
  backlog:     { icon: Circle,       cls: "text-slate-400" },
  todo:        { icon: Circle,       cls: "text-blue-400" },
  in_progress: { icon: Circle,       cls: "text-yellow-400 fill-yellow-400/30" },
  done:        { icon: CheckCircle2, cls: "text-green-400 fill-green-400/20" },
  cancelled:   { icon: XCircle,     cls: "text-red-400 fill-red-400/20" },
}

export function StatusIcon({ status, className }: { status: TaskStatus; className?: string }) {
  const { icon: Icon, cls } = statusMap[status]
  return <Icon className={cn("size-4 shrink-0", cls, className)} />
}
