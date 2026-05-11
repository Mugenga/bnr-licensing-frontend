import Link from 'next/link'
import Image from 'next/image'
import { Shield, FileText, CheckCircle2, Clock, ArrowRight, Building2, Scale, Users2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PublicHeader } from '@/components/layout/public-header'
import { PublicFooter } from '@/components/layout/public-footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      <section className="relative overflow-hidden bg-gradient-to-br from-sidebar/5 via-background to-primary/5">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
                Bank Licensing & Compliance Portal
              </h1>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="gap-2" asChild>
                  <Link href="/login">
                    Start Application
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#process">Learn More</Link>
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-3xl" />
                <div className="relative bg-card rounded-2xl shadow-2xl border border-border p-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                      <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Commercial Bank License</p>
                        <p className="text-sm text-green-600">Application Approved</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                      <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                        <Scale className="h-6 w-6 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Microfinance License</p>
                        <p className="text-sm text-amber-600">Under Review</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Insurance Company</p>
                        <p className="text-sm text-blue-600">Submitted</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Improved Licensing Process
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card rounded-xl p-8 shadow-sm border border-border hover:shadow-md transition-shadow">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <FileText className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Digital Applications</h3>
            </div>
            <div className="bg-card rounded-xl p-8 shadow-sm border border-border hover:shadow-md transition-shadow">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Clock className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Real-time Tracking</h3>
            </div>
            <div className="bg-card rounded-xl p-8 shadow-sm border border-border hover:shadow-md transition-shadow">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Secure & Compliant</h3>
            </div>
          </div>
        </div>
      </section>

      <section id="process" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Create Application' },
              { step: '02', title: 'Upload Documents' },
              { step: '03', title: 'Review Process' },
              { step: '04', title: 'Final Decision' },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="text-6xl font-bold text-muted/50 mb-4">{item.step}</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-sidebar text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">100+</div>
              <div className="text-white/70">Applications Processed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-white/70">Compliance Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-white/70">Platform Access</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10+</div>
              <div className="text-white/70">Licensed Institutions</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Ready to Start Your Application?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gap-2" asChild>
              <Link href="/signup">
                Create Account
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
