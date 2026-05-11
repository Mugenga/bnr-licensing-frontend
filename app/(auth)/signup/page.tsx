'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowRight, Building2, Eye, EyeOff, Loader2, ShieldCheck, UploadCloud } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PublicHeader } from '@/components/layout/public-header'
import { authApi, getErrorMessage } from '@/lib/api'

const signupSchema = z
  .object({
    fullName: z.string().min(2, 'Full name is required'),
    organizationName: z.string().min(2, 'Institution name is required'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type SignupForm = z.infer<typeof signupSchema>

export default function SignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async ({ confirmPassword, ...data }: SignupForm) => {
    setIsLoading(true)
    try {
      const response = await authApi.register(data)
      localStorage.setItem('auth_token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      toast.success('Account created')
      router.push('/dashboard')
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader active="signup" />

      <main className="relative overflow-hidden bg-gradient-to-br from-sidebar/5 via-background to-primary/5">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <section className="space-y-8">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-sidebar/20 bg-card/80 px-4 py-2 text-sm font-medium text-sidebar">
                  <Building2 className="h-4 w-4" />
                  Applicant registration
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight text-balance">
                  Create your institution account and begin the licensing process.
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                  Register as a financial institution applicant, then prepare applications, upload supporting documents, and follow formal review decisions from one secure portal.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 max-w-xl">
                <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                  <div className="h-11 w-11 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <UploadCloud className="h-5 w-5 text-blue-600" />
                  </div>
                  <h2 className="font-semibold text-foreground">Document-ready</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Keep licensing evidence attached to each application.
                  </p>
                </div>
                <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                  <div className="h-11 w-11 rounded-full bg-teal-100 flex items-center justify-center mb-4">
                    <ShieldCheck className="h-5 w-5 text-teal-600" />
                  </div>
                  <h2 className="font-semibold text-foreground">Applicant access</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your account is limited to your institution's applications.
                  </p>
                </div>
              </div>
            </section>

            <section className="w-full max-w-md lg:ml-auto">
              <Card className="border-border shadow-2xl">
                <CardHeader className="space-y-2">
                  <CardTitle className="text-2xl font-semibold text-foreground">
                    Create account
                  </CardTitle>
                  <CardDescription>
                    Applicant accounts are for licensed or prospective financial institutions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full name</Label>
                      <Input
                        id="fullName"
                        placeholder="Your full name"
                        autoComplete="name"
                        {...register('fullName')}
                        className={errors.fullName ? 'border-destructive' : ''}
                      />
                      {errors.fullName && (
                        <p className="text-xs text-destructive">{errors.fullName.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="organizationName">Institution name</Label>
                      <Input
                        id="organizationName"
                        placeholder="Financial institution name"
                        autoComplete="organization"
                        {...register('organizationName')}
                        className={errors.organizationName ? 'border-destructive' : ''}
                      />
                      {errors.organizationName && (
                        <p className="text-xs text-destructive">{errors.organizationName.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        {...register('email')}
                        className={errors.email ? 'border-destructive' : ''}
                      />
                      {errors.email && (
                        <p className="text-xs text-destructive">{errors.email.message}</p>
                      )}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            autoComplete="new-password"
                            {...register('password')}
                            className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((value) => !value)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="text-xs text-destructive">{errors.password.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm</Label>
                        <Input
                          id="confirmPassword"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Confirm"
                          autoComplete="new-password"
                          {...register('confirmPassword')}
                          className={errors.confirmPassword ? 'border-destructive' : ''}
                        />
                        {errors.confirmPassword && (
                          <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                        )}
                      </div>
                    </div>

                    <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        <>
                          Create Account
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>

                  <p className="mt-6 text-center text-sm text-muted-foreground">
                    Already registered?{' '}
                    <Link href="/login" className="font-medium text-primary hover:underline">
                      Sign in
                    </Link>
                  </p>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
