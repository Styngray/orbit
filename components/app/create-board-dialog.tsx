"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { createBoard } from "@/lib/actions/boards"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { UpgradeModal } from "./upgrade-modal"
import type { Plan } from "@/lib/plans"

interface CreateBoardDialogProps {
  workspaceId: string
  teamId: string
  currentPlan?: Plan
  trigger?: React.ReactNode
}

export function CreateBoardDialog({ workspaceId, teamId, currentPlan = "free", trigger }: CreateBoardDialogProps) {
  const [open, setOpen] = useState(false)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    const result = await createBoard(workspaceId, name.trim())
    setLoading(false)
    if (result.limitReached) {
      setOpen(false)
      setUpgradeOpen(true)
    } else if (result.error) {
      toast.error(result.error)
    } else {
      setName("")
      setOpen(false)
      if (result.data?.boardId) {
        window.location.href = `/w/${workspaceId}/b/${result.data.boardId}`
      }
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger ?? (
            <Button size="sm">
              <Plus className="mr-1 size-4" />
              New board
            </Button>
          )}
        </DialogTrigger>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Create board</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 py-4">
              <Label htmlFor="board-name">Board name</Label>
              <Input
                id="board-name"
                placeholder="e.g. Sprint 1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating…" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {currentPlan !== "pro" && (
        <UpgradeModal
          open={upgradeOpen}
          onOpenChange={setUpgradeOpen}
          teamId={teamId}
          reason="board_limit"
          currentPlan={currentPlan as "free" | "lite"}
        />
      )}
    </>
  )
}
