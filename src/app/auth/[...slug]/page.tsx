'use client'

import dynamic from 'next/dynamic'

const AuthView = dynamic(
  () => import('@neondatabase/neon-js/auth/react').then((mod) => ({ default: mod.AuthView })),
  { ssr: false }
)

export default function AuthSlugPage() {
  return (
    <div className="h-full flex items-center justify-center bg-[var(--background)]">
      <div className="w-full max-w-md p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold" style={{ color: '#be3056' }}>CodeWave</h1>
          <p className="text-sm mt-1" style={{ color: '#9a8a8e' }}>Sign in to start coding</p>
        </div>
        <div className="rounded-lg border p-6" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--panel-bg)' }}>
          <AuthView />
        </div>
      </div>
    </div>
  )
}
