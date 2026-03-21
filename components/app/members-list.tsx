"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { removeMember, updateMemberRole } from "@/lib/actions/members"

interface Member {
  user_id: string
  role: string
  profiles: {
    display_name: string | null
    email: string | null
  } | null
}

interface MembersListProps {
  members: Member[]
  currentUserId: string
  currentUserRole: string
  teamId: string
  workspaceId: string
}

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
}

export function MembersList({
  members,
  currentUserId,
  currentUserRole,
  teamId,
  workspaceId,
}: MembersListProps) {
  const [confirmRemove, setConfirmRemove] = useState<Member | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const isAdmin = ["owner", "admin"].includes(currentUserRole)

  async function handleRoleChange(member: Member, role: "admin" | "member") {
    setLoadingId(member.user_id)
    const { error } = await updateMemberRole(teamId, workspaceId, member.user_id, role)
    setLoadingId(null)
    if (error) toast.error(error)
  }

  async function handleRemove(member: Member) {
    setLoadingId(member.user_id)
    const { error } = await removeMember(teamId, workspaceId, member.user_id)
    setLoadingId(null)
    setConfirmRemove(null)
    if (error) toast.error(error)
  }

  return (
    <>
      <ul className="divide-y rounded-md border">
        {members.map((member) => {
          const name = member.profiles?.display_name ?? member.user_id.slice(0, 8)
          const email = member.profiles?.email ?? ""
          const initials = name.slice(0, 2).toUpperCase()
          const isOwner = member.role === "owner"
          const isSelf = member.user_id === currentUserId
          const canEdit = isAdmin && !isOwner && !isSelf

          return (
            <li key={member.user_id} className="flex items-center gap-3 px-4 py-3">
              <Avatar className="size-8 shrink-0">
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{name}</p>
                {email && (
                  <p className="text-xs text-muted-foreground truncate">{email}</p>
                )}
              </div>

              {canEdit ? (
                <Select
                  value={member.role}
                  onValueChange={(v) => handleRoleChange(member, v as "admin" | "member")}
                  disabled={loadingId === member.user_id}
                >
                  <SelectTrigger className="h-7 w-24 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant="secondary" className="text-xs font-normal">
                  {ROLE_LABELS[member.role] ?? member.role}
                  {isSelf && " (You)"}
                </Badge>
              )}

              {canEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-destructive"
                  disabled={loadingId === member.user_id}
                  onClick={() => setConfirmRemove(member)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              )}
            </li>
          )
        })}
      </ul>

      <AlertDialog
        open={!!confirmRemove}
        onOpenChange={(open) => !open && setConfirmRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove member?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmRemove?.profiles?.display_name ?? "This member"} will lose
              access to this team and all its workspaces.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmRemove && handleRemove(confirmRemove)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
