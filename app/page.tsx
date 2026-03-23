import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Navbar from "@/components/landing/navbar"
import Hero from "@/components/landing/hero"
import Features from "@/components/landing/features"
import PricingSection from "@/components/landing/pricing-section"
import Footer from "@/components/landing/footer"

export const metadata: Metadata = {
  title: "Orbit — Project management for modern teams",
  description:
    "Orbit brings your projects, team, and deadlines together. Kanban boards, member invites, AI task generation, and simple billing — all in one beautiful tool.",
  openGraph: {
    title: "Orbit — Project management for modern teams",
    description:
      "Orbit brings your projects, team, and deadlines together. Kanban boards, member invites, AI task generation, and simple billing — all in one beautiful tool.",
    url: "/",
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Orbit",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Project management tool with kanban boards, team collaboration, AI task generation, and billing — built for modern teams.",
  offers: [
    {
      "@type": "Offer",
      name: "Free",
      price: "0",
      priceCurrency: "USD",
      description: "1 project, solo use, kanban board, unlimited tasks",
    },
    {
      "@type": "Offer",
      name: "Lite",
      price: "9",
      priceCurrency: "USD",
      description: "10 projects, up to 3 team members, member invites, email notifications",
    },
    {
      "@type": "Offer",
      name: "Pro",
      price: "19",
      priceCurrency: "USD",
      description:
        "Unlimited projects and team members, AI task generation, AI board summaries, priority support",
    },
  ],
}

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: workspaces } = await supabase
      .from("workspaces")
      .select("id")
      .order("created_at")
      .limit(1)

    if (!workspaces || workspaces.length === 0) {
      redirect("/onboarding")
    }
    redirect(`/w/${workspaces[0].id}`)
  }

  return (
    // Force dark mode on the landing page regardless of user theme preference
    <div className="dark min-h-screen" style={{ backgroundColor: "#0a0a0b", color: "#fafafa" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <Hero />
      <Features />
      <PricingSection />
      <Footer />
    </div>
  )
}
