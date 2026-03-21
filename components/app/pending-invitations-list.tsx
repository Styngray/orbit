"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { revokeInvitation } from "@/lib/actions/members"

interface Invitation {
  id: string
  email: string
  role: string
  expires_at: string
}

interface PendingInvitationsListProps {
  invitations: Invitation[]
  workspaceId: string
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  member: "Member",
}

export function PendingInvitationsList({
  invitations,
  workspaceId,
}: PendingInvitationsListProps) {
  const [revokingId, setRevokingId] = useState<string | null>(null)

  async function handleRevoke(id: string) {
    setRevokingId(id)
    const { error } = await revokeInvitation(id, workspaceId)
    setRevokingId(null)
    if (error) toast.error(error)
    else toast.success("Invitation revoked")
  }

  if (invitations.length === 0) return null

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">
        Pending invitations ({invitations.length})
      </h3>
      <ul className="divide-y rounded-md border">
        {invitations.map((inv) => {
          const expires = new Date(inv.expires_at).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
          return (
            <li key={inv.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{inv.email}</p>
                <p className="text-xs text-muted-foreground">
                  Invited as {ROLE_LABELS[inv.role] ?? inv.role} · Expires {expires}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive shrink-0"
                disabled={revokingId === inv.id}
                onClick={() => handleRevoke(inv.id)}
              >
                {revokingId === inv.id ? "Revoking…" : "Revoke"}
              </Button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
