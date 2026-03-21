import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { acceptInvitation } from "@/lib/actions/members"
import { Button } from "@/components/ui/button"

interface Props {
  params: Promise<{ token: string }>
}

export default async function InvitePage({ params }: Props) {
  const { token } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const signInUrl = `/sign-in?redirectTo=/invite/${token}`
    redirect(signInUrl)
  }

  const { data, error } = await acceptInvitation(token)

  if (data?.workspaceId) {
    redirect(`/w/${data.workspaceId}`)
  }

  return (
    <div className="p-6 h-full overflow-y-auto flex items-start justify-center pt-24">
      <div className="max-w-sm w-full space-y-4 text-center">
        <div className="space-y-2">
          <h1 className="text-xl font-semibold">
            {error ? "Invitation error" : "Processing invitation…"}
          </h1>
          {error && (
            <p className="text-sm text-muted-foreground">{error}</p>
          )}
        </div>
        <Button asChild variant="outline">
          <Link href="/">Go to Orbit</Link>
        </Button>
      </div>
    </div>
  )
}
