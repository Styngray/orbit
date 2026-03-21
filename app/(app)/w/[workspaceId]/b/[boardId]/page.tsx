import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
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

  const [{ data: board }, { data: tasks }, { data: members }] =
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
        .select("user_id, profiles(id, display_name, avatar_url)")
        .eq("team_id", workspace.team_id),
    ])

  if (!board) notFound()

  // Normalize members: Supabase returns profiles as array from join
  const normalizedMembers = (members ?? []).map((m) => ({
    user_id: m.user_id,
    profiles: Array.isArray(m.profiles) ? (m.profiles[0] ?? null) : m.profiles,
  }))

  return (
    <KanbanBoard
      initialTasks={(tasks ?? []) as import("@/lib/actions/tasks").Task[]}
      members={normalizedMembers}
      boardId={boardId}
      workspaceId={workspaceId}
      boardName={board.name}
    />
  )
}
