"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createTeamAndWorkspace } from "@/lib/actions/teams"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [teamName, setTeamName] = useState("")
  const [workspaceName, setWorkspaceName] = useState("My Workspace")
  const [loading, setLoading] = useState(false)

  function handleTeamStep(e: React.FormEvent) {
    e.preventDefault()
    if (!teamName.trim()) return
    setStep(2)
  }

  async function handleCreateWorkspace(e: React.FormEvent) {
    e.preventDefault()
    if (!teamName.trim() || !workspaceName.trim()) return
    setLoading(true)
    const result = await createTeamAndWorkspace(teamName.trim(), workspaceName.trim())
    setLoading(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    router.push(`/w/${result.data!.workspaceId}`)
  }

  return (
    <div className="p-6 h-full overflow-y-auto">
    <div className="flex min-h-full items-center justify-center py-12">
      <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-8 shadow-sm">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className={step >= 1 ? "text-foreground font-medium" : ""}>
            Team
          </span>
          <span>→</span>
          <span className={step >= 2 ? "text-foreground font-medium" : ""}>
            Workspace
          </span>
        </div>

        {step === 1 && (
          <form onSubmit={handleTeamStep} className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Name your team
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Your team is where your workspaces and boards live.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="team-name">Team name</Label>
              <Input
                id="team-name"
                placeholder="Acme Inc."
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                autoFocus
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating…" : "Continue"}
            </Button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleCreateWorkspace} className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Create your first workspace
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Workspaces help you organize boards by project or team.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="workspace-name">Workspace name</Label>
              <Input
                id="workspace-name"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                autoFocus
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating…" : "Create workspace"}
            </Button>
          </form>
        )}
      </div>
    </div>
    </div>
  )
}
