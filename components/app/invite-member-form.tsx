"use client"

import { useState } from "react"
import { Zap } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { inviteMember } from "@/lib/actions/members"
import { UpgradeModal } from "./upgrade-modal"
import type { Plan } from "@/lib/plans"

interface InviteMemberFormProps {
  teamId: string
  workspaceId: string
  currentPlan?: Plan
}

export function InviteMemberForm({ teamId, workspaceId, currentPlan = "free" }: InviteMemberFormProps) {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"member" | "admin">("member")
  const [loading, setLoading] = useState(false)
  const [upgradeOpen, setUpgradeOpen] = useState(false)

  // Free plan users cannot invite anyone
  if (currentPlan === "free") {
    return (
      <>
        <div className="rounded-lg border border-dashed p-4 flex items-start gap-3">
          <Zap className="size-4 text-violet-500 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Team collaboration requires a paid plan</p>
            <p className="text-sm text-muted-foreground">
              Upgrade to Lite to invite up to 2 teammates, or Pro for unlimited members.
            </p>
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={() => setUpgradeOpen(true)}
            >
              Upgrade plan
            </Button>
          </div>
        </div>
        <UpgradeModal
          open={upgradeOpen}
          onOpenChange={setUpgradeOpen}
          teamId={teamId}
          reason="member_limit"
          currentPlan="free"
        />
      </>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) return

    setLoading(true)
    const result = await inviteMember(teamId, workspaceId, trimmed, role)
    setLoading(false)

    if (result.limitReached) {
      setUpgradeOpen(true)
    } else if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`Invitation sent to ${trimmed}`)
      setEmail("")
      setRole("member")
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="invite-email">Email address</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="teammate@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="invite-role">Role</Label>
            <Select
              value={role}
              onValueChange={(v) => setRole(v as "member" | "admin")}
              disabled={loading}
            >
              <SelectTrigger id="invite-role" className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button type="submit" disabled={loading || !email.trim()}>
          {loading ? "Sending…" : "Send invite"}
        </Button>
      </form>

      {currentPlan !== "pro" && (
        <UpgradeModal
          open={upgradeOpen}
          onOpenChange={setUpgradeOpen}
          teamId={teamId}
          reason="member_limit"
          currentPlan={currentPlan as "free" | "lite"}
        />
      )}
    </>
  )
}
