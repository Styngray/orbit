import Link from "next/link"
import { Check, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const plans = [
  {
    name: "Free",
    price: 0,
    description: "For solo users getting started",
    features: ["1 project", "Solo use", "Kanban board", "Task management", "Unlimited tasks"],
    cta: "Get started free",
    href: "/sign-up",
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
    href: "/api/stripe/checkout/guest?plan=lite",
    highlighted: true,
  },
  {
    name: "Pro",
    price: 19,
    description: "For growing teams that need more",
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
    href: "/api/stripe/checkout/guest?plan=pro",
    highlighted: false,
  },
]

export default function PricingSection() {
  return (
    <section id="pricing" className="py-24 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#4d79ff] mb-3">
            Pricing
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-neutral-400 max-w-md mx-auto">
            Start free. Upgrade when your team grows or you need more.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl p-6 flex flex-col gap-5 ${
                plan.highlighted
                  ? "bg-[#000e52]/40 border border-[#0029bb]/50 ring-1 ring-[#0029bb]/30 shadow-lg shadow-[#001266]/20"
                  : "bg-white/3 border border-white/8"
              }`}
            >
              {"badge" in plan && plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-[#0029bb] text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-white">{plan.name}</h3>
                <p className="text-sm text-neutral-400 mt-0.5">{plan.description}</p>
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

              <ul className="space-y-2 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-neutral-300">
                    <Check className="size-4 text-emerald-400 shrink-0" />
                    {f}
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
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white transition-colors"
          >
            See full pricing details <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
