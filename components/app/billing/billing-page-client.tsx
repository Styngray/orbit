"use client"

import { useState, useTransition } from "react"
import { Check, CreditCard, Zap, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlanBadge } from "@/components/app/plan-badge"
import { startCheckout, openBillingPortal } from "@/lib/actions/billing"
import type { Plan } from "@/lib/plans"

interface Props {
  teamId: string
  teamName: string
  plan: Plan
  planDisplay: { label: string; description: string }
  isAdmin: boolean
  subscription: {
    status: string
    currentPeriodEnd: string | null
    cancelAtPeriodEnd: boolean
  } | null
  usage: {
    boards: number
    boardLimit: number
    members: number
    memberLimit: number
  }
  prices: Record<string, { monthly: number; stripePriceId: string | undefined }>
}

function UsageMeter({ label, current, limit }: { label: string; current: number; limit: number }) {
  const isUnlimited = limit === Infinity || limit > 9999
  const pct = isUnlimited ? 0 : Math.min((current / limit) * 100, 100)
  const isNearLimit = pct >= 80
  const isAtLimit = pct >= 100

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={isAtLimit ? "text-destructive font-medium" : isNearLimit ? "text-amber-500 font-medium" : ""}>
          {isUnlimited ? `${current} / ∞` : `${current} / ${limit}`}
        </span>
      </div>
      {!isUnlimited && (
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              isAtLimit ? "bg-destructive" : isNearLimit ? "bg-amber-500" : "bg-[#0029bb]"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  )
}

const planFeatures: Record<Plan, string[]> = {
  free: ["1 project", "Solo use only", "Kanban boards", "Task management"],
  lite: ["10 projects", "Up to 3 team members", "Kanban boards", "Task management", "Member invites"],
  pro: ["Unlimited projects", "Unlimited members", "Kanban boards", "Task management", "AI features"],
}

const planIcons: Record<Plan, React.ReactNode> = {
  free: null,
  lite: <Zap className="size-4 text-blue-500" />,
  pro: <Crown className="size-4 text-[#0029bb]" />,
}

export function BillingPageClient({ teamId, teamName, plan, planDisplay, isAdmin, subscription, usage, prices }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [checkoutPending, startCheckoutTransition] = useTransition()
  const [portalPending, startPortalTransition] = useTransition()

  function handleUpgrade(targetPlan: "lite" | "pro") {
    setError(null)
    startCheckoutTransition(async () => {
      const result = await startCheckout(teamId, targetPlan)
      if (result?.error) setError(result.error)
    })
  }

  function handlePortal() {
    setError(null)
    startPortalTransition(async () => {
      const result = await openBillingPortal(teamId)
      if (result?.error) setError(result.error)
    })
  }

  const renewalDate = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric",
      })
    : null

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="max-w-2xl space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
          <p className="text-sm text-muted-foreground mt-1">{teamName}</p>
        </div>

        {/* Current plan */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {planIcons[plan]}
                <CardTitle className="text-base">Current plan</CardTitle>
              </div>
              <PlanBadge plan={plan} />
            </div>
            <CardDescription>{planDisplay.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <UsageMeter
                label="Projects"
                current={usage.boards}
                limit={usage.boardLimit}
              />
              <UsageMeter
                label="Team members"
                current={usage.members}
                limit={usage.memberLimit}
              />
            </div>

            {subscription && plan !== "free" && (
              <div className="pt-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {subscription.cancelAtPeriodEnd
                    ? `Cancels on ${renewalDate}`
                    : `Renews ${renewalDate}`}
                </span>
                <Badge variant={subscription.status === "active" ? "secondary" : "destructive"} className="capitalize">
                  {subscription.status}
                </Badge>
              </div>
            )}

            {isAdmin && plan !== "free" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePortal}
                disabled={portalPending}
                className="mt-2"
              >
                <CreditCard className="mr-2 size-4" />
                {portalPending ? "Loading…" : "Manage billing"}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Plan cards */}
        {plan !== "pro" && isAdmin && (
          <div>
            <h2 className="text-sm font-medium text-muted-foreground mb-3">Upgrade your plan</h2>
            <div className="grid grid-cols-2 gap-4">
              {(["lite", "pro"] as const).map((p) => {
                const isCurrent = plan === p
                const isDowngrade = false // plan is already narrowed to non-pro here
                const price = prices[p]

                return (
                  <Card key={p} className={isCurrent ? "border-[#0029bb] ring-1 ring-[#0029bb]" : ""}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm capitalize">{p}</CardTitle>
                        {isCurrent && <Badge variant="secondary">Current</Badge>}
                      </div>
                      <div className="text-2xl font-bold">
                        ${price.monthly}
                        <span className="text-sm font-normal text-muted-foreground">/mo</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <ul className="space-y-1.5">
                        {planFeatures[p].map((f) => (
                          <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Check className="size-3.5 text-green-500 shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      {!isCurrent && !isDowngrade && (
                        <Button
                          size="sm"
                          className="w-full bg-[#0029bb] hover:bg-[#0022a0] text-white"
                          onClick={() => handleUpgrade(p)}
                          disabled={checkoutPending}
                        >
                          {checkoutPending ? "Redirecting…" : `Upgrade to ${p}`}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {(plan as string) === "pro" && (
          <div className="rounded-lg border bg-[#e6ebff] dark:bg-[#000e52]/20 p-4 flex items-center gap-3">
            <Crown className="size-5 text-[#0029bb] shrink-0" />
            <div>
              <p className="text-sm font-medium">You&apos;re on the Pro plan</p>
              <p className="text-sm text-muted-foreground">You have access to all features including AI.</p>
            </div>
          </div>
        )}

        {!isAdmin && (
          <p className="text-sm text-muted-foreground">Only team owners and admins can manage billing.</p>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </div>
  )
}
