'use client'

import dynamic from 'next/dynamic'

const AuthView = dynamic(
  () => import('@neondatabase/neon-js/auth/react').then((mod) => ({ default: mod.AuthView })),
  { ssr: false }
)

export default function AuthPage() {
  return (
    <div className="h-full flex items-center justify-center bg-[var(--background)]">
      <div className="w-full max-w-md p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[var(--accent)]">CodeWave</h1>
          <p className="text-sm text-gray-400 mt-1">Sign in to start coding</p>
        </div>
        <div className="rounded-lg border border-[var(--border-color)] bg-[var(--panel-bg)] p-6">
          <AuthView />
        </div>
      </div>
    </div>
  )
}
