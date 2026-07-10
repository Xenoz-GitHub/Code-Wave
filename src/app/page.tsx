'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { authClient } from '@/lib/auth'

export default function LandingPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authClient.getUser().then((u: any) => {
      setUser(u)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[var(--background)]">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-[var(--background)]">
      <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-bold text-[var(--accent)]">CodeWave</div>
          <span className="text-sm text-gray-400 hidden sm:inline">Browser IDE</span>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm">{user.email}</span>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-1.5 bg-[var(--accent)] text-white rounded text-sm font-medium hover:opacity-90 transition"
              >
                Dashboard
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => router.push('/auth')}
                className="px-4 py-1.5 text-sm hover:text-[var(--accent)] transition"
              >
                Sign In
              </button>
              <button
                onClick={() => router.push('/auth')}
                className="px-4 py-1.5 bg-[var(--accent)] text-white rounded text-sm font-medium hover:opacity-90 transition"
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-5xl sm:text-7xl font-bold mb-4">
          Code in the{' '}
          <span className="text-[var(--accent)]">Cloud</span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-400 max-w-xl mb-8">
          A powerful browser-based IDE with real-time collaboration, live preview,
          and support for 50+ languages.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => router.push(user ? '/dashboard' : '/auth')}
            className="px-6 py-3 bg-[var(--accent)] text-white rounded-lg font-medium text-lg hover:opacity-90 transition"
          >
            {user ? 'Go to Dashboard' : 'Start Coding Free'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 max-w-3xl w-full">
          {[
            { title: 'Multi-Language', desc: 'Run code in 50+ languages via Piston API' },
            { title: 'Live Preview', desc: 'See HTML/CSS/JS changes in real-time' },
            { title: 'Collaborate', desc: 'Share projects and edit together live' },
          ].map((feature) => (
            <div key={feature.title} className="p-4 rounded-lg border border-[var(--border-color)] bg-[var(--panel-bg)]">
              <h3 className="font-semibold mb-1">{feature.title}</h3>
              <p className="text-sm text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
