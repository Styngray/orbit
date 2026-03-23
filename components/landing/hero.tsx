import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScreenshotFrame } from "./screenshot-frame"

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-20 pb-0">
      {/* Dot grid background */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Violet glow blob */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-start justify-center">
        <div
          className="mt-[-10%] h-[700px] w-[900px] rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(ellipse at center, #0029bb 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-6">
        {/* Badge */}
        <div className="flex justify-center mb-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-neutral-300">
            <span className="size-1.5 rounded-full bg-[#4d79ff] animate-pulse" />
            Project management for modern teams
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-center text-5xl sm:text-6xl lg:text-[80px] font-bold tracking-[-0.02em] leading-[1.05] text-white">
          Where great work
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, #fff 0%, #6699ff 60%, #0029bb 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            gets done.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mt-6 text-center text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          Orbit brings your projects, team, and deadlines together. Beautifully simple —
          without the noise of tools that do too much.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            size="lg"
            className="bg-[#0029bb] hover:bg-[#0033dd] text-white px-8 shadow-xl shadow-[#001266]/40 h-12"
            asChild
          >
            <Link href="/sign-up">Get started free</Link>
          </Button>
          <Button
            size="lg"
            variant="ghost"
            className="text-neutral-300 hover:text-white hover:bg-white/5 border border-white/10 px-8 h-12"
            asChild
          >
            <a href="#pricing" className="flex items-center gap-2">
              View pricing <ArrowRight className="size-4" />
            </a>
          </Button>
        </div>

        {/* Social proof */}
        <p className="mt-4 text-center text-xs text-neutral-600">
          No credit card required · Free plan available
        </p>

        {/* Product screenshot */}
        <div className="mt-20 mx-auto max-w-5xl">
          <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl ring-1 ring-inset ring-white/5"
            style={{ boxShadow: "0 0 80px rgba(0, 41, 187, 0.15), 0 40px 80px rgba(0,0,0,0.6)" }}
          >
            {/* Browser chrome */}
            <div className="bg-[#141414] px-4 h-9 flex items-center gap-3 border-b border-white/5">
              <div className="flex items-center gap-1.5">
                <div className="size-2.5 rounded-full bg-[#ff5f57]" />
                <div className="size-2.5 rounded-full bg-[#febc2e]" />
                <div className="size-2.5 rounded-full bg-[#28c840]" />
              </div>
              <div className="flex-1 mx-4">
                <div className="max-w-[260px] mx-auto bg-white/5 rounded-md h-5 flex items-center justify-center px-3">
                  <span className="text-[10px] text-neutral-500 font-mono">orbit.app/w/my-workspace</span>
                </div>
              </div>
              {/* Ask AI + add buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="flex items-center gap-1 bg-white/8 hover:bg-white/12 rounded-md px-2 h-6 cursor-default">
                  <span className="text-[#4d79ff] text-[10px]">✦</span>
                  <span className="text-[10px] text-neutral-300 font-medium">Ask AI</span>
                </div>
                <div className="flex items-center justify-center bg-white/8 rounded-md size-6 cursor-default">
                  <span className="text-neutral-300 text-[11px] leading-none">+</span>
                </div>
              </div>
            </div>

            {/* Dashboard preview */}
            <ScreenshotFrame />
          </div>

          {/* Gradient fade at bottom to blend into next section */}
          <div
            className="relative -mt-32 h-32 pointer-events-none"
            style={{
              background: "linear-gradient(to top, #0a0a0b, transparent)",
            }}
          />
        </div>
      </div>
    </section>
  )
}
