"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { checkBoardLimit } from "@/lib/plans-server"

export async function createBoard(
  workspaceId: string,
  name: string
): Promise<{ data?: { boardId: string }; error?: string; limitReached?: true; plan?: string }> {
  const supabase = await createClient()
  const admin = createAdminClient()

  // Resolve team_id for this workspace
  const { data: workspace } = await admin
    .from("workspaces")
    .select("team_id")
    .eq("id", workspaceId)
    .single()

  if (!workspace) return { error: "Workspace not found" }

  const check = await checkBoardLimit(workspace.team_id)
  if (!check.allowed) {
    return {
      error: `You've reached the ${check.limit}-project limit on the ${check.plan} plan. Upgrade to add more.`,
      limitReached: true,
      plan: check.plan,
    }
  }

  const { data: board, error } = await supabase
    .from("boards")
    .insert({ workspace_id: workspaceId, name })
    .select("id")
    .single()

  if (error) return { error: error.message }

  revalidatePath(`/w/${workspaceId}`, "layout")
  return { data: { boardId: board.id } }
}

export async function updateBoard(
  id: string,
  workspaceId: string,
  name: string
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from("boards")
    .update({ name })
    .eq("id", id)

  if (error) return { error: error.message }

  revalidatePath(`/w/${workspaceId}`)
  return {}
}

export async function deleteBoard(
  id: string,
  workspaceId: string
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase.from("boards").delete().eq("id", id)

  if (error) return { error: error.message }

  revalidatePath(`/w/${workspaceId}`)
  return {}
}
