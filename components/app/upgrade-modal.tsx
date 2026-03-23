"use client"

import { useState, useTransition } from "react"
import { Zap } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { startCheckout } from "@/lib/actions/billing"
import { PLAN_DISPLAY, PLAN_LIMITS } from "@/lib/plans"

interface UpgradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  teamId: string
  reason: "board_limit" | "member_limit"
  currentPlan: "free" | "lite"
}

export function UpgradeModal({ open, onOpenChange, teamId, reason, currentPlan }: UpgradeModalProps) {
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const targetPlan = currentPlan === "free" ? "lite" : "pro"

  const title =
    reason === "board_limit"
      ? `Project limit reached`
      : `Member limit reached`

  const description =
    reason === "board_limit"
      ? currentPlan === "free"
        ? `Free plan is limited to ${PLAN_LIMITS.free.boards} project. Upgrade to Lite for up to ${PLAN_LIMITS.lite.boards} projects.`
        : `Lite plan is limited to ${PLAN_LIMITS.lite.boards} projects. Upgrade to Pro for unlimited projects.`
      : currentPlan === "free"
        ? `Free plan is for solo use only. Upgrade to Lite to add up to 2 teammates.`
        : `Lite plan supports up to ${PLAN_LIMITS.lite.members} members. Upgrade to Pro for unlimited members.`

  function handleUpgrade() {
    setError(null)
    startTransition(async () => {
      const result = await startCheckout(teamId, targetPlan)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-[#ccd6ff] dark:bg-[#000e52]">
              <Zap className="size-4 text-[#0029bb]" />
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription className="pt-1">{description}</DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
          <p className="text-sm font-medium capitalize">{PLAN_DISPLAY[targetPlan].label} plan — ${targetPlan === "lite" ? 9 : 19}/mo</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            {targetPlan === "lite" && (
              <>
                <li>• Up to {PLAN_LIMITS.lite.boards} projects</li>
                <li>• Up to {PLAN_LIMITS.lite.members} team members</li>
              </>
            )}
            {targetPlan === "pro" && (
              <>
                <li>• Unlimited projects</li>
                <li>• Unlimited team members</li>
                <li>• AI-powered features</li>
              </>
            )}
          </ul>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={handleUpgrade} disabled={pending} className="bg-[#0029bb] hover:bg-[#0022a0] text-white">
            {pending ? "Redirecting…" : `Upgrade to ${PLAN_DISPLAY[targetPlan].label}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
