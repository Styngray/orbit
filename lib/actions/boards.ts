"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createBoard(
  workspaceId: string,
  name: string
): Promise<{ data?: { boardId: string }; error?: string }> {
  const supabase = await createClient()

  const { data: board, error } = await supabase
    .from("boards")
    .insert({ workspace_id: workspaceId, name })
    .select("id")
    .single()

  if (error) return { error: error.message }

  revalidatePath(`/w/${workspaceId}`)
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
