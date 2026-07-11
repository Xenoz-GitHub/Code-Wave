'use client'

import { X } from '@/lib/icons'

type CollabUser = {
  id: string
  name: string
  color: string
}

type Props = {
  users: CollabUser[]
  onClose: () => void
}

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F']

function hashToColor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash) + id.charCodeAt(i)
  return COLORS[Math.abs(hash) % COLORS.length]
}

export default function CollaborationOverlay({ users, onClose }: Props) {
  return (
    <div className="absolute top-10 right-2 z-40 w-64 rounded-lg border border-[var(--border-color)] bg-[var(--panel-bg)] shadow-xl">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border-color)]">
        <span className="text-xs font-semibold">Collaborators ({users.length})</span>
        <button onClick={onClose} className="p-0.5 hover:text-white transition" style={{ color: 'var(--foreground-muted)' }}><X /></button>
      </div>
      <div className="p-2 space-y-1">
        {users.map((u) => (
          <div key={u.id} className="flex items-center gap-2 px-2 py-1.5 rounded text-sm">
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: hashToColor(u.id) }}
            />
            <span className="truncate">{u.name}</span>
          </div>
        ))}
        {users.length === 0 && (
          <p className="text-xs text-gray-500 text-center py-2">No other collaborators</p>
        )}
      </div>
      <div className="px-3 py-2 border-t border-[var(--border-color)] text-xs text-gray-500">
        All edits are synced in real-time
      </div>
    </div>
  )
}
