import type { Metadata, Viewport } from 'next'
// import { Geist, Geist_Mono } from 'next/font/google'
import { QueryProvider } from '@/lib/query-provider'
import { Toaster } from '@/components/ui/sonner'
import './globals.css' // Import global styles

// const _geist = Geist({ subsets: ["latin"] });
// const _geistMono = Geist_Mono({ subsets: ["latin"] });

// Define metadata and viewport for the application
export const metadata: Metadata = {
  title: {
    default: 'Bank Licensing Portal - National Bank of Rwanda',
    template: '%s | BNR Licensing Portal'
  },
  description: 'Bank Licensing & Compliance Portal for the National Bank of Rwanda. Submit, track, and manage banking license applications.',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#7D6B4A',
  width: 'device-width',
  initialScale: 1,
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="font-sans antialiased">
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  )
}
