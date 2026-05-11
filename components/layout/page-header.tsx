import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface PageHeaderProps {
  title: string
  description?: string
  backHref?: string
  actions?: React.ReactNode
}

export function PageHeader({ title, description, backHref, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border/80 bg-card px-5 py-5 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-4">
        {backHref && (
          <Button variant="ghost" size="icon" asChild className="mt-0.5">
            <Link href={backHref}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-heading">{title}</h1>
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
