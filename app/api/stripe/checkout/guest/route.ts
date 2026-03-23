import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { PLAN_PRICES } from "@/lib/plans"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
})

export async function GET(req: NextRequest) {
  const plan = req.nextUrl.searchParams.get("plan") as "lite" | "pro" | null

  if (plan !== "lite" && plan !== "pro") {
    return NextResponse.redirect(new URL("/#pricing", req.url))
  }

  const priceConfig = PLAN_PRICES[plan]
  if (!priceConfig?.stripePriceId) {
    return NextResponse.redirect(new URL("/#pricing", req.url))
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  // success_url threads plan + Stripe session ID through to onboarding
  const redirectTo = encodeURIComponent(`/onboarding?plan=${plan}&session_id={CHECKOUT_SESSION_ID}`)

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceConfig.stripePriceId, quantity: 1 }],
    success_url: `${appUrl}/sign-up?redirectTo=${redirectTo}`,
    cancel_url: `${appUrl}/#pricing`,
    metadata: { plan },
    subscription_data: { metadata: { plan } },
  })

  return NextResponse.redirect(session.url!)
}
