import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Plan } from "@/lib/plans"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
})

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const admin = createAdminClient()

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode !== "subscription") break

      const teamId = session.metadata?.teamId
      const plan = session.metadata?.plan as Plan | undefined
      if (!teamId || !plan) break

      const sub = await stripe.subscriptions.retrieve(session.subscription as string)
      await upsertSubscription(admin, teamId, sub, plan)
      break
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription
      const teamId = sub.metadata?.teamId
      const plan = sub.metadata?.plan as Plan | undefined
      if (!teamId) break
      await upsertSubscription(admin, teamId, sub, plan)
      break
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription
      const teamId = sub.metadata?.teamId
      if (!teamId) break

      await admin
        .from("subscriptions")
        .upsert({
          team_id: teamId,
          stripe_subscription_id: sub.id,
          plan: "free",
          status: "canceled",
          current_period_end: null,
          cancel_at_period_end: false,
        }, { onConflict: "team_id" })
      break
    }
  }

  return NextResponse.json({ received: true })
}

async function upsertSubscription(
  admin: ReturnType<typeof createAdminClient>,
  teamId: string,
  sub: Stripe.Subscription,
  plan?: Plan
) {
  const resolvedPlan: Plan = plan ?? (sub.metadata?.plan as Plan) ?? "free"

  // current_period_end moved to subscription items in newer Stripe API versions
  const subAny = sub as unknown as Record<string, unknown>
  const itemPeriodEnd = (sub.items?.data?.[0] as unknown as Record<string, unknown>)?.current_period_end
  const periodEndRaw = (subAny.current_period_end ?? itemPeriodEnd) as number | null
  const periodEnd = periodEndRaw ? new Date(periodEndRaw * 1000).toISOString() : null

  const cancelAtPeriodEnd = (subAny.cancel_at_period_end ?? false) as boolean

  await admin.from("subscriptions").upsert({
    team_id: teamId,
    stripe_subscription_id: sub.id,
    plan: resolvedPlan,
    status: sub.status as "active" | "trialing" | "past_due" | "canceled" | "incomplete",
    current_period_end: periodEnd,
    cancel_at_period_end: cancelAtPeriodEnd,
  }, { onConflict: "team_id" })
}
