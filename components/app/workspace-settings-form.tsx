"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateWorkspace, deleteWorkspace } from "@/lib/actions/teams"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

interface WorkspaceSettingsFormProps {
  workspace: { id: string; name: string; team_id: string }
  isOwner: boolean
}

export function WorkspaceSettingsForm({
  workspace,
  isOwner,
}: WorkspaceSettingsFormProps) {
  const router = useRouter()
  const [name, setName] = useState(workspace.name)
  const [loading, setLoading] = useState(false)

  async function handleRename(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || name === workspace.name) return
    setLoading(true)
    const { error } = await updateWorkspace(workspace.id, name.trim())
    setLoading(false)
    if (error) {
      toast.error(error)
    } else {
      toast.success("Workspace renamed")
      router.refresh()
    }
  }

  async function handleDelete() {
    setLoading(true)
    const { error } = await deleteWorkspace(workspace.id)
    setLoading(false)
    if (error) {
      toast.error(error)
    } else {
      router.push("/onboarding")
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleRename} className="space-y-4">
        <h2 className="text-lg font-medium">General</h2>
        <div className="space-y-2">
          <Label htmlFor="ws-name">Workspace name</Label>
          <Input
            id="ws-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <Button
          type="submit"
          disabled={loading || name.trim() === workspace.name}
        >
          Save changes
        </Button>
      </form>

      {isOwner && (
        <div className="space-y-4 border-t pt-8">
          <h2 className="text-lg font-medium text-destructive">Danger zone</h2>
          <p className="text-sm text-muted-foreground">
            Permanently delete this workspace and all its boards. This action
            cannot be undone.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={loading}>
                Delete workspace
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete workspace?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete &quot;{workspace.name}&quot; and
                  all boards within it. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  )
}
