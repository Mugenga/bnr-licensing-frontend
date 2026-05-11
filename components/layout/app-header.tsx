'use client'

import { ChevronDown, LogOut, Search, User } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function AppHeader() {
  const { user, logout } = useAuth()

  const fullName = user?.fullName || 'User'
  const initials = user
    ? fullName.split(' ').map((part) => part.charAt(0)).join('').slice(0, 2).toUpperCase()
    : 'U'

  const roleName = user?.role?.name || 'User'

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-card/85 md:px-8">
      <div className="ml-12 flex items-center gap-3 md:ml-0">
        <div className="hidden h-9 w-72 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm text-muted-foreground md:flex">
          <Search className="h-4 w-4" />
          <span>Search applications, users, roles</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex h-11 items-center gap-2 rounded-lg px-2 hover:bg-accent">
              <Avatar className="h-8 w-8 bg-secondary">
                <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex md:flex-col md:items-start">
                <span className="text-sm font-medium text-foreground">{fullName}</span>
                <span className="text-xs text-muted-foreground uppercase">{roleName}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="flex items-center gap-2">
              <User className="h-4 w-4" />
              My Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex items-center gap-2 text-destructive focus:text-destructive"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
