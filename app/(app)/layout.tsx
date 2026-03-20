import { Sidebar } from "@/components/app/sidebar"
import { Header } from "@/components/app/header"
import { Toaster } from "@/components/ui/sonner"
import { createClient } from "@/lib/supabase/server"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: workspaces } = await supabase
    .from("workspaces")
    .select("id, name, slug, team_id")
    .order("created_at")

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar workspaces={workspaces ?? []} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
      <Toaster />
    </div>
  )
}
