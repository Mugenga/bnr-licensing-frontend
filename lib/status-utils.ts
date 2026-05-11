import type { ApplicationStatus } from './api'

export const statusConfig: Record<ApplicationStatus, { label: string; className: string }> = {
  draft: {
    label: 'Draft',
    className: 'bg-gray-100 text-gray-600',
  },
  submitted: {
    label: 'Submitted',
    className: 'bg-blue-100 text-blue-700',
  },
  under_review: {
    label: 'Under Review',
    className: 'bg-amber-100 text-amber-700',
  },
  additional_documents_requested: {
    label: 'Additional Docs Requested',
    className: 'bg-orange-100 text-orange-700',
  },
  resubmitted: {
    label: 'Resubmitted',
    className: 'bg-indigo-100 text-indigo-700',
  },
  pending_approval: {
    label: 'Pending Approval',
    className: 'bg-yellow-100 text-yellow-700',
  },
  approved: {
    label: 'Approved',
    className: 'bg-green-100 text-green-700',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-100 text-red-700',
  },
}

export const licenseTypes = [
  { value: 'Commercial Bank License', label: 'Commercial Bank License' },
  { value: 'Microfinance License', label: 'Microfinance License' },
  { value: 'Forex Bureau License', label: 'Forex Bureau License' },
  { value: 'Mobile Money License', label: 'Mobile Money License' },
  { value: 'Insurance License', label: 'Insurance License' },
]

export const licenseTypeLabels = Object.fromEntries(licenseTypes.map((type) => [type.value, type.label])) as Record<string, string>

export const documentCategoryLabels: Record<string, string> = {
  general: 'General Document',
}

export function formatStatus(status: ApplicationStatus): string {
  return statusConfig[status]?.label || status
}

export function getStatusStyle(status: ApplicationStatus) {
  return statusConfig[status] || statusConfig.draft
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-RW', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('en-RW', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
