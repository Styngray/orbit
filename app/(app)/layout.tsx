import { Sidebar } from "@/components/app/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { createClient } from "@/lib/supabase/server"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [{ data: workspacesRaw }, { data: boards }, { data: profile }] =
    await Promise.all([
      supabase
        .from("workspaces")
        .select("id, name, slug, team_id, teams(id, name)")
        .order("created_at"),
      supabase
        .from("boards")
        .select("id, name, workspace_id")
        .order("created_at"),
      user
        ? supabase
            .from("profiles")
            .select("display_name, avatar_url")
            .eq("id", user.id)
            .single()
        : Promise.resolve({ data: null }),
    ])

  // Normalize teams join (may come as array or object)
  const workspaces = (workspacesRaw ?? []).map((w) => ({
    ...w,
    teams: Array.isArray(w.teams) ? (w.teams[0] ?? null) : w.teams,
  }))

  const displayName =
    profile?.display_name ??
    user?.user_metadata?.full_name ??
    user?.email?.split("@")[0] ??
    "?"
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        workspaces={workspaces as Parameters<typeof Sidebar>[0]["workspaces"]}
        boards={boards ?? []}
        userDisplayName={displayName}
        userInitials={initials}
        userEmail={user?.email ?? ""}
      />
      <main className="flex-1 overflow-hidden min-w-0">{children}</main>
      <Toaster />
    </div>
  )
}
