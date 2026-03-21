export const LABELS = [
  { value: "bug",           label: "Bug",           dot: "bg-red-500",    text: "text-red-400" },
  { value: "feature",       label: "Feature",       dot: "bg-purple-400", text: "text-purple-400" },
  { value: "improvement",   label: "Improvement",   dot: "bg-green-400",  text: "text-green-400" },
  { value: "documentation", label: "Documentation", dot: "bg-blue-400",   text: "text-blue-400" },
] as const

export type TaskLabel = (typeof LABELS)[number]["value"]
