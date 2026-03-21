"use client"

import { useState } from "react"
import { Plus, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { LABELS, LABEL_COLORS, type CustomLabel, type LabelColor } from "@/lib/label-constants"
import { createLabel } from "@/lib/actions/labels"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface LabelSelectorProps {
  selected: string[]
  onChange: (labels: string[]) => void
  workspaceId: string
  customLabels: CustomLabel[]
  onLabelCreated: (label: CustomLabel) => void
}

export function LabelSelector({
  selected,
  onChange,
  workspaceId,
  customLabels,
  onLabelCreated,
}: LabelSelectorProps) {
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState("")
  const [newColor, setNewColor] = useState<LabelColor>("blue")
  const [loading, setLoading] = useState(false)

  function toggle(value: string) {
    onChange(
      selected.includes(value)
        ? selected.filter((l) => l !== value)
        : [...selected, value]
    )
  }

  async function handleCreate() {
    if (!newName.trim()) return
    setLoading(true)
    const { data, error } = await createLabel(workspaceId, newName.trim(), newColor)
    setLoading(false)
    if (error) {
      toast.error(error)
      return
    }
    if (data) {
      onLabelCreated(data as CustomLabel)
      onChange([...selected, data.name])
    }
    setNewName("")
    setNewColor("blue")
    setCreating(false)
  }

  // Build unified label list
  const allLabels: { value: string; label: string; dot: string; text: string }[] = [
    ...LABELS.map((l) => ({ value: l.value, label: l.label, dot: l.dot, text: l.text })),
    ...customLabels.map((l) => {
      const colorDef = LABEL_COLORS.find((c) => c.name === l.color) ?? LABEL_COLORS[7]
      return { value: l.name, label: l.name, dot: colorDef.dot, text: colorDef.text }
    }),
  ]

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {allLabels.map((label) => {
          const active = selected.includes(label.value)
          return (
            <button
              key={label.value}
              type="button"
              onClick={() => toggle(label.value)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition-colors",
                active
                  ? "border-transparent bg-accent"
                  : "border-border bg-transparent hover:bg-accent/50"
              )}
            >
              <span className={cn("size-1.5 rounded-full", label.dot)} />
              <span className={label.text}>{label.label}</span>
              {active && <Check className="size-3 ml-0.5 text-muted-foreground" />}
            </button>
          )
        })}

        {!creating && (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs border border-dashed border-border text-muted-foreground hover:bg-accent/50 transition-colors"
          >
            <Plus className="size-3" />
            New label
          </button>
        )}
      </div>

      {creating && (
        <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/30">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Label name"
            className="h-7 text-xs flex-1"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); handleCreate() }
              if (e.key === "Escape") { setCreating(false); setNewName("") }
            }}
          />
          <div className="flex items-center gap-1 shrink-0">
            {LABEL_COLORS.map((color) => (
              <button
                key={color.name}
                type="button"
                onClick={() => setNewColor(color.name as LabelColor)}
                className={cn(
                  "size-4 rounded-full transition-transform",
                  color.dot,
                  newColor === color.name && "ring-2 ring-offset-1 ring-foreground scale-110"
                )}
              />
            ))}
          </div>
          <Button
            type="button"
            size="sm"
            className="h-7 text-xs px-2"
            onClick={handleCreate}
            disabled={loading || !newName.trim()}
          >
            Add
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs px-2"
            onClick={() => { setCreating(false); setNewName("") }}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  )
}
