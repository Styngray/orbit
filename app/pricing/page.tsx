import Link from "next/link"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const plans = [
  {
    name: "Free",
    price: 0,
    description: "For solo users getting started",
    badge: null,
    features: [
      "1 project",
      "Solo use",
      "Kanban board",
      "Task management",
      "Unlimited tasks",
    ],
    cta: "Get started free",
    ctaHref: "/sign-up",
    variant: "outline" as const,
  },
  {
    name: "Lite",
    price: 9,
    description: "For small teams moving fast",
    badge: "Most popular",
    features: [
      "10 projects",
      "Up to 3 team members",
      "Kanban board",
      "Task management",
      "Member invites",
      "Email notifications",
    ],
    cta: "Start with Lite",
    ctaHref: "/sign-up?plan=lite",
    variant: "default" as const,
  },
  {
    name: "Pro",
    price: 19,
    description: "For growing teams that need more",
    badge: null,
    features: [
      "Unlimited projects",
      "Unlimited team members",
      "Kanban board",
      "Task management",
      "Member invites",
      "Email notifications",
      "AI task generation",
      "AI board summaries",
      "Priority support",
    ],
    cta: "Start with Pro",
    ctaHref: "/sign-up?plan=pro",
    variant: "outline" as const,
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg tracking-tight">
            Orbit
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/sign-up">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-4xl font-bold tracking-tight">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Start free, upgrade when you need to collaborate or unlock more projects.
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl border p-6 flex flex-col gap-6 ${
                plan.badge
                  ? "border-violet-500 ring-1 ring-violet-500 bg-violet-50/30 dark:bg-violet-950/10"
                  : "bg-card"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-violet-600 text-white px-3 py-0.5">{plan.badge}</Badge>
                </div>
              )}

              <div>
                <h2 className="text-lg font-semibold">{plan.name}</h2>
                <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                <div className="mt-4">
                  {plan.price === 0 ? (
                    <span className="text-3xl font-bold">Free</span>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground text-sm">/month</span>
                    </div>
                  )}
                </div>
              </div>

              <ul className="space-y-2.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="size-4 text-green-500 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                variant={plan.badge ? "default" : plan.variant}
                className={plan.badge ? "bg-violet-600 hover:bg-violet-700 text-white" : ""}
              >
                <Link href={plan.ctaHref}>{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>

        {/* FAQ strip */}
        <div className="mt-20 border-t pt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              q: "Can I change plans later?",
              a: "Yes. Upgrade or downgrade at any time from your billing settings.",
            },
            {
              q: "What happens if I hit a limit?",
              a: "You'll be prompted to upgrade. Existing work is never deleted.",
            },
            {
              q: "Is there a free trial?",
              a: "The Free plan is free forever. Paid plans can be cancelled any time.",
            },
          ].map(({ q, a }) => (
            <div key={q} className="space-y-2">
              <h3 className="font-medium text-sm">{q}</h3>
              <p className="text-sm text-muted-foreground">{a}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
