import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MembersList } from "@/components/app/members-list"
import { InviteMemberForm } from "@/components/app/invite-member-form"
import { PendingInvitationsList } from "@/components/app/pending-invitations-list"

interface Props {
  params: Promise<{ workspaceId: string }>
}

export default async function MembersPage({ params }: Props) {
  const { workspaceId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id, team_id")
    .eq("id", workspaceId)
    .single()

  if (!workspace) notFound()

  const [{ data: membersRaw }, { data: membership }, { data: invitations }] =
    await Promise.all([
      supabase
        .from("team_members")
        .select("user_id, role, profiles(display_name, email)")
        .eq("team_id", workspace.team_id)
        .order("created_at"),
      supabase
        .from("team_members")
        .select("role")
        .eq("team_id", workspace.team_id)
        .eq("user_id", user!.id)
        .single(),
      supabase
        .from("invitations")
        .select("id, email, role, expires_at")
        .eq("team_id", workspace.team_id)
        .is("accepted_at", null)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false }),
    ])

  const members = (membersRaw ?? []).map((m) => ({
    user_id: m.user_id,
    role: m.role,
    profiles: Array.isArray(m.profiles) ? (m.profiles[0] ?? null) : m.profiles,
  }))

  const currentUserRole = membership?.role ?? "member"
  const isAdmin = ["owner", "admin"].includes(currentUserRole)

  return (
    <div className="space-y-8">
      {isAdmin && (
        <section className="space-y-4">
          <div>
            <h2 className="text-base font-medium">Invite a teammate</h2>
            <p className="text-sm text-muted-foreground">
              They&apos;ll receive an email with a link to join your team.
            </p>
          </div>
          <InviteMemberForm teamId={workspace.team_id} workspaceId={workspaceId} />
        </section>
      )}

      <section className="space-y-6">
        <h2 className="text-base font-medium">Members</h2>

        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            Members ({members.length})
          </p>
          <MembersList
            members={members}
            currentUserId={user!.id}
            currentUserRole={currentUserRole}
            teamId={workspace.team_id}
            workspaceId={workspaceId}
          />
        </div>

        {isAdmin && (
          <PendingInvitationsList
            invitations={invitations ?? []}
            workspaceId={workspaceId}
          />
        )}
      </section>
    </div>
  )
}
