export type TaskStatus = string

export type TaskPriority = "urgent" | "high" | "medium" | "low" | "none"

export const STATUSES: {
  value: string
  label: string
  color: string
}[] = [
  { value: "backlog", label: "Backlog", color: "bg-slate-400" },
  { value: "todo", label: "To Do", color: "bg-blue-400" },
  { value: "in_progress", label: "In Progress", color: "bg-yellow-400" },
  { value: "done", label: "Done", color: "bg-green-400" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-400" },
]

export const PRIORITIES: {
  value: TaskPriority
  label: string
  color: string
}[] = [
  { value: "urgent", label: "Urgent", color: "text-red-600" },
  { value: "high", label: "High", color: "text-orange-500" },
  { value: "medium", label: "Medium", color: "text-yellow-500" },
  { value: "low", label: "Low", color: "text-blue-400" },
  { value: "none", label: "None", color: "text-muted-foreground" },
]
