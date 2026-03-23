"use server"

import Stripe from "stripe"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { PLAN_PRICES } from "@/lib/plans"
import { redirect } from "next/navigation"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
})

export async function startCheckout(
  teamId: string,
  plan: "lite" | "pro"
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/sign-in")

  const priceConfig = PLAN_PRICES[plan]
  if (!priceConfig?.stripePriceId) {
    return { error: "Plan not configured. Please add STRIPE_PRICE_LITE / STRIPE_PRICE_PRO to your env." }
  }

  const admin = createAdminClient()

  const { data: membership } = await admin
    .from("team_members")
    .select("role")
    .eq("team_id", teamId)
    .eq("user_id", user.id)
    .single()

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return { error: "Only owners and admins can manage billing" }
  }

  const { data: team } = await admin.from("teams").select("name, stripe_customer_id").eq("id", teamId).single()
  if (!team) return { error: "Team not found" }

  let customerId = team.stripe_customer_id
  if (!customerId) {
    const { data: profile } = await admin.from("profiles").select("display_name").eq("id", user.id).single()
    const customer = await stripe.customers.create({
      email: user.email,
      name: profile?.display_name ?? undefined,
      metadata: { teamId, userId: user.id },
    })
    customerId = customer.id
    await admin.from("teams").update({ stripe_customer_id: customerId }).eq("id", teamId)
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceConfig.stripePriceId, quantity: 1 }],
    success_url: `${appUrl}/settings/billing?success=1`,
    cancel_url: `${appUrl}/settings/billing`,
    metadata: { teamId, plan },
    subscription_data: { metadata: { teamId, plan } },
  })

  redirect(session.url!)
}

export async function claimGuestCheckout(
  teamId: string,
  sessionId: string,
  plan: "lite" | "pro"
): Promise<{ error?: string }> {
  const admin = createAdminClient()

  let session: Stripe.Checkout.Session
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId)
  } catch {
    return { error: "Invalid checkout session." }
  }

  if (session.payment_status !== "paid") {
    return { error: "Payment not completed." }
  }

  const subscriptionId = session.subscription as string
  const customerId = session.customer as string

  // Tag the subscription with the teamId so future webhooks work
  await stripe.subscriptions.update(subscriptionId, {
    metadata: { teamId, plan },
  })

  // Store the customer on the team
  await admin.from("teams").update({ stripe_customer_id: customerId }).eq("id", teamId)

  const sub = await stripe.subscriptions.retrieve(subscriptionId)

  const subAny = sub as unknown as Record<string, unknown>
  const itemPeriodEnd = (sub.items?.data?.[0] as unknown as Record<string, unknown>)?.current_period_end
  const periodEndRaw = (subAny.current_period_end ?? itemPeriodEnd) as number | null
  const periodEnd = periodEndRaw ? new Date(periodEndRaw * 1000).toISOString() : null

  await admin.from("subscriptions").upsert({
    team_id: teamId,
    stripe_subscription_id: subscriptionId,
    plan,
    status: sub.status as "active" | "trialing" | "past_due" | "canceled" | "incomplete",
    current_period_end: periodEnd,
    cancel_at_period_end: (subAny.cancel_at_period_end ?? false) as boolean,
  }, { onConflict: "team_id" })

  return {}
}

export async function openBillingPortal(teamId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/sign-in")

  const admin = createAdminClient()

  const { data: membership } = await admin
    .from("team_members")
    .select("role")
    .eq("team_id", teamId)
    .eq("user_id", user.id)
    .single()

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return { error: "Only owners and admins can manage billing" }
  }

  const { data: team } = await admin.from("teams").select("stripe_customer_id").eq("id", teamId).single()
  if (!team?.stripe_customer_id) {
    return { error: "No billing account found. Please upgrade first." }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  const session = await stripe.billingPortal.sessions.create({
    customer: team.stripe_customer_id,
    return_url: `${appUrl}/settings/billing`,
  })

  redirect(session.url!)
}
