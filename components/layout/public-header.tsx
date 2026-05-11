import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

type PublicHeaderProps = {
  active?: 'login' | 'signup'
}

export function PublicHeader({ active }: PublicHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/bnr-logo.svg"
              alt="National Bank of Rwanda"
              width={180}
              height={42}
              className="h-10 w-auto"
              priority
            />
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/#features" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="/#process" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
              How it works
            </Link>
            <Link href="/#contact" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
              Get Started
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant={active === 'login' ? 'secondary' : 'ghost'} asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button variant={active === 'signup' ? 'secondary' : 'default'} asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
