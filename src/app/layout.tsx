'use client'

import { NeonAuthUIProvider } from '@neondatabase/neon-js/auth/react'
import '@neondatabase/neon-js/ui/css'
import { authClient } from '@/lib/auth'
import { ThemeProvider } from '@/providers/ThemeProvider'
import './globals.css'
import { useEffect } from 'react'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#007acc" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CodeWave" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="h-full">
        <NeonAuthUIProvider emailOTP authClient={authClient}>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </NeonAuthUIProvider>
      </body>
    </html>
  )
}
