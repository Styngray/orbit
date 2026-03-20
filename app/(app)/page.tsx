import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function AppPage() {
  const supabase = await createClient()

  const { data: workspaces } = await supabase
    .from("workspaces")
    .select("id")
    .order("created_at")
    .limit(1)

  if (!workspaces || workspaces.length === 0) {
    redirect("/onboarding")
  }

  redirect(`/w/${workspaces[0].id}`)
}
