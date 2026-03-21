import { redirect } from "next/navigation"
import { createTeamAndWorkspace } from "@/lib/actions/teams"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Props {
  searchParams: Promise<{ step?: string; team?: string; error?: string }>
}

export default async function OnboardingPage({ searchParams }: Props) {
  const { step, team, error } = await searchParams

  async function goToWorkspaceStep(formData: FormData) {
    "use server"
    const teamName = (formData.get("teamName") as string)?.trim()
    if (!teamName) return
    redirect(`/onboarding?step=2&team=${encodeURIComponent(teamName)}`)
  }

  async function createWorkspace(formData: FormData) {
    "use server"
    const teamName = (formData.get("teamName") as string)?.trim()
    const workspaceName = (formData.get("workspaceName") as string)?.trim()
    if (!teamName || !workspaceName) return

    const result = await createTeamAndWorkspace(teamName, workspaceName)

    if (result.error) {
      const params = new URLSearchParams({
        step: "2",
        team: teamName,
        error: result.error,
      })
      redirect(`/onboarding?${params}`)
    }

    redirect(`/w/${result.data!.workspaceId}`)
  }

  const isStep2 = step === "2" && !!team

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex min-h-full items-center justify-center py-12">
        <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-8 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className={!isStep2 ? "text-foreground font-medium" : ""}>
              Team
            </span>
            <span>→</span>
            <span className={isStep2 ? "text-foreground font-medium" : ""}>
              Workspace
            </span>
          </div>

          {!isStep2 ? (
            <form action={goToWorkspaceStep} className="space-y-4">
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
                  name="teamName"
                  placeholder="Acme Inc."
                  required
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full">
                Continue
              </Button>
            </form>
          ) : (
            <form action={createWorkspace} className="space-y-4">
              <input type="hidden" name="teamName" value={team} />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Create your first workspace
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Workspaces help you organize boards by project or team.
                </p>
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <div className="space-y-2">
                <Label htmlFor="workspace-name">Workspace name</Label>
                <Input
                  id="workspace-name"
                  name="workspaceName"
                  defaultValue="My Workspace"
                  required
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full">
                Create workspace
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
