import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import SmoothScrollProvider from '@/components/motion/SmoothScrollProvider'
import TransitionOverlay from '@/components/motion/TransitionOverlay'

export const metadata: Metadata = {
  title: 'EventGpt — Event-Management Agency Site · Cinematic AI Planner',
  description:
    'Concerts, weddings and parties, planned with AI. Executive producer intelligence uniting stadium acoustics, botanical florals, and unbundled budgets across India.',
  keywords: [
    'EventGpt',
    'AI event planner',
    'wedding planner India',
    'concert sound staging',
    'birthday party planning',
    'luxury event architecture',
    'L-Acoustics K2',
  ],
  authors: [{ name: 'EventGpt / Niora Star' }],
  openGraph: {
    title: 'EventGpt — Event-Management Agency & AI Planner',
    description: 'Concerts, weddings and parties, planned with AI.',
    type: 'website',
  },
  robots: 'index, follow',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0B0A10',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400..700;1,9..40,400..700&family=Instrument+Serif:ital@1&family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased bg-ink-950 text-ivory-50 min-h-screen selection:bg-accent/30 selection:text-white">
        <SmoothScrollProvider>
          <TransitionOverlay />
          <Navbar />
          <main className="min-h-screen flex flex-col">{children}</main>
        </SmoothScrollProvider>

        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#14121C',
              color: '#F6F0E6',
              border: '1px solid #2A2636',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.875rem',
              borderRadius: '16px',
              boxShadow: '0 8px 32px -4px rgba(0,0,0,0.7)',
            },
            success: {
              iconTheme: { primary: '#E8B84A', secondary: '#0B0A10' },
            },
          }}
        />
      </body>
    </html>
  )
}
