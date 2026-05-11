'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
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
    setValue,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    try {
      const response = await authApi.login(data)
      localStorage.setItem('auth_token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      toast.success('Welcome back!')
      router.push('/dashboard')
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  const fillTestAccount = (email: string) => {
    setValue('email', email)
    setValue('password', 'Password123!')
  }

  return (
    <div className="min-h-screen bg-hero-bg flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-secondary">
            <span className="text-sm font-bold text-secondary">BNR</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-heading uppercase tracking-wide">
              National Bank of Rwanda
            </span>
            <span className="text-xs text-secondary">Banki Nkuru Y&apos;u Rwanda</span>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-heading hover:text-secondary">
            Home
          </Link>
          <Link href="/" className="text-sm font-medium text-heading hover:text-secondary">
            Job Openings
          </Link>
          <Link href="/" className="text-sm font-medium text-heading hover:text-secondary">
            Process
          </Link>
          <Link href="/" className="text-sm font-medium text-heading hover:text-secondary">
            Contact Us
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="text-secondary font-medium">
            Log In
          </Button>
          <Button className="bg-transparent border border-secondary text-secondary hover:bg-secondary hover:text-white">
            Create Account
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          {/* Login Card */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-semibold text-heading">
                Welcome Back
              </CardTitle>
              <CardDescription>
                Sign in to access your licensing portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
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
                      {...register('password')}
                      className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-destructive">{errors.password.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Test Accounts Card */}
          <Card className="border border-secondary/30 bg-accent">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-heading">
                Test Accounts
              </CardTitle>
              <CardDescription className="text-xs">
                Click to auto-fill credentials (Password: Password123!)
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs justify-start border-secondary/30 hover:bg-secondary/10"
                onClick={() => fillTestAccount('superadmin@nrb.test')}
              >
                Superadmin
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs justify-start border-secondary/30 hover:bg-secondary/10"
                onClick={() => fillTestAccount('applicant@nrb.test')}
              >
                Applicant
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs justify-start border-secondary/30 hover:bg-secondary/10"
                onClick={() => fillTestAccount('officer@nrb.test')}
              >
                Officer
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs justify-start border-secondary/30 hover:bg-secondary/10"
                onClick={() => fillTestAccount('approver@nrb.test')}
              >
                Approver
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
