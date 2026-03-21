"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateProfile(
  displayName: string
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const trimmed = displayName.trim()
  if (!trimmed) return { error: "Name cannot be empty" }

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: trimmed })
    .eq("id", user.id)

  if (error) return { error: error.message }

  revalidatePath("/", "layout")
  return {}
}

export async function updateAvatar(
  avatarUrl: string
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", user.id)

  if (error) return { error: error.message }

  revalidatePath("/", "layout")
  return {}
}

export async function updateNotificationPrefs(
  notifyMentions: boolean,
  notifyAssignments: boolean
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase
    .from("profiles")
    .update({
      notify_mentions: notifyMentions,
      notify_assignments: notifyAssignments,
    })
    .eq("id", user.id)

  if (error) return { error: error.message }

  return {}
}
