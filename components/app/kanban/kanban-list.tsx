"use client"

import { STATUSES } from "@/lib/kanban-constants"
import { LABELS } from "@/lib/label-constants"
import { StatusIcon } from "./status-icon"
import { PriorityIcon } from "./priority-icon"
import { TaskAssigneeAvatar } from "./task-assignee-avatar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { Task } from "@/lib/actions/tasks"

interface Member {
  user_id: string
  profiles: {
    id: string
    display_name: string | null
    avatar_url: string | null
  } | null
}

interface KanbanListProps {
  tasks: Task[]
  members: Member[]
  onTaskClick: (task: Task) => void
}

export function KanbanList({ tasks, members, onTaskClick }: KanbanListProps) {
  return (
    <TooltipProvider>
      <div className="flex flex-col h-full overflow-y-auto">
        {/* Header row */}
        <div className="flex items-center border-b px-4 py-2 text-xs font-medium text-muted-foreground shrink-0">
          <div className="w-6 shrink-0" />
          <div className="flex-1 min-w-0 pl-2">Title</div>
          <div className="w-32 shrink-0">Status</div>
          <div className="w-24 shrink-0">Due</div>
          <div className="w-7 shrink-0" />
        </div>

        {/* Task rows */}
        {tasks.map((task) => {
          const statusLabel = STATUSES.find((s) => s.value === task.status)?.label
          const dueDateStr = task.due_date
            ? new Date(task.due_date + "T00:00:00").toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })
            : "—"

          return (
            <div
              key={task.id}
              onClick={() => onTaskClick(task)}
              className="flex items-center border-b px-4 py-2 hover:bg-muted/30 cursor-pointer group"
            >
              <div className="w-6 shrink-0">
                <PriorityIcon priority={task.priority} />
              </div>
              <div className="flex-1 min-w-0 pl-2 flex items-center gap-2">
                <span className="text-sm truncate">{task.title}</span>
                {task.labels?.map((labelValue) => {
                  const labelDef = LABELS.find((l) => l.value === labelValue)
                  if (!labelDef) return null
                  return (
                    <span
                      key={labelValue}
                      className={cn("inline-flex items-center gap-1 text-[11px] shrink-0", labelDef.text)}
                    >
                      <span className={cn("size-1.5 rounded-full", labelDef.dot)} />
                      {labelDef.label}
                    </span>
                  )
                })}
              </div>
              <div className="w-32 shrink-0 flex items-center gap-1.5">
                <StatusIcon status={task.status} className="size-3.5" />
                <span className="text-xs text-muted-foreground">{statusLabel}</span>
              </div>
              <div className="w-24 shrink-0 text-xs text-muted-foreground">
                {dueDateStr}
              </div>
              <div className="w-7 shrink-0 flex justify-end">
                <TaskAssigneeAvatar
                  assigneeId={task.assignee_id}
                  members={members}
                />
              </div>
            </div>
          )
        })}

        {tasks.length === 0 && (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
            No issues yet
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
