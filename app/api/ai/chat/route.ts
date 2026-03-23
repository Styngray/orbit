import { streamText, convertToModelMessages } from "ai"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { createClient } from "@/lib/supabase/server"
import { getTeamPlan } from "@/lib/plans-server"
import { PLAN_LIMITS } from "@/lib/plans"
import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return new Response("Unauthorized", { status: 401 })

  const body = await req.json()
  const { messages, teamId, today: clientToday } = body

  if (!teamId) return new Response("Bad Request", { status: 400 })

  // Verify user belongs to this team
  const { data: membership } = await supabase
    .from("team_members")
    .select("id")
    .eq("team_id", teamId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (!membership) return new Response("Forbidden", { status: 403 })

  // Check AI plan gate
  const plan = await getTeamPlan(teamId)
  if (!PLAN_LIMITS[plan].ai) {
    return new Response(JSON.stringify({ error: "upgrade_required" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    })
  }

  // Fetch all workspaces for this team
  const { data: workspaces } = await supabase
    .from("workspaces")
    .select("id, name")
    .eq("team_id", teamId)

  const workspaceIds = (workspaces ?? []).map((w) => w.id)
  const workspaceMap = Object.fromEntries((workspaces ?? []).map((w) => [w.id, w.name]))

  const taskLines: string[] = []

  if (workspaceIds.length > 0) {
    const { data: boards } = await supabase
      .from("boards")
      .select("id, name, workspace_id")
      .in("workspace_id", workspaceIds)

    const boardIds = (boards ?? []).map((b) => b.id)
    const boardMap = Object.fromEntries((boards ?? []).map((b) => [b.id, b]))

    if (boardIds.length > 0) {
      const { data: tasks } = await supabase
        .from("tasks")
        .select("id, title, status, priority, due_date, labels, assignee_id, board_id")
        .in("board_id", boardIds)

      // Resolve assignee display names
      const assigneeIds = [
        ...new Set(
          (tasks ?? [])
            .filter((t) => t.assignee_id)
            .map((t) => t.assignee_id as string)
        ),
      ]
      const profileMap: Record<string, string> = {}
      if (assigneeIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, display_name")
          .in("id", assigneeIds)
        for (const p of profiles ?? []) {
          profileMap[p.id] = p.display_name ?? p.id
        }
      }

      // Group tasks by board
      const tasksByBoard: Record<string, typeof tasks> = {}
      for (const task of tasks ?? []) {
        if (!tasksByBoard[task.board_id]) tasksByBoard[task.board_id] = []
        tasksByBoard[task.board_id]!.push(task)
      }

      for (const [boardId, boardTasks] of Object.entries(tasksByBoard)) {
        const board = boardMap[boardId]
        const workspaceName = workspaceMap[board?.workspace_id] ?? "Unknown"
        taskLines.push(`\nBoard: ${board?.name ?? "Unknown"} (Workspace: ${workspaceName})`)
        for (const task of boardTasks ?? []) {
          const assignee = task.assignee_id
            ? (profileMap[task.assignee_id] ?? "Unknown")
            : "Unassigned"
          const due = task.due_date ?? "None"
          const labels = task.labels?.length ? task.labels.join(", ") : "None"
          taskLines.push(
            `  - [${task.priority}] ${task.title} | Status: ${task.status} | Assignee: ${assignee} | Due: ${due} | Labels: ${labels}`
          )
        }
      }
    }
  }

  const today = clientToday ?? new Date().toISOString().split("T")[0]
  const systemPrompt = `You are an AI assistant for a project management tool called Orbit.
You have access to all tasks across the user's organization.

Today's date: ${today}

Organization tasks:
---${taskLines.length > 0 ? taskLines.join("\n") : "\nNo tasks found."}
---

Answer questions about tasks, priorities, assignments, and blockers. Be concise and use markdown lists when helpful.`

  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY!,
  })

  const modelMessages = await convertToModelMessages(messages)

  const result = await streamText({
    model: openrouter(process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini"),
    system: systemPrompt,
    messages: modelMessages,
  })

  return result.toUIMessageStreamResponse()
}
