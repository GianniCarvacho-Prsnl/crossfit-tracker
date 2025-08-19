import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/navigation/Navigation'
import ErrorBoundary from '@/components/error/ErrorBoundary'
import { FeedbackProvider } from '@/components/feedback/FeedbackProvider'
import FeedbackModal from '@/components/feedback/FeedbackModal'
import Footer from '@/components/Footer'
import LayoutContent from './LayoutContent'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap', // Optimize font loading
  preload: true,
})

export const metadata: Metadata = {
  title: 'CrossFit Tracker',
  description: 'Track your CrossFit personal records and 1RM calculations',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CrossFit Tracker',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'CrossFit Tracker',
    title: 'CrossFit Tracker',
    description: 'Track your CrossFit personal records and 1RM calculations',
  },
  twitter: {
    card: 'summary',
    title: 'CrossFit Tracker',
    description: 'Track your CrossFit personal records and 1RM calculations',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#2563eb',
  colorScheme: 'light',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        {/* Preload critical resources */}
        <link rel="preload" href="/icon.svg" as="image" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* PWA meta tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CrossFit Tracker" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <FeedbackProvider>
            <LayoutContent>
              {children}
            </LayoutContent>
          </FeedbackProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}