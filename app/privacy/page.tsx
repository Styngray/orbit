import type { Metadata } from "next"
import Navbar from "@/components/landing/navbar"
import Footer from "@/components/landing/footer"

export const metadata: Metadata = {
  title: "Privacy Policy — Orbit",
  description: "How Orbit collects, uses, and protects your personal information.",
}

export default function PrivacyPage() {
  return (
    <div className="dark min-h-screen flex flex-col" style={{ backgroundColor: "#0a0a0b", color: "#fafafa" }}>
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-20">
        <div className="space-y-2 mb-12">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#4d79ff]">Legal</p>
          <h1 className="text-4xl font-bold tracking-tight text-white">Privacy Policy</h1>
          <p className="text-neutral-400">Last updated: March 2025</p>
        </div>

        <div className="prose prose-invert prose-neutral max-w-none space-y-10 text-neutral-300 leading-7">

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">1. Information We Collect</h2>
            <p>
              When you create an account, we collect your name, email address, and password. When you use Orbit, we collect
              information about the teams, workspaces, boards, and tasks you create. If you subscribe to a paid plan, our
              payment processor (Stripe) handles your payment details — we never store raw card numbers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide, operate, and improve the Orbit service</li>
              <li>Send transactional emails (account confirmation, invitations, billing receipts)</li>
              <li>Enforce our Terms of Service and prevent abuse</li>
              <li>Respond to support requests</li>
            </ul>
            <p>We do not sell your personal data to third parties.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">3. Cookies and Tracking</h2>
            <p>
              Orbit uses session cookies to keep you signed in. We do not use third-party advertising cookies or tracking
              pixels. We may use aggregate, anonymised analytics to understand usage patterns.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">4. Data Storage and Security</h2>
            <p>
              Your data is stored on servers provided by Supabase (PostgreSQL) hosted in the United States. We use
              industry-standard encryption in transit (TLS) and at rest. Access to production data is restricted to
              authorised personnel only.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">5. Data Retention</h2>
            <p>
              We retain your data for as long as your account is active. If you delete your account, your personal data
              will be permanently removed within 30 days, except where we are required by law to retain it longer.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">6. Third-Party Services</h2>
            <p>Orbit integrates with the following third-party services:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong className="text-white">Supabase</strong> — authentication and database</li>
              <li><strong className="text-white">Stripe</strong> — payment processing</li>
              <li><strong className="text-white">Resend</strong> — transactional email</li>
            </ul>
            <p>Each service has its own privacy policy governing its handling of your data.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">7. Your Rights</h2>
            <p>
              You have the right to access, correct, or delete your personal data at any time. You can update your profile
              from your account settings. To request full data deletion, contact us at the address below.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">8. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material changes by email or
              by posting a notice in the app. Continued use of Orbit after changes take effect constitutes acceptance
              of the revised policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">9. Contact</h2>
            <p>
              For privacy-related questions or requests, please email{" "}
              <a href="mailto:privacy@orbit.app" className="text-[#4d79ff] hover:underline">
                privacy@orbit.app
              </a>.
            </p>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  )
}
