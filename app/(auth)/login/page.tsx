'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowRight, Eye, EyeOff, FileText, Loader2, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PublicHeader } from '@/components/layout/public-header'
import { authApi, getErrorMessage } from '@/lib/api'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    try {
      const response = await authApi.login(data)
      localStorage.setItem('auth_token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      toast.success('Welcome back')
      router.push('/dashboard')
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader active="login" />

      <main className="relative overflow-hidden bg-gradient-to-br from-sidebar/5 via-background to-primary/5">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <section className="space-y-8">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-sidebar/20 bg-card/80 px-4 py-2 text-sm font-medium text-sidebar">
                  <ShieldCheck className="h-4 w-4" />
                  Secure regulator access
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight text-balance">
                  Continue managing licensing and compliance work.
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                  Sign in to submit applications, review workflow activity, upload required documents, and track decisions from the Bank Licensing & Compliance Portal.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 max-w-xl">
                <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                  <div className="h-11 w-11 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  <h2 className="font-semibold text-foreground">Application tracking</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Follow each licensing request through every required stage.
                  </p>
                </div>
                <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                  <div className="h-11 w-11 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                    <ShieldCheck className="h-5 w-5 text-amber-600" />
                  </div>
                  <h2 className="font-semibold text-foreground">Controlled access</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Role permissions protect applicant, officer, and approver work.
                  </p>
                </div>
              </div>
            </section>

            <section className="w-full max-w-md lg:ml-auto">
              <Card className="border-border shadow-2xl">
                <CardHeader className="space-y-2">
                  <CardTitle className="text-2xl font-semibold text-foreground">
                    Sign in
                  </CardTitle>
                  <CardDescription>
                    Use your portal account to access the dashboard.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          autoComplete="current-password"
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

                    <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          Sign In
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>

                  <p className="mt-6 text-center text-sm text-muted-foreground">
                    Do not have an account?{' '}
                    <Link href="/signup" className="font-medium text-primary hover:underline">
                      Create one
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
