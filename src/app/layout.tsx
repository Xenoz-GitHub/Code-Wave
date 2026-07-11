'use client'

import { NeonAuthUIProvider } from '@neondatabase/neon-js/auth/react'
import { authClient } from '@/lib/auth'
import { ThemeProvider } from '@/providers/ThemeProvider'
import './globals.css'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((reg) => {
        reg.addEventListener('updatefound', () => {
          const newSW = reg.installing
          if (newSW) {
            newSW.addEventListener('statechange', () => {
              if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
                window.location.reload()
              }
            })
          }
        })
      }).catch(() => {})
    }
  }, [])

  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#be3056" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CodeWave" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.svg" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=localStorage.getItem('codewave-theme');document.documentElement.setAttribute('data-theme',t||'dark')}catch(e){}})()`
        }} />
      </head>
      <body className="h-full">
        <NeonAuthUIProvider
          emailOTP
          authClient={authClient}
          navigate={router.push}
          replace={router.replace}
          redirectTo="/dashboard"
        >
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </NeonAuthUIProvider>
      </body>
    </html>
  )
}
