import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { WorkspaceSettingsForm } from "@/components/app/workspace-settings-form"

interface Props {
  params: Promise<{ workspaceId: string }>
}

export default async function WorkspaceSettingsPage({ params }: Props) {
  const { workspaceId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id, name, team_id")
    .eq("id", workspaceId)
    .single()

  if (!workspace) notFound()

  const [{ data: team }, { data: membership }] = await Promise.all([
    supabase.from("teams").select("id, name").eq("id", workspace.team_id).single(),
    supabase
      .from("team_members")
      .select("role")
      .eq("team_id", workspace.team_id)
      .eq("user_id", user!.id)
      .single(),
  ])

  const isOwner = membership?.role === "owner"

  return (
    <div className="space-y-8">
      <WorkspaceSettingsForm
        workspace={workspace}
        team={team ?? { id: workspace.team_id, name: "" }}
        isOwner={isOwner}
      />
    </div>
  )
}
