'use client'

import { AccountView } from '@neondatabase/neon-js/auth/react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default function AccountPage() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const user = session?.user || null

  if (isPending) return <div className="h-full flex items-center justify-center bg-[var(--background)]"><div className="animate-spin w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full" /></div>

  if (!user) { router.push('/auth'); return null }

  return (
    <div className="h-full flex bg-[var(--background)]">
      <aside className="w-64 border-r border-[var(--border-color)] p-4 flex flex-col">
        <button onClick={() => router.push('/dashboard')} className="text-left mb-6 text-sm hover:text-[var(--accent)] transition">
          ← Back to Dashboard
        </button>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center text-lg font-bold">
            {user?.name?.[0] || user?.email?.[0] || '?'}
          </div>
          <div>
            <div className="font-medium text-sm">{user?.name || 'User'}</div>
            <div className="text-xs text-gray-400">{user?.email}</div>
          </div>
        </div>
        <div className="mt-auto">
          <button onClick={async () => { await authClient.signOut(); router.push('/auth') }} className="w-full px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 rounded transition">
            Sign Out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-6">
        <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
        <AccountView />
      </main>
    </div>
  )
}
