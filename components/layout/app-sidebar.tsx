'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  FilePlus,
  Users,
  Shield,
  ClipboardCheck,
  Menu,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useState } from 'react'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles?: string[]
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'My Applications',
    href: '/dashboard/applications',
    icon: FileText,
    roles: ['applicant'],
  },
  {
    label: 'New Application',
    href: '/dashboard/applications/new',
    icon: FilePlus,
    roles: ['applicant'],
  },
  {
    label: 'Applications for Review',
    href: '/dashboard/applications',
    icon: ClipboardCheck,
    roles: ['officer'],
  },
  {
    label: 'Pending Approvals',
    href: '/dashboard/applications',
    icon: ClipboardCheck,
    roles: ['approver'],
  },
  {
    label: 'All Applications',
    href: '/dashboard/applications',
    icon: FileText,
    roles: ['superadmin'],
  },
  {
    label: 'Users',
    href: '/dashboard/users',
    icon: Users,
    roles: ['superadmin'],
  },
  {
    label: 'Roles & Permissions',
    href: '/dashboard/roles',
    icon: Shield,
    roles: ['superadmin'],
  },
]

function SidebarLogo() {
  return (
    <div className="flex items-center gap-3 px-4 py-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
        <span className="text-lg font-bold text-white">BNR</span>
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-white">E-Licensing</span>
        <span className="text-xs text-white/70">National Bank of Rwanda</span>
      </div>
    </div>
  )
}

function NavLinks({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname()
  const { user, hasRole } = useAuth()

  const filteredItems = navItems.filter((item) => {
    if (!item.roles) return true
    return item.roles.some((role) => hasRole(role as 'applicant' | 'officer' | 'approver' | 'superadmin'))
  })

  return (
    <nav className="flex flex-col gap-1 px-3">
      {filteredItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href || 
          (item.href !== '/dashboard' && pathname.startsWith(item.href))

        return (
          <Link
            key={item.href + item.label}
            href={item.href}
            onClick={onItemClick}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-white/20 text-white'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            )}
          >
            <Icon className="h-5 w-5" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export function AppSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-sidebar">
        <SidebarLogo />
        <div className="flex-1 overflow-y-auto py-4">
          <NavLinks />
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden fixed top-4 left-4 z-50 bg-sidebar text-white hover:bg-sidebar/90"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 bg-sidebar border-none">
          <SidebarLogo />
          <div className="py-4">
            <NavLinks onItemClick={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
