'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Eye, FileText, Filter, MoreHorizontal, Plus, Search } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { applicationsApi } from '@/lib/api'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatusBadge } from '@/components/ui/status-badge'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingState } from '@/components/ui/loading-state'
import { ErrorState } from '@/components/ui/error-state'
import { formatDate } from '@/lib/status-utils'
import type { ApplicationStatus } from '@/lib/types'

const statusOptions: { value: ApplicationStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'additional_documents_requested', label: 'Additional Docs Requested' },
  { value: 'resubmitted', label: 'Resubmitted' },
  { value: 'pending_approval', label: 'Pending Approval' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

export default function ApplicationsPage() {
  const { hasRole } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all')

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['applications', statusFilter],
    queryFn: () => applicationsApi.list({ status: statusFilter === 'all' ? undefined : statusFilter, page: 1, limit: 100 }),
  })

  const applications = data?.data || []
  const filteredApplications = useMemo(() => {
    const query = searchQuery.toLowerCase()
    return applications.filter((app) =>
      app.institutionName.toLowerCase().includes(query) ||
      app.referenceNumber.toLowerCase().includes(query) ||
      app.licenseType.toLowerCase().includes(query)
    ) // local search after backend filter.
  }, [applications, searchQuery])

  const getPageTitle = () => {
    if (hasRole('applicant')) return 'My Applications' // applicant see own work.
    if (hasRole('officer')) return 'Applications for Review'
    if (hasRole('approver')) return 'Pending Approvals'
    return 'All Applications'
  }

  if (isLoading) return <LoadingState message="Loading applications..." />
  if (isError) return <ErrorState title="Could not load applications" message="Please check that the backend is running." onRetry={() => refetch()} />

  return (
    <div className="space-y-6">
      <PageHeader
        title={getPageTitle()}
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

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center gap-4">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search by institution, reference, or license..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ApplicationStatus | 'all')}>
                <SelectTrigger className="w-[220px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground">{filteredApplications.length} application(s) found</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {filteredApplications.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No applications found"
              action={hasRole('applicant') && (
                <Button asChild>
                  <Link href="/dashboard/applications/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Application
                  </Link>
                </Button>
              )}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Institution</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>License Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.institutionName}</TableCell>
                    <TableCell className="text-muted-foreground">{app.referenceNumber}</TableCell>
                    <TableCell>{app.licenseType}</TableCell>
                    <TableCell><StatusBadge status={app.status} /></TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(app.createdAt)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/applications/${app.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
