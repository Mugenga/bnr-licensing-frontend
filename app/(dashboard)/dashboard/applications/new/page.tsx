'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FileText, Loader2, Upload, X } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { FormError } from '@/components/ui/form-error'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { applicationsApi, getErrorMessage } from '@/lib/api'
import { formatFileSize, licenseTypes } from '@/lib/status-utils'

const applicationSchema = z.object({
  institutionName: z.string().min(2, 'Institution name must be at least 2 characters'),
  licenseType: z.string().min(1, 'License type is required'),
  description: z.string().optional(),
})

type ApplicationForm = z.infer<typeof applicationSchema>

const MAX_FILE_SIZE = 5 * 1024 * 1024

export default function NewApplicationPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [formError, setFormError] = useState('')

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<ApplicationForm>({
    resolver: zodResolver(applicationSchema),
    defaultValues: { licenseType: '' },
  })

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const validFiles = Array.from(files).filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} exceeds the 5MB limit`) // keep files under backend limit.
        return false
      }
      return true
    })

    setUploadedFiles((prev) => [...prev, ...validFiles])
    e.target.value = '' // lets same file be picked again.
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, fileIndex) => fileIndex !== index))
  }

  const createApplication = async (data: ApplicationForm, submit: boolean) => {
    const application = await applicationsApi.create(data)
    if (uploadedFiles.length > 0) {
      await applicationsApi.uploadDocuments(application.id, uploadedFiles) // attach files after draft exist.
    }
    if (submit) {
      await applicationsApi.submit(application.id) // submit after uploads finish.
    }
    return application
  }

  const onSubmit = async (data: ApplicationForm) => {
    setIsSubmitting(true)
    setFormError('')
    try {
      await createApplication(data, true)
      toast.success('Application submitted successfully')
      router.push('/dashboard/applications')
    } catch (error) {
      const message = getErrorMessage(error)
      setFormError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const saveDraft = handleSubmit(async (data) => {
    setIsSavingDraft(true)
    setFormError('')
    try {
      const application = await createApplication(data, false)
      toast.success('Draft saved successfully')
      router.push(`/dashboard/applications/${application.id}`)
    } catch (error) {
      const message = getErrorMessage(error)
      setFormError(message)
      toast.error(message)
    } finally {
      setIsSavingDraft(false)
    }
  })

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader title="New License Application" backHref="/dashboard/applications" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Institution Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="institutionName">Institution Name *</Label>
              <Input id="institutionName" placeholder="Enter institution name" {...register('institutionName')} className={errors.institutionName ? 'border-destructive' : ''} />
              {errors.institutionName && <p className="text-xs text-destructive">{errors.institutionName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="licenseType">License Type *</Label>
              <Select onValueChange={(value) => setValue('licenseType', value, { shouldValidate: true })}>
                <SelectTrigger className={errors.licenseType ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select license type" />
                </SelectTrigger>
                <SelectContent>
                  {licenseTypes.map((type) => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.licenseType && <p className="text-xs text-destructive">{errors.licenseType.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Additional Information</Label>
              <Textarea id="description" {...register('description')} rows={4} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supporting Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Label htmlFor="file-upload" className="block cursor-pointer">
              <div className="flex items-center gap-2 rounded-lg border border-dashed border-secondary px-4 py-6 transition-colors hover:bg-accent">
                <Upload className="h-4 w-4 text-secondary" />
                <span className="text-sm font-medium text-secondary">Upload Files</span>
              </div>
              <input id="file-upload" type="file" multiple className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" />
            </Label>

            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Documents</Label>
                {uploadedFiles.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-3">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-secondary" />
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeFile(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <div className="mr-auto w-full max-w-md">
            <FormError message={formError} />
          </div>
          <Button type="button" variant="outline" onClick={saveDraft} disabled={isSavingDraft || isSubmitting}>
            {isSavingDraft ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : 'Save as Draft'}
          </Button>
          <Button type="submit" disabled={isSubmitting || isSavingDraft}>
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</> : 'Submit Application'}
          </Button>
        </div>
      </form>
    </div>
  )
}
