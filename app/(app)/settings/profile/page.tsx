import { createClient } from "@/lib/supabase/server"
import { ProfileForm } from "@/components/app/profile-form"

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_url, notify_mentions, notify_assignments")
    .eq("id", user!.id)
    .single()

  return (
    <div className="p-6 h-full overflow-y-auto">
      <ProfileForm
        userId={user!.id}
        displayName={profile?.display_name ?? ""}
        email={user?.email ?? ""}
        avatarUrl={profile?.avatar_url ?? null}
        notifyMentions={profile?.notify_mentions ?? true}
        notifyAssignments={profile?.notify_assignments ?? true}
      />
    </div>
  )
}
