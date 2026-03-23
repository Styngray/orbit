import type { Metadata } from "next"
import Link from "next/link"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/landing/navbar"
import Footer from "@/components/landing/footer"

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing. Start free forever, upgrade to Lite ($9/mo) for small teams, or Pro ($19/mo) for unlimited projects, members, and AI features.",
  openGraph: {
    title: "Pricing — Orbit",
    description:
      "Start free forever. Lite plan from $9/mo for teams. Pro plan at $19/mo with AI task generation, unlimited projects, and priority support.",
    url: "/pricing",
  },
}

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
    highlighted: false,
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
    ctaHref: "/api/stripe/checkout/guest?plan=lite",
    highlighted: true,
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
    ctaHref: "/api/stripe/checkout/guest?plan=pro",
    highlighted: false,
  },
]

export default function PricingPage() {
  return (
    <div className="dark min-h-screen flex flex-col" style={{ backgroundColor: "#0a0a0b", color: "#fafafa" }}>
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-20">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#4d79ff]">
            Pricing
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-neutral-400 max-w-xl mx-auto">
            Start free, upgrade when you need to collaborate or unlock more projects.
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl p-6 flex flex-col gap-6 ${
                plan.highlighted
                  ? "bg-[#000e52]/40 border border-[#0029bb]/50 ring-1 ring-[#0029bb]/30 shadow-xl shadow-[#001266]/20"
                  : "bg-white/3 border border-white/8"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-[#0029bb] text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div>
                <h2 className="text-lg font-semibold text-white">{plan.name}</h2>
                <p className="text-sm text-neutral-400 mt-1">{plan.description}</p>
                <div className="mt-4">
                  {plan.price === 0 ? (
                    <span className="text-3xl font-bold text-white">Free</span>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-white">${plan.price}</span>
                      <span className="text-neutral-400 text-sm">/month</span>
                    </div>
                  )}
                </div>
              </div>

              <ul className="space-y-2.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-neutral-300">
                    <Check className="size-4 text-emerald-400 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className={
                  plan.highlighted
                    ? "bg-[#0029bb] hover:bg-[#0033dd] text-white shadow-lg shadow-[#001266]/40"
                    : "bg-white/8 hover:bg-white/12 text-white border border-white/10"
                }
                variant={plan.highlighted ? "default" : "ghost"}
              >
                <Link href={plan.ctaHref}>{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>

        {/* FAQ strip */}
        <div className="mt-20 border-t border-white/5 pt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
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
              <h3 className="font-medium text-sm text-white">{q}</h3>
              <p className="text-sm text-neutral-400">{a}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
