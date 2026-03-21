export const LABELS = [
  { value: "bug",           label: "Bug",           dot: "bg-red-500",    text: "text-red-400" },
  { value: "feature",       label: "Feature",       dot: "bg-purple-400", text: "text-purple-400" },
  { value: "improvement",   label: "Improvement",   dot: "bg-green-400",  text: "text-green-400" },
  { value: "documentation", label: "Documentation", dot: "bg-blue-400",   text: "text-blue-400" },
] as const

export type TaskLabel = (typeof LABELS)[number]["value"]

export const LABEL_COLORS = [
  { name: "red",    dot: "bg-red-500",    text: "text-red-400" },
  { name: "orange", dot: "bg-orange-400", text: "text-orange-400" },
  { name: "yellow", dot: "bg-yellow-400", text: "text-yellow-400" },
  { name: "green",  dot: "bg-green-400",  text: "text-green-400" },
  { name: "blue",   dot: "bg-blue-400",   text: "text-blue-400" },
  { name: "purple", dot: "bg-purple-400", text: "text-purple-400" },
  { name: "pink",   dot: "bg-pink-400",   text: "text-pink-400" },
  { name: "gray",   dot: "bg-gray-400",   text: "text-gray-400" },
] as const

export type LabelColor = (typeof LABEL_COLORS)[number]["name"]

export interface CustomLabel {
  id: string
  name: string
  color: LabelColor
}

// Merge hardcoded + custom labels into a unified display shape
export function getLabelDisplay(value: string, customLabels: CustomLabel[]): { dot: string; text: string; label: string } | null {
  const hardcoded = LABELS.find((l) => l.value === value)
  if (hardcoded) return hardcoded

  const custom = customLabels.find((l) => l.name === value)
  if (custom) {
    const colorDef = LABEL_COLORS.find((c) => c.name === custom.color) ?? LABEL_COLORS[7]
    return { dot: colorDef.dot, text: colorDef.text, label: custom.name }
  }
  return null
}
