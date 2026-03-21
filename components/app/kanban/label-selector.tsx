"use client"

import { useState } from "react"
import { Plus, Check, Pencil, Trash2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { LABEL_COLORS, type CustomLabel, type LabelColor } from "@/lib/label-constants"
import { createLabel, updateLabel, deleteLabel } from "@/lib/actions/labels"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

interface LabelSelectorProps {
  selected: string[]
  onChange: (labels: string[]) => void
  workspaceId: string
  customLabels: CustomLabel[]
  onLabelCreated: (label: CustomLabel) => void
  onLabelUpdated?: (label: CustomLabel) => void
  onLabelDeleted?: (id: string) => void
}

type EditingState = { id: string; name: string; color: LabelColor }

export function LabelSelector({
  selected,
  onChange,
  workspaceId,
  customLabels,
  onLabelCreated,
  onLabelUpdated,
  onLabelDeleted,
}: LabelSelectorProps) {
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState("")
  const [newColor, setNewColor] = useState<LabelColor>("blue")
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState<EditingState | null>(null)

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
    if (error) { toast.error(error); return }
    if (data) {
      onLabelCreated(data as CustomLabel)
      onChange([...selected, data.name])
    }
    setNewName("")
    setNewColor("blue")
    setCreating(false)
  }

  async function handleUpdate() {
    if (!editing || !editing.name.trim()) return
    setLoading(true)
    const { error } = await updateLabel(editing.id, editing.name.trim(), editing.color, workspaceId)
    setLoading(false)
    if (error) { toast.error(error); return }
    onLabelUpdated?.({ id: editing.id, name: editing.name.trim(), color: editing.color })
    // If the old name was selected, swap to new name
    const original = customLabels.find((l) => l.id === editing.id)
    if (original && selected.includes(original.name)) {
      onChange(selected.map((s) => (s === original.name ? editing.name.trim() : s)))
    }
    setEditing(null)
  }

  async function handleDelete(label: CustomLabel) {
    setLoading(true)
    const { error } = await deleteLabel(label.id, workspaceId)
    setLoading(false)
    if (error) { toast.error(error); return }
    onLabelDeleted?.(label.id)
    onChange(selected.filter((s) => s !== label.name))
    toast.success(`Label "${label.name}" deleted`)
  }

  const allLabels = customLabels.map((l) => {
    const colorDef = LABEL_COLORS.find((c) => c.name === l.color) ?? LABEL_COLORS[7]
    return { value: l.name, label: l.name, dot: colorDef.dot, text: colorDef.text, custom: true as const, id: l.id }
  })

  return (
    <div className="space-y-2">
      {/* Label chips */}
      <div className="flex flex-wrap gap-1.5">
        {allLabels.map((label) => {
          const active = selected.includes(label.value)
          return (
            <div key={label.value} className="group relative inline-flex">
              <button
                type="button"
                onClick={() => toggle(label.value)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition-colors",
                  active
                    ? "border-transparent bg-accent"
                    : "border-border bg-transparent hover:bg-accent/50"
                )}
              >
                <span className={cn("size-1.5 rounded-full shrink-0", label.dot)} />
                <span className={label.text}>{label.label}</span>
                {active && <Check className="size-3 ml-0.5 text-muted-foreground shrink-0" />}
              </button>
              {label.custom && (
                <div className="absolute -top-1 -right-1 hidden group-hover:flex gap-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      const cl = customLabels.find((l) => l.id === label.id)!
                      setEditing({ id: cl.id, name: cl.name, color: cl.color })
                      setCreating(false)
                    }}
                    className="size-4 rounded-full bg-background border border-border flex items-center justify-center hover:bg-accent transition-colors"
                  >
                    <Pencil className="size-2.5 text-muted-foreground" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(customLabels.find((l) => l.id === label.id)!)}
                    className="size-4 rounded-full bg-background border border-border flex items-center justify-center hover:bg-destructive/20 transition-colors"
                  >
                    <Trash2 className="size-2.5 text-destructive" />
                  </button>
                </div>
              )}
            </div>
          )
        })}

        {!creating && !editing && (
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

      {/* Create form */}
      {creating && (
        <LabelForm
          name={newName}
          color={newColor}
          loading={loading}
          onNameChange={setNewName}
          onColorChange={setNewColor}
          onSubmit={handleCreate}
          onCancel={() => { setCreating(false); setNewName("") }}
          submitLabel="Add"
        />
      )}

      {/* Edit form */}
      {editing && (
        <LabelForm
          name={editing.name}
          color={editing.color}
          loading={loading}
          onNameChange={(name) => setEditing((e) => e && { ...e, name })}
          onColorChange={(color) => setEditing((e) => e && { ...e, color })}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(null)}
          submitLabel="Save"
        />
      )}
    </div>
  )
}

function LabelForm({
  name,
  color,
  loading,
  onNameChange,
  onColorChange,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  name: string
  color: LabelColor
  loading: boolean
  onNameChange: (v: string) => void
  onColorChange: (v: LabelColor) => void
  onSubmit: () => void
  onCancel: () => void
  submitLabel: string
}) {
  return (
    <div className="rounded-md border bg-muted/30 p-2 space-y-2">
      <input
        autoFocus
        type="text"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="Label name"
        className="w-full h-7 text-xs rounded-md border border-input bg-transparent px-2 outline-none focus:ring-1 focus:ring-ring"
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); onSubmit() }
          if (e.key === "Escape") onCancel()
        }}
      />
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {LABEL_COLORS.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => onColorChange(c.name as LabelColor)}
              className={cn(
                "size-5 rounded-full transition-transform",
                c.dot,
                color === c.name && "ring-2 ring-offset-1 ring-foreground scale-110"
              )}
            />
          ))}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            type="button"
            size="sm"
            className="h-7 text-xs px-2"
            onClick={onSubmit}
            disabled={loading || !name.trim()}
          >
            {submitLabel}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs px-1"
            onClick={onCancel}
          >
            <X className="size-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
