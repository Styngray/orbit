"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { TaskStatus, TaskPriority } from "@/lib/kanban-constants"

export interface Task {
  id: string
  board_id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  assignee_id: string | null
  sort_order: number
  created_at: string
}

export async function createTask(
  boardId: string,
  workspaceId: string,
  input: { title: string; status?: TaskStatus }
): Promise<{ data?: Task; error?: string }> {
  const supabase = await createClient()

  // Get max sort_order in the target column
  const { data: existing } = await supabase
    .from("tasks")
    .select("sort_order")
    .eq("board_id", boardId)
    .eq("status", input.status ?? "backlog")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle()

  const sortOrder = existing ? existing.sort_order + 1 : 0

  const { data: task, error } = await supabase
    .from("tasks")
    .insert({
      board_id: boardId,
      title: input.title,
      status: input.status ?? "backlog",
      sort_order: sortOrder,
    })
    .select("id, board_id, title, description, status, priority, assignee_id, sort_order, created_at")
    .single()

  if (error) return { error: error.message }

  revalidatePath(`/w/${workspaceId}/b/${boardId}`)
  return { data: task as Task }
}

export async function updateTask(
  id: string,
  workspaceId: string,
  patch: Partial<{
    title: string
    description: string | null
    status: TaskStatus
    priority: TaskPriority
    assignee_id: string | null
  }>
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase.from("tasks").update(patch).eq("id", id)

  if (error) return { error: error.message }

  revalidatePath(`/w/${workspaceId}`)
  return {}
}

export async function deleteTask(
  id: string,
  workspaceId: string
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase.from("tasks").delete().eq("id", id)

  if (error) return { error: error.message }

  revalidatePath(`/w/${workspaceId}`)
  return {}
}

export async function reorderTask(
  id: string,
  workspaceId: string,
  status: TaskStatus,
  sortOrder: number
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from("tasks")
    .update({ status, sort_order: sortOrder })
    .eq("id", id)

  if (error) return { error: error.message }

  // No revalidatePath — caller handles UI refresh
  return {}
}
