"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { LabelColor } from "@/lib/label-constants"

export async function createLabel(
  workspaceId: string,
  name: string,
  color: LabelColor
): Promise<{ data?: { id: string; name: string; color: LabelColor }; error?: string }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("labels")
    .insert({ workspace_id: workspaceId, name: name.trim(), color })
    .select("id, name, color")
    .single()

  if (error) return { error: error.message }

  revalidatePath(`/w/${workspaceId}`, "layout")
  return { data: data as { id: string; name: string; color: LabelColor } }
}

export async function updateLabel(
  id: string,
  name: string,
  color: LabelColor,
  workspaceId: string
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("labels")
    .update({ name: name.trim(), color })
    .eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(`/w/${workspaceId}`, "layout")
  return {}
}

export async function deleteLabel(
  id: string,
  workspaceId: string
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.from("labels").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(`/w/${workspaceId}`, "layout")
  return {}
}
