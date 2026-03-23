import { LayoutGrid, Users, Bot, Zap, Check } from "lucide-react"
import { ScreenshotFrame } from "@/components/landing/screenshot-frame"

const features = [
  {
    icon: LayoutGrid,
    name: "Kanban boards",
    description:
      "Visualize your workflow with drag-and-drop boards. Move tasks between columns and keep your entire team in sync.",
    accent: "text-[#4d79ff]",
    bg: "bg-[#0029bb]/10",
  },
  {
    icon: Users,
    name: "Team collaboration",
    description:
      "Invite your team, assign tasks, and manage roles. Everyone sees the same board in real time.",
    accent: "text-sky-400",
    bg: "bg-sky-500/10",
  },
  {
    icon: Bot,
    name: "AI-powered (Pro)",
    description:
      "Generate tasks from a description, break epics into subtasks, and get intelligent board summaries — all with one click.",
    accent: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Zap,
    name: "Built to move fast",
    description:
      "Keyboard shortcuts, quick-add forms, and a focused interface designed to keep you in flow, not fighting your tools.",
    accent: "text-amber-400",
    bg: "bg-amber-500/10",
  },
]

export default function Features() {
  return (
    <section className="py-24 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#4d79ff] mb-3">
            Everything you need
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Built for how teams actually work
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => (
            <div
              key={f.name}
              className="group rounded-xl border border-white/8 bg-white/3 p-6 space-y-4 hover:bg-white/5 hover:border-white/12 transition-all duration-200"
            >
              <div className={`inline-flex size-10 items-center justify-center rounded-lg ${f.bg}`}>
                <f.icon className={`size-5 ${f.accent}`} />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1.5">{f.name}</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">{f.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Kanban view showcase */}
        <div className="mt-20 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Text side */}
          <div className="lg:w-1/2 shrink-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-neutral-300 mb-6">
              <LayoutGrid className="size-3.5 text-[#4d79ff]" />
              Kanban view
            </div>
            <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
              See your work,<br />at a glance.
            </h3>
            <p className="text-neutral-400 leading-relaxed mb-8 max-w-md">
              Every issue in the right column. Drag to move, click to expand.
              Priorities and assignees visible without opening a single modal.
            </p>
            <ul className="space-y-3">
              {[
                "Custom statuses per project",
                "Priority, labels & assignees on every card",
                "List view toggle for power users",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-neutral-300">
                  <Check className="size-4 text-[#4d79ff] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Screenshot side */}
          <div className="lg:w-1/2 w-full rounded-xl overflow-hidden border border-white/8 bg-white/3">
            <ScreenshotFrame />
          </div>
        </div>
      </div>
    </section>
  )
}
