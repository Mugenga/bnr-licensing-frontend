'use client'

import { AlertCircle, CheckCircle, Clock, FileText, Plus, XCircle } from 'lucide-react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth-context'
import { applicationsApi } from '@/lib/api'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { IconCircle } from '@/components/ui/icon-circle'
import { StatusBadge } from '@/components/ui/status-badge'
import { LoadingState } from '@/components/ui/loading-state'
import { ErrorState } from '@/components/ui/error-state'
import { formatDate } from '@/lib/status-utils'

interface StatCardProps {
  title: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  color: 'green' | 'yellow' | 'blue' | 'teal' | 'orange' | 'purple'
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <IconCircle icon={Icon} color={color} size="lg" />
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold text-heading">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { user, hasRole } = useAuth()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['applications', 'dashboard'],
    queryFn: () => applicationsApi.list({ page: 1, limit: 100 }),
  })

  const applications = data?.data || []
  const stats = {
    totalApplications: applications.length,
    pendingReview: applications.filter((app) => app.status === 'submitted' || app.status === 'resubmitted').length,
    pendingApproval: applications.filter((app) => app.status === 'pending_approval').length,
    approved: applications.filter((app) => app.status === 'approved').length,
    rejected: applications.filter((app) => app.status === 'rejected').length,
  }
  const recentApplications = applications.slice(0, 5)

  if (isLoading) return <LoadingState message="Loading dashboard..." />
  if (isError) return <ErrorState title="Could not load dashboard" message="Please check that the backend is running." onRetry={() => refetch()} />

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hi ${user?.fullName || 'User'}, Welcome Back!`}
        actions={
          hasRole('applicant') && (
            <Button asChild>
              <Link href="/dashboard/applications/new">
                <Plus className="mr-2 h-4 w-4" />
                New Application
              </Link>
            </Button>
          )
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Applications" value={stats.totalApplications} icon={FileText} color="blue" />
        <StatCard title="Pending Review" value={stats.pendingReview} icon={Clock} color="yellow" />
        <StatCard title="Approved" value={stats.approved} icon={CheckCircle} color="green" />
        <StatCard title="Rejected" value={stats.rejected} icon={XCircle} color="orange" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold text-heading">Recent Applications</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/applications">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentApplications.length === 0 ? (
            <p className="text-sm text-muted-foreground">No applications yet.</p>
          ) : (
            <div className="space-y-4">
              {recentApplications.map((app) => (
                <div key={app.id} className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50">
                  <div className="flex items-center gap-4">
                    <IconCircle icon={FileText} color="purple" size="md" />
                    <div>
                      <p className="font-medium text-heading">{app.institutionName}</p>
                      <p className="text-sm text-muted-foreground">Created {formatDate(app.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <StatusBadge status={app.status} />
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/applications/${app.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {hasRole('officer') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-heading">
              <AlertCircle className="h-5 w-5 text-icon-yellow" />
              Applications Requiring Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">You have {stats.pendingReview} applications waiting for review.</p>
          </CardContent>
        </Card>
      )}

      {hasRole('approver') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-heading">
              <Clock className="h-5 w-5 text-icon-orange" />
              Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">You have {stats.pendingApproval} applications pending final decision.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
