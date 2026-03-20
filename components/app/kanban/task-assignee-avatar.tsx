import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface Member {
  user_id: string
  profiles: {
    id: string
    display_name: string | null
    avatar_url: string | null
  } | null
}

interface TaskAssigneeAvatarProps {
  assigneeId: string | null
  members: Member[]
}

export function TaskAssigneeAvatar({
  assigneeId,
  members,
}: TaskAssigneeAvatarProps) {
  if (!assigneeId) return null

  const member = members.find((m) => m.user_id === assigneeId)
  if (!member?.profiles) return null

  const { display_name, avatar_url } = member.profiles
  const initials = display_name
    ? display_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?"

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Avatar className="size-5">
          <AvatarImage src={avatar_url ?? undefined} alt={display_name ?? ""} />
          <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
        </Avatar>
      </TooltipTrigger>
      <TooltipContent>{display_name ?? "Unknown"}</TooltipContent>
    </Tooltip>
  )
}
