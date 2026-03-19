import { createClient } from "@/lib/supabase/server"
import { signOut } from "@/lib/actions/auth"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/app/theme-toggle"
import { LogOut, User } from "lucide-react"

export async function Header() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const displayName =
    user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "?"
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <header className="flex h-14 items-center justify-end gap-2 border-b bg-background px-4">
      <ThemeToggle />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" className="rounded-full">
            <Avatar className="size-7">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="font-normal">
            <p className="text-sm font-medium">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <a href="/settings/profile" className="cursor-pointer">
              <User className="mr-2 size-4" />
              Profile
            </a>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <form action={signOut}>
              <button type="submit" className="flex w-full items-center cursor-pointer">
                <LogOut className="mr-2 size-4" />
                Sign out
              </button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
