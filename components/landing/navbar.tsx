"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0a0a0b]/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg tracking-tight text-white">
          Orbit
        </Link>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-neutral-400 hover:text-white hover:bg-white/5"
            asChild
          >
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button
            size="sm"
            className="bg-[#0029bb] hover:bg-[#0033dd] text-white shadow-lg shadow-[#001266]/30"
            asChild
          >
            <Link href="/sign-up">Get started</Link>
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex items-center justify-center size-9 rounded-md text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/5 bg-[#0a0a0b]">
          <nav className="flex flex-col px-6 py-4 gap-1">
            <Link
              href="/pricing"
              onClick={() => setMobileOpen(false)}
              className="text-lg font-medium text-neutral-300 hover:text-white py-3 border-b border-white/5 transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/sign-in"
              onClick={() => setMobileOpen(false)}
              className="text-lg font-medium text-neutral-300 hover:text-white py-3 border-b border-white/5 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              onClick={() => setMobileOpen(false)}
              className="mt-3 flex items-center justify-center h-11 rounded-lg bg-[#0029bb] hover:bg-[#0033dd] text-white font-medium transition-colors"
            >
              Get started
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
