"use client"

import { useState } from "react"

function FallbackMockup() {
  return (
    <div className="w-full flex p-6 gap-4 overflow-hidden" style={{ aspectRatio: "16/9" }} aria-hidden="true">
      {/* Sidebar mock */}
      <div className="hidden sm:flex flex-col gap-2 w-36 shrink-0">
        <div className="h-5 w-20 rounded bg-white/10" />
        {[64, 80, 56, 72].map((w, i) => (
          <div key={i} className="h-7 rounded bg-white/5 flex items-center px-2 gap-2">
            <div className="size-3 rounded-sm bg-white/10 shrink-0" />
            <div className="h-2 rounded bg-white/10 flex-1" style={{ maxWidth: `${w}%` }} />
          </div>
        ))}
      </div>
      {/* Kanban columns */}
      <div className="flex flex-1 gap-3 overflow-hidden">
        {[
          { label: "Todo", count: 3 },
          { label: "In Progress", count: 2 },
          { label: "Done", count: 4 },
        ].map(({ label, count }) => (
          <div key={label} className="flex-1 flex flex-col gap-2 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="size-2 rounded-full bg-white/20" />
              <div className="h-3 w-16 rounded bg-white/15" />
              <div className="h-3 w-4 rounded bg-white/10 ml-auto" />
            </div>
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="rounded-lg bg-white/5 border border-white/5 p-3 space-y-2">
                <div className="h-2.5 rounded bg-white/15" style={{ width: `${60 + (i * 15) % 35}%` }} />
                <div className="h-2 rounded bg-white/8" style={{ width: `${40 + (i * 20) % 40}%` }} />
                <div className="flex items-center gap-2 mt-3">
                  <div className="size-4 rounded-full bg-[#0029bb]/40 shrink-0" />
                  <div className="h-2 w-10 rounded bg-white/10" />
                  <div className="h-4 w-8 rounded bg-white/5 border border-white/10 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function ScreenshotFrame() {
  const [error, setError] = useState(false)

  if (error) {
    return <FallbackMockup />
  }

  return (
    <img
      src="/screenshot.png"
      alt="Orbit project management dashboard — a dark-themed kanban board with three columns (Todo, In Progress, Done), task cards showing titles, assignee avatars, and priority labels, alongside a left sidebar listing workspaces and boards"
      className="w-full h-auto block"
      onError={() => setError(true)}
    />
  )
}
