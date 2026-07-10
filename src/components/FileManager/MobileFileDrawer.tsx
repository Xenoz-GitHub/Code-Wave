'use client'

import { useState, useRef } from 'react'

type File = {
  id: string
  name: string
  content: string
  type: string
  parentId: string | null
  projectId: string
}

type Props = {
  files: File[]
  projectId: string
  activeFileId: string | null
  onFileSelect: (id: string) => void
  onFileCreated: (file: File) => void
  onFileDeleted: (id: string) => void
  onFileUpload: (file: File) => void
  onClose: () => void
}

export default function MobileFileDrawer({ files, projectId, activeFileId, onFileSelect, onFileCreated, onFileDeleted, onFileUpload, onClose }: Props) {
  const [showNewInput, setShowNewInput] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const [uploading, setUploading] = useState(false)

  async function createFile() {
    if (!newFileName.trim()) return
    try {
      const res = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, name: newFileName, type: 'file' }),
      })
      const data = await res.json()
      if (data.id) onFileCreated(data)
    } catch (e) { console.error(e) }
    setNewFileName('')
    setShowNewInput(false)
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('projectId', projectId)
    formData.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.id) onFileUpload(data)
    } catch (e) { console.error(e) }
    setUploading(false)
  }

  async function deleteFile(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return
    await fetch(`/api/files?id=${id}`, { method: 'DELETE' })
    onFileDeleted(id)
  }

  function getFileIcon(name: string): string {
    const ext = name.split('.').pop()?.toLowerCase()
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext || '')) return '🖼️'
    const icons: Record<string, string> = {
      js: '📄', ts: '📘', html: '🌐', css: '🎨', json: '📋', py: '🐍',
      rs: '🦀', go: '🔷', md: '📝',
    }
    return icons[ext || ''] || '📄'
  }

  const rootFiles = files.filter((f) => !f.parentId)

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 bg-[var(--panel-bg)] rounded-t-xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)]">
          <span className="font-semibold text-sm">Files</span>
          <div className="flex items-center gap-2">
            <label className="text-sm cursor-pointer hover:text-[var(--accent)] transition">
              {uploading ? '⏳' : '📤'}
              <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
            <button onClick={() => setShowNewInput(true)} className="text-sm hover:text-[var(--accent)] transition">+</button>
            <button onClick={onClose} className="text-sm text-gray-400 hover:text-white transition">✕</button>
          </div>
        </div>

        <div className="overflow-y-auto p-2">
          {showNewInput && (
            <div className="flex items-center gap-2 px-3 py-2">
              <input
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') createFile(); if (e.key === 'Escape') { setShowNewInput(false); setNewFileName('') } }}
                placeholder="file.js"
                className="flex-1 bg-[var(--background)] border border-[var(--border-color)] rounded px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
                autoFocus
              />
              <button onClick={createFile} className="text-sm text-[var(--accent)]">Add</button>
            </div>
          )}

          {rootFiles.length === 0 && (
            <div className="text-center py-8 text-sm text-gray-500">
              No files yet. Tap + to create or 📤 to upload.
            </div>
          )}

          {rootFiles.map((file) => (
            <div
              key={file.id}
              onClick={() => onFileSelect(file.id)}
              className={`flex items-center justify-between px-3 py-3 rounded-lg cursor-pointer text-sm ${
                file.id === activeFileId ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'hover:bg-[var(--file-hover)]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{getFileIcon(file.name)}</span>
                <span>{file.name}</span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); deleteFile(file.id, file.name) }}
                className="p-1 text-gray-400 hover:text-red-400 transition"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
