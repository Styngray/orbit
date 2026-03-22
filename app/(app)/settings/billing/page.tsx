import { createClient } from "@/lib/supabase/server"
import { getTeamPlan } from "@/lib/plans-server"
import { PLAN_LIMITS, PLAN_DISPLAY, PLAN_PRICES } from "@/lib/plans"
import { BillingPageClient } from "@/components/app/billing/billing-page-client"

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get primary team (first team the user is a member of)
  const { data: memberships } = await supabase
    .from("team_members")
    .select("team_id, role, teams(id, name)")
    .eq("user_id", user!.id)
    .order("created_at")
    .limit(1)

  const membership = memberships?.[0]
  const teamRaw = membership ? (Array.isArray(membership.teams) ? membership.teams[0] : membership.teams) : null
  const team = teamRaw as { id: string; name: string } | null
  const teamId = team?.id ?? ""
  const userRole = membership?.role ?? "member"

  if (!teamId) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">No team found.</p>
      </div>
    )
  }

  const [plan, { data: subscription }, { count: boardCount }, { count: memberCount }] = await Promise.all([
    getTeamPlan(teamId),
    supabase.from("subscriptions").select("*").eq("team_id", teamId).maybeSingle(),
    supabase
      .from("boards")
      .select("id", { count: "exact", head: true })
      .in("workspace_id",
        (await supabase.from("workspaces").select("id").eq("team_id", teamId)).data?.map(w => w.id) ?? []
      ),
    supabase.from("team_members").select("id", { count: "exact", head: true }).eq("team_id", teamId),
  ])

  const limits = PLAN_LIMITS[plan]
  const isAdmin = ["owner", "admin"].includes(userRole)

  return (
    <BillingPageClient
      teamId={teamId}
      teamName={team?.name ?? ""}
      plan={plan}
      planDisplay={PLAN_DISPLAY[plan]}
      isAdmin={isAdmin}
      subscription={subscription ? {
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      } : null}
      usage={{
        boards: boardCount ?? 0,
        boardLimit: limits.boards,
        members: memberCount ?? 0,
        memberLimit: limits.members,
      }}
      prices={PLAN_PRICES}
    />
  )
}
