'use client'

import { useState } from 'react'

type Props = {
  output: string
}

export default function OutputPanel({ output }: Props) {
  const [isOpen, setIsOpen] = useState(true)
  const [tab, setTab] = useState<'output' | 'console'>('output')

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="shrink-0 px-4 py-1 text-xs text-gray-400 border-t border-[var(--border-color)] bg-[var(--panel-bg)] hover:text-[var(--accent)] transition"
      >
        ▲ Show Output
      </button>
    )
  }

  return (
    <div className="shrink-0 border-t border-[var(--border-color)] bg-[var(--panel-bg)]" style={{ maxHeight: '30vh' }}>
      <div className="flex items-center justify-between px-3 py-1 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab('output')}
            className={`text-xs px-2 py-0.5 rounded ${tab === 'output' ? 'bg-[var(--accent)] text-white' : 'hover:text-[var(--accent)]'}`}
          >
            Output
          </button>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-xs text-gray-400 hover:text-white transition"
        >
          ▼ Hide
        </button>
      </div>
      <pre className="p-3 text-xs font-mono overflow-y-auto whitespace-pre-wrap text-green-400" style={{ maxHeight: '25vh' }}>
        {output || 'Click "Run" to execute code'}
      </pre>
    </div>
  )
}
