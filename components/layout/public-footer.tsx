import Image from 'next/image'
import Link from 'next/link'

export function PublicFooter() {
  return (
    <footer id="contact" className="bg-muted/50 border-t border-border py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Image
              src="/bnr-logo.svg"
              alt="National Bank of Rwanda"
              width={160}
              height={37}
              className="h-9 w-auto mb-4"
            />
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/login" className="hover:text-foreground">Sign In</Link></li>
              <li><Link href="/#features" className="hover:text-foreground">Features</Link></li>
              <li><Link href="/#process" className="hover:text-foreground">How it works</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>KN 6 Ave, Kigali</li>
              <li>info@bnr.rw</li>
              <li>+250 788 890 890</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} National Bank of Rwanda. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
