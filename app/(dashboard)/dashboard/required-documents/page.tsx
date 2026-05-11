'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FormError } from '@/components/ui/form-error'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ErrorState } from '@/components/ui/error-state'
import { LoadingState } from '@/components/ui/loading-state'
import { applicationsApi, getErrorMessage } from '@/lib/api'
import { licenseTypes } from '@/lib/status-utils'
import type { RequiredDocument } from '@/lib/types'
import { toast } from 'sonner'

export default function RequiredDocumentsPage() {
  const [selectedLicenseType, setSelectedLicenseType] = useState(licenseTypes[0].value)
  const [requiredDocuments, setRequiredDocuments] = useState<RequiredDocument[]>([])
  const [formError, setFormError] = useState('')

  const requiredDocsQuery = useQuery({
    queryKey: ['required-documents-config'],
    queryFn: applicationsApi.getRequiredDocumentsConfig,
  })

  useEffect(() => {
    setRequiredDocuments(requiredDocsQuery.data?.[selectedLicenseType] || [])
  }, [requiredDocsQuery.data, selectedLicenseType])

  const saveMutation = useMutation({
    mutationFn: () => {
      setFormError('')
      return applicationsApi.setRequiredDocuments(selectedLicenseType, requiredDocuments)
    },
    onSuccess: async () => {
      toast.success('Required documents saved')
      await requiredDocsQuery.refetch()
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      setFormError(message)
      toast.error(message)
    },
  })

  const addRequiredDocument = () => {
    setRequiredDocuments((prev) => [...prev, { key: '', label: '' }]) // add new doc row.
  }

  const updateRequiredDocument = (index: number, patch: Partial<RequiredDocument>) => {
    setRequiredDocuments((prev) => prev.map((document, docIndex) => docIndex === index ? { ...document, ...patch } : document))
  }

  const removeRequiredDocument = (index: number) => {
    setRequiredDocuments((prev) => prev.filter((_, docIndex) => docIndex !== index))
  }

  if (requiredDocsQuery.isLoading) return <LoadingState message="Loading required documents..." />
  if (requiredDocsQuery.isError) return <ErrorState title="Could not load required documents" message="Please check that the backend is running." onRetry={() => requiredDocsQuery.refetch()} />

  return (
    <div className="space-y-6">
      <PageHeader title="Required Documents" />

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <Label>License Type</Label>
              <Select value={selectedLicenseType} onValueChange={setSelectedLicenseType}>
                <SelectTrigger className="w-[280px]"><SelectValue /></SelectTrigger>
                <SelectContent>{licenseTypes.map((type) => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button type="button" variant="outline" onClick={addRequiredDocument}>
              <Plus className="mr-2 h-4 w-4" />Add Document
            </Button>
          </div>

          <div className="space-y-3">
            {requiredDocuments.map((document, index) => (
              <div key={`${document.key}-${index}`} className="grid gap-3 md:grid-cols-[180px_1fr_auto]">
                <Input
                  placeholder="document_key"
                  value={document.key}
                  onChange={(event) => updateRequiredDocument(index, { key: event.target.value })}
                />
                <Input
                  placeholder="Document label"
                  value={document.label}
                  onChange={(event) => updateRequiredDocument(index, { label: event.target.value })}
                />
                <Button type="button" variant="ghost" onClick={() => removeRequiredDocument(index)}>Remove</Button>
              </div>
            ))}
          </div>

          <FormError message={formError} />
          <div className="flex justify-end">
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              Save Required Documents
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
