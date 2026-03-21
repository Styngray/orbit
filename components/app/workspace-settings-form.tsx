"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateWorkspace, updateTeam, deleteWorkspace } from "@/lib/actions/teams"
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
  team: { id: string; name: string }
  isOwner: boolean
}

export function WorkspaceSettingsForm({
  workspace,
  team,
  isOwner,
}: WorkspaceSettingsFormProps) {
  const router = useRouter()
  const [wsName, setWsName] = useState(workspace.name)
  const [teamName, setTeamName] = useState(team.name)
  const [loading, setLoading] = useState(false)

  async function handleRenameWorkspace(e: React.FormEvent) {
    e.preventDefault()
    if (!wsName.trim() || wsName === workspace.name) return
    setLoading(true)
    const { error } = await updateWorkspace(workspace.id, wsName.trim())
    setLoading(false)
    if (error) {
      toast.error(error)
    } else {
      toast.success("Workspace renamed")
      router.refresh()
    }
  }

  async function handleRenameTeam(e: React.FormEvent) {
    e.preventDefault()
    if (!teamName.trim() || teamName === team.name) return
    setLoading(true)
    const { error } = await updateTeam(team.id, teamName.trim())
    setLoading(false)
    if (error) {
      toast.error(error)
    } else {
      toast.success("Team renamed")
      router.refresh()
    }
  }

  async function handleDelete() {
    setLoading(true)
    const { data, error } = await deleteWorkspace(workspace.id)
    setLoading(false)
    if (error) {
      toast.error(error)
    } else {
      router.push(data?.nextWorkspaceId ? `/w/${data.nextWorkspaceId}` : "/")
    }
  }

  return (
    <div className="space-y-8">
      {/* Team settings */}
      <form onSubmit={handleRenameTeam} className="space-y-4">
        <h2 className="text-lg font-medium">Team</h2>
        <div className="space-y-2">
          <Label htmlFor="team-name">Team name</Label>
          <Input
            id="team-name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            disabled={!isOwner}
          />
          {!isOwner && (
            <p className="text-xs text-muted-foreground">
              Only the team owner can rename the team.
            </p>
          )}
        </div>
        {isOwner && (
          <Button
            type="submit"
            disabled={loading || !teamName.trim() || teamName === team.name}
          >
            Save team name
          </Button>
        )}
      </form>

      {/* Workspace settings */}
      <form onSubmit={handleRenameWorkspace} className="space-y-4 border-t pt-8">
        <h2 className="text-lg font-medium">Workspace</h2>
        <div className="space-y-2">
          <Label htmlFor="ws-name">Workspace name</Label>
          <Input
            id="ws-name"
            value={wsName}
            onChange={(e) => setWsName(e.target.value)}
            required
          />
        </div>
        <Button
          type="submit"
          disabled={loading || !wsName.trim() || wsName === workspace.name}
        >
          Save workspace name
        </Button>
      </form>

      {/* Danger zone */}
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
