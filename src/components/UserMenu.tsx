'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth'

export default function UserMenu({ user }: { user: any }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-sm font-bold hover:opacity-90 transition"
      >
        {user?.name?.[0] || user?.email?.[0] || '?'}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-10 z-50 w-56 rounded-lg border border-[var(--border-color)] bg-[var(--panel-bg)] shadow-xl"
          >
            <div className="px-4 py-3 border-b border-[var(--border-color)]">
              <div className="text-sm font-medium truncate">{user?.name || 'User'}</div>
              <div className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{user?.email}</div>
            </div>
            <div className="p-1">
              <button
                onClick={() => { setOpen(false); router.push('/account') }}
                className="w-full text-left px-3 py-2 text-sm rounded hover:bg-[var(--accent)]/10 transition"
              >
                Account Settings
              </button>
              <button
                onClick={() => { setOpen(false); router.push('/dashboard') }}
                className="w-full text-left px-3 py-2 text-sm rounded hover:bg-[var(--accent)]/10 transition"
              >
                Dashboard
              </button>
            </div>
            <div className="border-t border-[var(--border-color)] p-1">
              <button
                onClick={async () => { await authClient.signOut(); router.push('/auth') }}
                className="w-full text-left px-3 py-2 text-sm rounded hover:bg-red-400/10 transition"
                style={{ color: '#ef4444' }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
