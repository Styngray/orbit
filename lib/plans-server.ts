import { createAdminClient } from "@/lib/supabase/admin"
import { PLAN_LIMITS, type Plan } from "@/lib/plans"

export async function getTeamPlan(teamId: string): Promise<Plan> {
  const admin = createAdminClient()
  const { data } = await admin
    .from("subscriptions")
    .select("plan, status")
    .eq("team_id", teamId)
    .in("status", ["active", "trialing"])
    .maybeSingle()
  return (data?.plan as Plan) ?? "free"
}

export async function checkBoardLimit(
  teamId: string,
): Promise<{ allowed: boolean; current: number; limit: number; plan: Plan }> {
  const admin = createAdminClient()
  const plan = await getTeamPlan(teamId)
  const limit = PLAN_LIMITS[plan].boards

  const { data: workspaces } = await admin
    .from("workspaces")
    .select("id")
    .eq("team_id", teamId)

  const workspaceIds = workspaces?.map((w) => w.id) ?? []

  const { count } = workspaceIds.length
    ? await admin
        .from("boards")
        .select("id", { count: "exact", head: true })
        .in("workspace_id", workspaceIds)
    : { count: 0 }

  const current = count ?? 0
  return { allowed: current < limit, current, limit, plan }
}

export async function checkMemberLimit(
  teamId: string
): Promise<{ allowed: boolean; current: number; limit: number; plan: Plan }> {
  const admin = createAdminClient()
  const plan = await getTeamPlan(teamId)
  const limit = PLAN_LIMITS[plan].members

  const { count } = await admin
    .from("team_members")
    .select("id", { count: "exact", head: true })
    .eq("team_id", teamId)

  const current = count ?? 0
  return { allowed: current < limit, current, limit, plan }
}
