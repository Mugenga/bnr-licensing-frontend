'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Building2, Calendar, CheckCircle, Clock, Download, FileText, Mail, MessageSquare, MoreHorizontal, Upload, XCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { applicationsApi, documentsApi, getErrorMessage } from '@/lib/api'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { StatusBadge } from '@/components/ui/status-badge'
import { IconCircle } from '@/components/ui/icon-circle'
import { LoadingState } from '@/components/ui/loading-state'
import { ErrorState } from '@/components/ui/error-state'
import { formatDate, formatDateTime, formatFileSize } from '@/lib/status-utils'
import { toast } from 'sonner'

export default function ApplicationDetailsPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const queryClient = useQueryClient()
  const { hasRole, user } = useAuth()
  const [showRequestDocsDialog, setShowRequestDocsDialog] = useState(false)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [requestMessage, setRequestMessage] = useState('')
  const [decisionNote, setDecisionNote] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const applicationQuery = useQuery({ queryKey: ['application', id], queryFn: () => applicationsApi.get(id) })
  const documentsQuery = useQuery({ queryKey: ['application-documents', id], queryFn: () => applicationsApi.getDocuments(id), enabled: !!applicationQuery.data })
  const auditQuery = useQuery({ queryKey: ['application-audit', id], queryFn: () => applicationsApi.getAuditLogs(id), enabled: !!applicationQuery.data })

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['application', id] }),
      queryClient.invalidateQueries({ queryKey: ['application-documents', id] }),
      queryClient.invalidateQueries({ queryKey: ['application-audit', id] }),
      queryClient.invalidateQueries({ queryKey: ['applications'] }),
    ])
  }

  const actionMutation = useMutation({
    mutationFn: async ({ action, value }: { action: string; value?: string }) => {
      if (action === 'submit') return applicationsApi.submit(id)
      if (action === 'review') return applicationsApi.startReview(id)
      if (action === 'requestDocuments') return applicationsApi.requestDocuments(id, value || '')
      if (action === 'resubmit') return applicationsApi.resubmit(id)
      if (action === 'pendingApproval') return applicationsApi.markPendingApproval(id)
      if (action === 'approve') return applicationsApi.approve(id, value || '')
      if (action === 'reject') return applicationsApi.reject(id, value || '')
      throw new Error('Unknown action')
    },
    onSuccess: async () => {
      toast.success('Application updated')
      setShowRequestDocsDialog(false)
      setShowApproveDialog(false)
      setShowRejectDialog(false)
      setRequestMessage('')
      setDecisionNote('')
      await invalidate()
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const uploadMutation = useMutation({
    mutationFn: () => applicationsApi.uploadDocuments(id, selectedFiles),
    onSuccess: async () => {
      toast.success('Documents uploaded')
      setSelectedFiles([])
      await invalidate()
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const app = applicationQuery.data
  const documents = documentsQuery.data || []
  const auditLogs = auditQuery.data || []

  if (applicationQuery.isLoading) return <LoadingState message="Loading application..." />
  if (applicationQuery.isError || !app) return <ErrorState title="Could not load application" message="Please check that the backend is running." onRetry={() => applicationQuery.refetch()} />

  const canSubmit = hasRole('applicant') && app.status === 'draft'
  const canReview = hasRole('officer') && ['submitted', 'resubmitted'].includes(app.status)
  const canRequestDocs = hasRole('officer') && app.status === 'under_review'
  const canPendingApproval = hasRole('officer') && app.status === 'under_review'
  const canApprove = hasRole('approver') && app.status === 'pending_approval'
  const canUploadDocs = hasRole('applicant') && ['draft', 'additional_documents_requested'].includes(app.status)
  const canResubmit = hasRole('applicant') && app.status === 'additional_documents_requested'

  const downloadDocument = async (documentId: string, fileName: string) => {
    try {
      const blob = await documentsApi.download(documentId)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={app.institutionName}
        backHref="/dashboard/applications"
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={app.status} />
            {(canSubmit || canReview || canRequestDocs || canPendingApproval || canApprove || canResubmit) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button>Actions<MoreHorizontal className="ml-2 h-4 w-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canSubmit && <DropdownMenuItem onClick={() => actionMutation.mutate({ action: 'submit' })}><CheckCircle className="mr-2 h-4 w-4" />Submit Application</DropdownMenuItem>}
                  {canReview && <DropdownMenuItem onClick={() => actionMutation.mutate({ action: 'review' })}><Clock className="mr-2 h-4 w-4" />Start Review</DropdownMenuItem>}
                  {canRequestDocs && <DropdownMenuItem onClick={() => setShowRequestDocsDialog(true)}><MessageSquare className="mr-2 h-4 w-4" />Request Documents</DropdownMenuItem>}
                  {canPendingApproval && <DropdownMenuItem onClick={() => actionMutation.mutate({ action: 'pendingApproval' })}><CheckCircle className="mr-2 h-4 w-4" />Mark Pending Approval</DropdownMenuItem>}
                  {canResubmit && <DropdownMenuItem onClick={() => actionMutation.mutate({ action: 'resubmit' })}><Upload className="mr-2 h-4 w-4" />Resubmit Application</DropdownMenuItem>}
                  {canApprove && <DropdownMenuItem onClick={() => setShowApproveDialog(true)}><CheckCircle className="mr-2 h-4 w-4 text-green-600" />Approve Application</DropdownMenuItem>}
                  {canApprove && <DropdownMenuItem onClick={() => setShowRejectDialog(true)}><XCircle className="mr-2 h-4 w-4 text-red-600" />Reject Application</DropdownMenuItem>}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <Info icon={Building2} color="blue" label="Institution Name" value={app.institutionName} />
                <Info icon={FileText} color="green" label="Reference Number" value={app.referenceNumber} />
                <Info icon={Calendar} color="yellow" label="License Type" value={app.licenseType} />
                <Info icon={Clock} color="orange" label="Created" value={formatDateTime(app.createdAt)} />
              </div>
              {app.description && <p className="mt-6 text-sm text-muted-foreground">{app.description}</p>}
            </CardContent>
          </Card>

          <Card>
            <Tabs defaultValue="documents">
              <CardHeader className="pb-0"><TabsList><TabsTrigger value="documents">Documents</TabsTrigger><TabsTrigger value="timeline">Timeline</TabsTrigger></TabsList></CardHeader>
              <CardContent className="pt-6">
                <TabsContent value="documents" className="m-0 space-y-4">
                  {canUploadDocs && (
                    <div className="rounded-lg border border-dashed border-secondary p-4">
                      <Label htmlFor="document-upload" className="flex cursor-pointer items-center gap-2 text-secondary">
                        <Upload className="h-4 w-4" /> Select documents to upload
                      </Label>
                      <input id="document-upload" type="file" multiple className="hidden" onChange={(event) => setSelectedFiles(Array.from(event.target.files || []))} />
                      {selectedFiles.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {selectedFiles.map((file) => <p key={file.name} className="text-sm">{file.name} ({formatFileSize(file.size)})</p>)}
                          <Button onClick={() => uploadMutation.mutate()} disabled={uploadMutation.isPending}>Upload</Button>
                        </div>
                      )}
                    </div>
                  )}
                  {documents.length === 0 ? <p className="text-sm text-muted-foreground">No documents uploaded.</p> : documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="flex items-center gap-3">
                        <IconCircle icon={FileText} color="purple" size="md" />
                        <div>
                          <p className="font-medium">{doc.originalName}</p>
                          <p className="text-sm text-muted-foreground">Version {doc.version} • {formatFileSize(doc.sizeBytes)}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => downloadDocument(doc.id, doc.originalName)}><Download className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </TabsContent>
                <TabsContent value="timeline" className="m-0">
                  <div className="space-y-4">
                    {auditLogs.length === 0 ? <p className="text-sm text-muted-foreground">No audit events visible.</p> : auditLogs.map((entry, index) => (
                      <div key={entry.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary"><Clock className="h-4 w-4 text-primary-foreground" /></div>
                          {index < auditLogs.length - 1 && <div className="mt-2 w-px flex-1 bg-border" />}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-medium">{entry.action.replace(/_/g, ' ')}</p>
                          <p className="text-sm text-muted-foreground">{entry.fromStatus || '-'} → {entry.toStatus || '-'}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(entry.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Applicant Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary font-semibold text-secondary-foreground">
                  {(user?.fullName || 'A').charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{user?.fullName || 'Applicant'}</p>
                  <p className="text-sm text-muted-foreground">{user?.role?.name || 'User'}</p>
                </div>
              </div>
              {user?.email && <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{user.email}</span></div>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Application Status</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Current Status</span><StatusBadge status={app.status} /></div>
              <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Created</span><span className="text-sm">{formatDate(app.createdAt)}</span></div>
              <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Last Updated</span><span className="text-sm">{formatDate(app.updatedAt)}</span></div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showRequestDocsDialog} onOpenChange={setShowRequestDocsDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Request Additional Documents</DialogTitle></DialogHeader>
          <div className="space-y-2 py-4"><Label htmlFor="request-message">Documents Required</Label><Textarea id="request-message" value={requestMessage} onChange={(e) => setRequestMessage(e.target.value)} rows={4} /></div>
          <DialogFooter><Button variant="outline" onClick={() => setShowRequestDocsDialog(false)}>Cancel</Button><Button onClick={() => actionMutation.mutate({ action: 'requestDocuments', value: requestMessage })} disabled={!requestMessage.trim() || actionMutation.isPending}>Send Request</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Approve Application</DialogTitle></DialogHeader>
          <div className="space-y-2 py-4"><Label htmlFor="approve-note">Decision Note</Label><Textarea id="approve-note" value={decisionNote} onChange={(e) => setDecisionNote(e.target.value)} rows={4} /></div>
          <DialogFooter><Button variant="outline" onClick={() => setShowApproveDialog(false)}>Cancel</Button><Button onClick={() => actionMutation.mutate({ action: 'approve', value: decisionNote })} disabled={!decisionNote.trim() || actionMutation.isPending} className="bg-green-600 hover:bg-green-700">Approve</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject Application</DialogTitle></DialogHeader>
          <div className="space-y-2 py-4"><Label htmlFor="reject-note">Decision Note</Label><Textarea id="reject-note" value={decisionNote} onChange={(e) => setDecisionNote(e.target.value)} rows={4} /></div>
          <DialogFooter><Button variant="outline" onClick={() => setShowRejectDialog(false)}>Cancel</Button><Button onClick={() => actionMutation.mutate({ action: 'reject', value: decisionNote })} variant="destructive" disabled={!decisionNote.trim() || actionMutation.isPending}>Reject</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Info({ icon, color, label, value }: { icon: React.ComponentType<{ className?: string }>; color: 'green' | 'yellow' | 'blue' | 'teal' | 'orange' | 'purple'; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <IconCircle icon={icon} color={color} size="md" />
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  )
}
