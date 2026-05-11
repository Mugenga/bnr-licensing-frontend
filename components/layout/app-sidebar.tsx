'use client'

import Link from 'next/link'
import Image from 'next/image'
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
    <div className="px-4 py-5">
      <div className="rounded-lg bg-white px-3 py-3 shadow-sm">
        <Image
          src="/bnr-logo.svg"
          alt="National Bank of Rwanda"
          width={170}
          height={40}
          className="h-9 w-auto"
          priority
        />
      </div>
      <p className="mt-3 px-1 text-xs font-medium uppercase tracking-wide text-white/70">
        Licensing Portal
      </p>
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
    <nav className="flex flex-col gap-1.5 px-3">
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
                ? 'bg-white text-sidebar shadow-sm'
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
      <aside className="hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 bg-sidebar">
        <SidebarLogo />
        <div className="flex-1 overflow-y-auto py-4">
          <NavLinks />
        </div>
      </aside>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden fixed top-4 left-4 z-50 bg-sidebar text-white shadow-lg hover:bg-sidebar/90"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 bg-sidebar border-none">
          <SidebarLogo />
          <div className="py-4">
            <NavLinks onItemClick={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
