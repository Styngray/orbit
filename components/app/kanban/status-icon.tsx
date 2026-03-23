import { Circle, CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type KnownStatus = "backlog" | "todo" | "in_progress" | "done" | "cancelled"

const statusMap: Record<KnownStatus, { icon: React.ElementType; cls: string }> = {
  backlog:     { icon: Circle,       cls: "text-slate-400" },
  todo:        { icon: Circle,       cls: "text-blue-400" },
  in_progress: { icon: Circle,       cls: "text-yellow-400 fill-yellow-400/30" },
  done:        { icon: CheckCircle2, cls: "text-green-400 fill-green-400/20" },
  cancelled:   { icon: XCircle,     cls: "text-red-400 fill-red-400/20" },
}

export function StatusIcon({
  status,
  className,
  color,
}: {
  status: string
  className?: string
  color?: string
}) {
  const known = statusMap[status as KnownStatus]
  if (known) {
    const { icon: Icon, cls } = known
    return <Icon className={cn("size-4 shrink-0", cls, className)} />
  }
  // Custom status — render a colored circle
  return (
    <span
      className={cn("inline-block size-4 shrink-0 rounded-full", className)}
      style={{
        backgroundColor: color ? `${color}40` : "#94a3b840",
        border: `2px solid ${color ?? "#94a3b8"}`,
      }}
    />
  )
}
