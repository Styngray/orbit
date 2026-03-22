import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { PLAN_PRICES } from "@/lib/plans"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
})

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { teamId, plan } = await req.json() as { teamId: string; plan: "lite" | "pro" }

  const priceConfig = PLAN_PRICES[plan]
  if (!priceConfig?.stripePriceId) {
    return NextResponse.json({ error: "Invalid plan or price not configured" }, { status: 400 })
  }

  const admin = createAdminClient()

  // Ensure team membership
  const { data: membership } = await admin
    .from("team_members")
    .select("role")
    .eq("team_id", teamId)
    .eq("user_id", user.id)
    .single()

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return NextResponse.json({ error: "Only owners and admins can manage billing" }, { status: 403 })
  }

  // Get or create Stripe customer
  const { data: team } = await admin.from("teams").select("name, stripe_customer_id").eq("id", teamId).single()
  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 })

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
    cancel_url: `${appUrl}/settings/billing?canceled=1`,
    metadata: { teamId, plan },
    subscription_data: { metadata: { teamId, plan } },
  })

  return NextResponse.json({ url: session.url })
}
