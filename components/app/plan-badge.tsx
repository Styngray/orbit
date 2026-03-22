import { cn } from "@/lib/utils"
import type { Plan } from "@/lib/plans"

const styles: Record<Plan, string> = {
  free: "bg-muted text-muted-foreground",
  lite: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  pro:  "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
}

const labels: Record<Plan, string> = {
  free: "Free",
  lite: "Lite",
  pro:  "Pro",
}

interface PlanBadgeProps {
  plan: Plan
  className?: string
}

export function PlanBadge({ plan, className }: PlanBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        styles[plan],
        className
      )}
    >
      {labels[plan]}
    </span>
  )
}
