import type { Metadata } from "next"
import Navbar from "@/components/landing/navbar"
import Footer from "@/components/landing/footer"

export const metadata: Metadata = {
  title: "Terms & Conditions — Orbit",
  description: "The terms and conditions governing your use of the Orbit platform.",
}

export default function TermsPage() {
  return (
    <div className="dark min-h-screen flex flex-col" style={{ backgroundColor: "#0a0a0b", color: "#fafafa" }}>
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-20">
        <div className="space-y-2 mb-12">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#4d79ff]">Legal</p>
          <h1 className="text-4xl font-bold tracking-tight text-white">Terms &amp; Conditions</h1>
          <p className="text-neutral-400">Last updated: March 2025</p>
        </div>

        <div className="prose prose-invert prose-neutral max-w-none space-y-10 text-neutral-300 leading-7">

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Orbit (&ldquo;the Service&rdquo;), you agree to be bound by these Terms &amp; Conditions.
              If you do not agree, do not use the Service. These terms apply to all users, including free and paid accounts.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">2. Use of the Service</h2>
            <p>You agree to use Orbit only for lawful purposes. You must not:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Violate any applicable laws or regulations</li>
              <li>Attempt to gain unauthorised access to any part of the Service</li>
              <li>Upload malicious code, spam, or content that infringes third-party rights</li>
              <li>Resell or sublicense the Service without our written consent</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">3. Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for all activity
              that occurs under your account. Notify us immediately if you suspect unauthorised use. We reserve the right
              to suspend or terminate accounts that violate these terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">4. Subscriptions and Billing</h2>
            <p>
              Paid plans are billed monthly in advance. Prices are as stated on our pricing page at the time of purchase.
              Subscriptions automatically renew until cancelled. You may cancel at any time from your billing settings;
              cancellation takes effect at the end of the current billing period. No refunds are issued for partial periods.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">5. Free Plan Limitations</h2>
            <p>
              The Free plan is provided at no cost and is subject to usage limits (1 project, solo use). We reserve the
              right to modify or discontinue the Free plan at any time with reasonable notice.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">6. Intellectual Property</h2>
            <p>
              Orbit and its original content, features, and functionality are owned by us and are protected by applicable
              intellectual property laws. Your content remains yours — by uploading it you grant us a limited licence to
              store and display it solely for the purpose of providing the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">7. Disclaimer of Warranties</h2>
            <p>
              The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind, either express or
              implied. We do not guarantee that the Service will be uninterrupted, error-free, or free of viruses.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">8. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, Orbit shall not be liable for any indirect, incidental, special,
              consequential, or punitive damages arising from your use of or inability to use the Service, even if we
              have been advised of the possibility of such damages.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">9. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will provide notice of material changes via
              email or in-app notification at least 14 days before they take effect. Continued use after that date
              constitutes acceptance of the revised terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">10. Governing Law</h2>
            <p>
              These terms are governed by and construed in accordance with applicable law. Any disputes shall be resolved
              through binding arbitration or in the courts of competent jurisdiction.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">11. Contact</h2>
            <p>
              For questions about these terms, please email{" "}
              <a href="mailto:legal@orbit.app" className="text-[#4d79ff] hover:underline">
                legal@orbit.app
              </a>.
            </p>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  )
}
