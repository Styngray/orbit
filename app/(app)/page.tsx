import { createClient } from "@/lib/supabase/server"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const name = user?.user_metadata?.full_name ?? user?.email?.split("@")[0]

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        Welcome back{name ? `, ${name}` : ""}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Your workspaces and boards will appear here. Set up your team to get
        started.
      </p>
    </div>
  )
}
