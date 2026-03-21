"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { slugify } from "@/lib/slugify"
import { revalidatePath } from "next/cache"

export async function createTeam(
  name: string
): Promise<{ data?: { teamId: string }; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const admin = createAdminClient()
  const base = slugify(name) || "team"
  const slug = `${base}-${Math.random().toString(36).slice(2, 6)}`

  const { data: team, error: teamError } = await admin
    .from("teams")
    .insert({ name, slug })
    .select("id")
    .single()

  if (teamError) return { error: teamError.message }

  const { error: memberError } = await admin
    .from("team_members")
    .insert({ team_id: team.id, user_id: user.id, role: "owner" })

  if (memberError) return { error: memberError.message }

  return { data: { teamId: team.id } }
}

export async function createWorkspace(
  teamId: string,
  name: string
): Promise<{ data?: { workspaceId: string }; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const admin = createAdminClient()
  const base = slugify(name) || "workspace"
  const slug = `${base}-${Math.random().toString(36).slice(2, 6)}`

  const { data: workspace, error } = await admin
    .from("workspaces")
    .insert({ team_id: teamId, name, slug })
    .select("id")
    .single()

  if (error) return { error: error.message }

  revalidatePath("/", "layout")
  return { data: { workspaceId: workspace.id } }
}

export async function createTeamAndWorkspace(
  teamName: string,
  workspaceName: string
): Promise<{ data?: { workspaceId: string }; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const admin = createAdminClient()

  const teamSlug = `${slugify(teamName) || "team"}-${Math.random().toString(36).slice(2, 6)}`
  const { data: team, error: teamError } = await admin
    .from("teams")
    .insert({ name: teamName, slug: teamSlug })
    .select("id")
    .single()
  if (teamError) return { error: teamError.message }

  const { error: memberError } = await admin
    .from("team_members")
    .insert({ team_id: team.id, user_id: user.id, role: "owner" })
  if (memberError) return { error: memberError.message }

  const workspaceSlug = `${slugify(workspaceName) || "workspace"}-${Math.random().toString(36).slice(2, 6)}`
  const { data: workspace, error: workspaceError } = await admin
    .from("workspaces")
    .insert({ team_id: team.id, name: workspaceName, slug: workspaceSlug })
    .select("id")
    .single()
  if (workspaceError) return { error: workspaceError.message }

  return { data: { workspaceId: workspace.id } }
}

export async function updateTeam(
  id: string,
  name: string
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from("teams")
    .update({ name })
    .eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/", "layout")
  return {}
}

export async function updateWorkspace(
  id: string,
  name: string
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from("workspaces")
    .update({ name })
    .eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/", "layout")
  return {}
}

export async function deleteWorkspace(
  id: string
): Promise<{ data?: { nextWorkspaceId?: string }; error?: string }> {
  const supabase = await createClient()

  // Find another workspace before deleting
  const { data: others } = await supabase
    .from("workspaces")
    .select("id")
    .neq("id", id)
    .order("created_at")
    .limit(1)

  const { error } = await supabase.from("workspaces").delete().eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/", "layout")
  return { data: { nextWorkspaceId: others?.[0]?.id } }
}
