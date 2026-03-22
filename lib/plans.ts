export type Plan = "free" | "lite" | "pro"

export interface PlanLimits {
  boards: number        // max boards per workspace (Infinity = unlimited)
  members: number       // max total team members (including owner)
  ai: boolean
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: { boards: 1, members: 1, ai: false },
  lite: { boards: 10, members: 3, ai: false },
  pro:  { boards: Infinity, members: Infinity, ai: true },
}

export const PLAN_PRICES: Record<Exclude<Plan, "free">, { monthly: number; stripePriceId: string | undefined }> = {
  lite: {
    monthly: 9,
    stripePriceId: process.env.STRIPE_PRICE_LITE,
  },
  pro: {
    monthly: 19,
    stripePriceId: process.env.STRIPE_PRICE_PRO,
  },
}

export const PLAN_DISPLAY: Record<Plan, { label: string; description: string }> = {
  free: { label: "Free", description: "Solo use, 1 project" },
  lite: { label: "Lite", description: "Small teams, 10 projects" },
  pro:  { label: "Pro", description: "Unlimited everything + AI" },
}
