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

  const { data: membership } = await supabase
    .from("team_members")
    .select("role")
    .eq("team_id", workspace.team_id)
    .eq("user_id", user!.id)
    .single()

  const isOwner = membership?.role === "owner"

  return (
    <div className="p-6 h-full overflow-y-auto">
    <div className="max-w-2xl space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">
        Workspace settings
      </h1>
      <WorkspaceSettingsForm workspace={workspace} isOwner={isOwner} />
    </div>
    </div>
  )
}
