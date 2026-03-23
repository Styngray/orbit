"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface BoardStatus {
  id: string
  board_id: string
  value: string
  label: string
  color: string
  sort_order: number
}

function slugify(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "") || "status"
}

export async function createBoardStatus(
  boardId: string,
  workspaceId: string,
  label: string,
  color: string
): Promise<{ data?: BoardStatus; error?: string }> {
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from("board_statuses")
    .select("sort_order, value")
    .eq("board_id", boardId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle()

  const sortOrder = existing ? existing.sort_order + 1 : 0

  let value = slugify(label)
  const { data: conflict } = await supabase
    .from("board_statuses")
    .select("value")
    .eq("board_id", boardId)
    .eq("value", value)
    .maybeSingle()

  if (conflict) {
    value = `${value}_${Date.now()}`
  }

  const { data, error } = await supabase
    .from("board_statuses")
    .insert({ board_id: boardId, value, label, color, sort_order: sortOrder })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath(`/w/${workspaceId}/b/${boardId}`)
  return { data: data as BoardStatus }
}

export async function updateBoardStatus(
  id: string,
  boardId: string,
  workspaceId: string,
  patch: { label?: string; color?: string }
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from("board_statuses")
    .update(patch)
    .eq("id", id)

  if (error) return { error: error.message }

  revalidatePath(`/w/${workspaceId}/b/${boardId}`)
  return {}
}

export async function deleteBoardStatus(
  id: string,
  boardId: string,
  workspaceId: string,
  moveTasksToValue: string
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { data: status } = await supabase
    .from("board_statuses")
    .select("value")
    .eq("id", id)
    .single()

  if (!status) return { error: "Status not found" }

  // Move tasks in this column to the target status
  const { error: moveError } = await supabase
    .from("tasks")
    .update({ status: moveTasksToValue })
    .eq("board_id", boardId)
    .eq("status", status.value)

  if (moveError) return { error: moveError.message }

  const { error } = await supabase.from("board_statuses").delete().eq("id", id)

  if (error) return { error: error.message }

  revalidatePath(`/w/${workspaceId}/b/${boardId}`)
  return {}
}
