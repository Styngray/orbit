"use client"

import { useRef, useEffect } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { TaskStatus } from "@/lib/kanban-constants"

type QuickAddState = "idle" | "editing" | "submitting"

interface QuickAddTaskProps {
  status: TaskStatus
  state: QuickAddState
  onStateChange: (state: QuickAddState) => void
  onSubmit: (title: string, status: TaskStatus) => Promise<void>
}

export function QuickAddTask({
  status,
  state,
  onStateChange,
  onSubmit,
}: QuickAddTaskProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const isSubmittingRef = useRef(false)

  useEffect(() => {
    if (state === "editing") {
      inputRef.current?.focus()
    }
  }, [state])

  async function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      const title = inputRef.current?.value.trim()
      if (!title) return
      isSubmittingRef.current = true
      onStateChange("submitting")
      await onSubmit(title, status)
      isSubmittingRef.current = false
      onStateChange("idle")
    } else if (e.key === "Escape") {
      onStateChange("idle")
    }
  }

  if (state === "idle") {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start text-muted-foreground"
        onClick={() => onStateChange("editing")}
      >
        <Plus className="mr-1 size-4" />
        Add task
      </Button>
    )
  }

  return (
    <Input
      ref={inputRef}
      placeholder="Task title…"
      disabled={state === "submitting"}
      onKeyDown={handleKeyDown}
      onBlur={() => {
        if (!isSubmittingRef.current && state === "editing") onStateChange("idle")
      }}
      className="h-8 text-sm"
    />
  )
}
