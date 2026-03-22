"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { sendInviteEmail } from "@/lib/email"
import { checkMemberLimit } from "@/lib/plans-server"

export async function inviteMember(
  teamId: string,
  workspaceId: string,
  email: string,
  role: "admin" | "member"
): Promise<{ error?: string; limitReached?: true; plan?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const admin = createAdminClient()

  // Verify inviter is admin/owner
  const { data: membership } = await admin
    .from("team_members")
    .select("role")
    .eq("team_id", teamId)
    .eq("user_id", user.id)
    .single()

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return { error: "Not authorized" }
  }

  // Check member limit for this plan
  const check = await checkMemberLimit(teamId)
  if (!check.allowed) {
    return {
      error:
        check.plan === "free"
          ? "Team collaboration requires a Lite or Pro plan. Upgrade to invite members."
          : `You've reached the ${check.limit}-member limit on the ${check.plan} plan. Upgrade to add more.`,
      limitReached: true,
      plan: check.plan,
    }
  }

  // Check for existing pending invitation
  const { data: existing } = await admin
    .from("invitations")
    .select("id, accepted_at, expires_at")
    .eq("team_id", teamId)
    .eq("email", email.toLowerCase())
    .maybeSingle()

  if (
    existing &&
    !existing.accepted_at &&
    new Date(existing.expires_at) > new Date()
  ) {
    return { error: "An invitation has already been sent to this email" }
  }

  // Fetch inviter name and team name for the email
  const [{ data: inviterProfile }, { data: team }] = await Promise.all([
    admin.from("profiles").select("display_name").eq("id", user.id).single(),
    admin.from("teams").select("name").eq("id", teamId).single(),
  ])

  // Upsert invitation (refreshes expired/accepted ones)
  const { data: invite, error } = await admin
    .from("invitations")
    .upsert(
      {
        team_id: teamId,
        email: email.toLowerCase(),
        role,
        invited_by: user.id,
        accepted_at: null,
        expires_at: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      { onConflict: "email,team_id" }
    )
    .select("token")
    .single()

  if (error) return { error: error.message }

  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${invite.token}`

  sendInviteEmail(
    email,
    inviterProfile?.display_name ?? "A team member",
    team?.name ?? "your team",
    inviteUrl
  ).catch(console.error)

  revalidatePath(`/w/${workspaceId}/settings/members`)
  return {}
}

export async function removeMember(
  teamId: string,
  workspaceId: string,
  userId: string
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  // Prevent removing the owner
  const admin = createAdminClient()
  const { data: target } = await admin
    .from("team_members")
    .select("role")
    .eq("team_id", teamId)
    .eq("user_id", userId)
    .single()

  if (target?.role === "owner") {
    return { error: "Cannot remove the team owner" }
  }

  // RLS enforces that only admins/owners can delete
  const { error } = await supabase
    .from("team_members")
    .delete()
    .eq("team_id", teamId)
    .eq("user_id", userId)

  if (error) return { error: error.message }

  revalidatePath(`/w/${workspaceId}/settings/members`)
  return {}
}

export async function updateMemberRole(
  teamId: string,
  workspaceId: string,
  userId: string,
  role: "admin" | "member"
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  // Prevent changing owner's role
  const admin = createAdminClient()
  const { data: target } = await admin
    .from("team_members")
    .select("role")
    .eq("team_id", teamId)
    .eq("user_id", userId)
    .single()

  if (target?.role === "owner") {
    return { error: "Cannot change the owner's role" }
  }

  // RLS enforces only admins/owners can update
  const { error } = await supabase
    .from("team_members")
    .update({ role })
    .eq("team_id", teamId)
    .eq("user_id", userId)

  if (error) return { error: error.message }

  revalidatePath(`/w/${workspaceId}/settings/members`)
  return {}
}

export async function revokeInvitation(
  invitationId: string,
  workspaceId: string
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase
    .from("invitations")
    .delete()
    .eq("id", invitationId)

  if (error) return { error: error.message }

  revalidatePath(`/w/${workspaceId}/settings/members`)
  return {}
}

export async function acceptInvitation(
  token: string
): Promise<{ data?: { workspaceId: string }; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const admin = createAdminClient()

  // Look up invitation
  const { data: invite } = await admin
    .from("invitations")
    .select("id, team_id, email, role, expires_at, accepted_at")
    .eq("token", token)
    .maybeSingle()

  if (!invite) return { error: "Invalid invitation link" }
  if (invite.accepted_at) return { error: "This invitation has already been used" }
  if (new Date(invite.expires_at) < new Date()) return { error: "This invitation has expired" }

  // Verify email matches signed-in user
  const { data: authData } = await admin.auth.admin.getUserById(user.id)
  const userEmail = authData.user?.email?.toLowerCase()
  if (userEmail !== invite.email.toLowerCase()) {
    return {
      error: `This invitation was sent to ${invite.email}. Please sign in with that account.`,
    }
  }

  // Check if already a member
  const { data: existingMember } = await admin
    .from("team_members")
    .select("id")
    .eq("team_id", invite.team_id)
    .eq("user_id", user.id)
    .maybeSingle()

  if (!existingMember) {
    const limitCheck = await checkMemberLimit(invite.team_id)
    if (!limitCheck.allowed) {
      return { error: "This team has reached its member limit. Ask the team owner to upgrade their plan." }
    }

    const { error } = await admin.from("team_members").insert({
      team_id: invite.team_id,
      user_id: user.id,
      role: invite.role,
    })
    if (error) return { error: error.message }
  }

  // Mark as accepted
  await admin
    .from("invitations")
    .update({ accepted_at: new Date().toISOString() })
    .eq("id", invite.id)

  // Find a workspace to redirect to
  const { data: workspace } = await admin
    .from("workspaces")
    .select("id")
    .eq("team_id", invite.team_id)
    .limit(1)
    .maybeSingle()

  revalidatePath("/", "layout")
  return { data: { workspaceId: workspace?.id ?? "" } }
}
