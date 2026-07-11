'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

const AuthView = dynamic(
  () => import('@neondatabase/neon-js/auth/react').then((mod) => ({ default: mod.AuthView })),
  { ssr: false }
)

export default function AuthPage() {
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="h-full flex items-center justify-center bg-[var(--background)]" style={{ minHeight: '100dvh' }}>
      <div className="w-full max-w-md p-6">
        <div className="text-center mb-6">
          {/* Logo */}
          <svg viewBox="0 0 40 40" style={{ width: 40, height: 40, margin: '0 auto 12px' }}>
            <rect width="40" height="40" rx="10" fill="#be3056" />
            <path d="M14 14L9 20L14 26" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M26 14L31 20L26 26" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.5" />
          </svg>
          <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>CodeWave</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>Sign in to start coding</p>
        </div>
        <div className="rounded-lg border p-6" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--panel-bg)' }}>
          <AuthView />
        </div>
        {error && (
          <div className="mt-3 p-3 rounded-lg text-xs" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
