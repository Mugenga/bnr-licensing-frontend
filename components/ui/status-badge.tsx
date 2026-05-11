import type { ApplicationStatus } from '@/lib/types'
import { getStatusStyle } from '@/lib/status-utils'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: ApplicationStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = getStatusStyle(status)

  return (
    <span
      className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', style.className, className)}
    >
      {style.label}
    </span>
  )
}
