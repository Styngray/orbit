import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-10">
      <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-center gap-3 sm:gap-6">
          <Link href="/" className="font-bold text-white tracking-tight">
            Orbit
          </Link>
          <nav className="flex flex-wrap justify-center sm:justify-start items-center gap-5">
            <Link href="/pricing" className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors">
              Pricing
            </Link>
            <Link href="/sign-in" className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors">
              Sign in
            </Link>
            <Link href="/sign-up" className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors">
              Sign up
            </Link>
            <Link href="/privacy" className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors">
              Terms &amp; Conditions
            </Link>
          </nav>
        </div>
        <p className="text-sm text-neutral-600">
          © {new Date().getFullYear()} Orbit. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
