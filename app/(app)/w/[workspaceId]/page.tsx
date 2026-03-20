import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CreateBoardDialog } from "@/components/app/create-board-dialog"
import { BoardCard } from "@/components/app/board-card"

interface Props {
  params: Promise<{ workspaceId: string }>
}

export default async function WorkspacePage({ params }: Props) {
  const { workspaceId } = await params
  const supabase = await createClient()

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id, name")
    .eq("id", workspaceId)
    .single()

  if (!workspace) notFound()

  const { data: boards } = await supabase
    .from("boards")
    .select("id, name, description, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at")

  return (
    <div className="p-6 h-full overflow-y-auto">
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          {workspace.name}
        </h1>
        <CreateBoardDialog workspaceId={workspaceId} />
      </div>

      {boards && boards.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <BoardCard key={board.id} board={board} workspaceId={workspaceId} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm font-medium">No boards yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first board to get started.
          </p>
        </div>
      )}
    </div>
    </div>
  )
}
