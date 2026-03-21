"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StatusIcon } from "./status-icon"
import { PriorityIcon } from "./priority-icon"
import { LabelSelector } from "./label-selector"
import { STATUSES, PRIORITIES, type TaskStatus, type TaskPriority } from "@/lib/kanban-constants"
import type { CustomLabel } from "@/lib/label-constants"
import { ChevronDown } from "lucide-react"

interface Member {
  user_id: string
  profiles: {
    id: string
    display_name: string | null
    avatar_url: string | null
  } | null
}

interface NewIssueDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultStatus: TaskStatus
  members: Member[]
  workspaceId: string
  customLabels: CustomLabel[]
  onLabelCreated: (label: CustomLabel) => void
  onSubmit: (data: {
    title: string
    description: string | null
    status: TaskStatus
    priority: TaskPriority
    assignee_id: string | null
    due_date: string | null
    labels: string[]
  }) => Promise<void>
}

export function NewIssueDialog({
  open,
  onOpenChange,
  defaultStatus,
  members,
  workspaceId,
  customLabels,
  onLabelCreated,
  onSubmit,
}: NewIssueDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<TaskStatus>(defaultStatus)
  const [priority, setPriority] = useState<TaskPriority>("none")
  const [assigneeId, setAssigneeId] = useState<string | null>(null)
  const [dueDate, setDueDate] = useState("")
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  // Reset state when dialog opens with a new defaultStatus
  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setTitle("")
      setDescription("")
      setStatus(defaultStatus)
      setPriority("none")
      setAssigneeId(null)
      setDueDate("")
      setSelectedLabels([])
    }
    onOpenChange(nextOpen)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    await onSubmit({
      title: title.trim(),
      description: description.trim() || null,
      status,
      priority,
      assignee_id: assigneeId,
      due_date: dueDate || null,
      labels: selectedLabels,
    })
    setLoading(false)
    onOpenChange(false)
  }

  const currentStatus = STATUSES.find((s) => s.value === status)
  const currentPriority = PRIORITIES.find((p) => p.value === priority)
  const assigneeMember = members.find((m) => m.user_id === assigneeId)
  const assigneeName = assigneeMember?.profiles?.display_name ?? assigneeMember?.user_id ?? null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New Task</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Title</label>
              <Input
                placeholder="Task title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Add a description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[80px] resize-none"
              />
            </div>

            {/* Status + Priority */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Status</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm hover:bg-accent transition-colors"
                    >
                      <StatusIcon status={status} className="size-3.5" />
                      <span className="flex-1 text-left">{currentStatus?.label}</span>
                      <ChevronDown className="size-3.5 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-44">
                    {STATUSES.map((s) => (
                      <DropdownMenuItem key={s.value} onSelect={() => setStatus(s.value)}>
                        <StatusIcon status={s.value} className="size-3.5" />
                        {s.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Priority</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm hover:bg-accent transition-colors"
                    >
                      <PriorityIcon priority={priority} className="size-3.5" />
                      <span className="flex-1 text-left">{currentPriority?.label ?? "No priority"}</span>
                      <ChevronDown className="size-3.5 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-44">
                    {PRIORITIES.map((p) => (
                      <DropdownMenuItem key={p.value} onSelect={() => setPriority(p.value)}>
                        <PriorityIcon priority={p.value} className="size-3.5" />
                        {p.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Assignee + Due date */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Assignee</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm hover:bg-accent transition-colors"
                    >
                      <span className="flex-1 text-left truncate">
                        {assigneeName ?? "Unassigned"}
                      </span>
                      <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-44">
                    <DropdownMenuItem onSelect={() => setAssigneeId(null)}>
                      Unassigned
                    </DropdownMenuItem>
                    {members.map((m) => {
                      if (!m.profiles) return null
                      const name = m.profiles.display_name ?? m.user_id
                      const initials = name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                      return (
                        <DropdownMenuItem key={m.user_id} onSelect={() => setAssigneeId(m.user_id)}>
                          <Avatar className="size-4">
                            <AvatarImage src={m.profiles.avatar_url ?? undefined} />
                            <AvatarFallback className="text-[8px]">{initials}</AvatarFallback>
                          </Avatar>
                          {name}
                        </DropdownMenuItem>
                      )
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Due date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm [color-scheme:dark] focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>

            {/* Labels */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Labels</label>
              <LabelSelector
                selected={selectedLabels}
                onChange={setSelectedLabels}
                workspaceId={workspaceId}
                customLabels={customLabels}
                onLabelCreated={onLabelCreated}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !title.trim()}>
              {loading ? "Creating\u2026" : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
