'use client'

import dynamic from 'next/dynamic'

const AuthView = dynamic(
  () => import('@neondatabase/neon-js/auth/react').then((mod) => ({ default: mod.AuthView })),
  { ssr: false }
)

export default function AuthPage() {
  return (
    <div className="h-full flex items-center justify-center bg-[var(--background)]" style={{ minHeight: '100dvh' }}>
      <div className="w-full max-w-sm p-6">
        <div className="text-center mb-8">
          <div style={{ width: 48, height: 48, margin: '0 auto 16px', position: 'relative' }}>
            <svg viewBox="0 0 40 40" style={{ width: 48, height: 48 }}>
              <rect width="40" height="40" rx="10" fill="var(--accent)" />
              <path d="M14 14L9 20L14 26" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <path d="M26 14L31 20L26 26" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>CodeWave</h1>
          <p className="text-sm mt-1.5" style={{ color: 'var(--foreground-muted)' }}>Sign in to your account</p>
        </div>
        <div className="rounded-xl border p-6" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
          <AuthView />
        </div>
        <p className="text-xs text-center mt-4" style={{ color: 'var(--foreground-muted)' }}>
          By continuing, you agree to the Terms of Service
        </p>
      </div>
    </div>
  )
}
