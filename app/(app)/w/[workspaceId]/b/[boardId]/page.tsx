import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getTeamPlan } from "@/lib/plans-server"
import { KanbanBoard } from "@/components/app/kanban/kanban-board"

interface Props {
  params: Promise<{ workspaceId: string; boardId: string }>
}

export default async function BoardPage({ params }: Props) {
  const { workspaceId, boardId } = await params
  const supabase = await createClient()

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id, team_id")
    .eq("id", workspaceId)
    .single()

  if (!workspace) notFound()

  const [{ data: board }, { data: tasks }, { data: memberRows }, { data: customLabels }, { data: boardStatuses }, plan] =
    await Promise.all([
      supabase
        .from("boards")
        .select("id, name")
        .eq("id", boardId)
        .single(),
      supabase
        .from("tasks")
        .select(
          "id, board_id, title, description, status, priority, sort_order, assignee_id, due_date, labels, created_at"
        )
        .eq("board_id", boardId)
        .order("sort_order"),
      supabase
        .from("team_members")
        .select("user_id")
        .eq("team_id", workspace.team_id),
      supabase
        .from("labels")
        .select("id, name, color")
        .eq("workspace_id", workspaceId)
        .order("created_at"),
      supabase
        .from("board_statuses")
        .select("id, board_id, value, label, color, sort_order")
        .eq("board_id", boardId)
        .order("sort_order"),
      getTeamPlan(workspace.team_id),
    ])

  if (!board) notFound()

  const userIds = (memberRows ?? []).map((m) => m.user_id)
  const { data: profileRows } = userIds.length
    ? await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .in("id", userIds)
    : { data: [] }

  const normalizedMembers = (memberRows ?? []).map((m) => ({
    user_id: m.user_id,
    profiles: (profileRows ?? []).find((p) => p.id === m.user_id) ?? null,
  }))

  return (
    <KanbanBoard
      initialTasks={(tasks ?? []) as import("@/lib/actions/tasks").Task[]}
      initialStatuses={(boardStatuses ?? []) as import("@/lib/actions/statuses").BoardStatus[]}
      members={normalizedMembers}
      boardId={boardId}
      workspaceId={workspaceId}
      teamId={workspace.team_id}
      boardName={board.name}
      customLabels={(customLabels ?? []) as import("@/lib/label-constants").CustomLabel[]}
      isPro={plan === "pro"}
    />
  )
}
