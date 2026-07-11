'use client'

import { useState, useRef } from 'react'
import { useDropzone } from 'react-dropzone'

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
  onFileRename?: (id: string, newName: string) => void
}

export default function FileTree({ files, projectId, activeFileId, onFileSelect, onFileCreated, onFileDeleted, onFileUpload, onFileRename }: Props) {
  const [showNewInput, setShowNewInput] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      for (const f of acceptedFiles) {
        const formData = new FormData()
        formData.append('projectId', projectId)
        formData.append('file', f)
        try {
          const res = await fetch('/api/upload', { method: 'POST', body: formData })
          const data = await res.json()
          if (data.id) onFileUpload(data)
        } catch (e) { console.error('Upload failed:', e) }
      }
    },
  })

  async function createFile() {
    if (!newFileName.trim()) return
    try {
      const res = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, name: newFileName, type: 'file' }),
      })
      const data = await res.json()
      if (data.id) {
        onFileCreated(data)
        onFileSelect(data.id)
      }
    } catch (e) { console.error(e) }
    setNewFileName('')
    setShowNewInput(false)
  }

  async function deleteFile(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return
    await fetch(`/api/files?id=${id}`, { method: 'DELETE' })
    onFileDeleted(id)
  }

  function startRename(id: string, name: string) {
    setRenamingId(id)
    setRenameValue(name)
  }

  async function submitRename() {
    if (!renamingId || !renameValue.trim()) return
    if (onFileRename) onFileRename(renamingId, renameValue.trim())
    setRenamingId(null)
    setRenameValue('')
  }

  function getFileIcon(name: string): string {
    const ext = name.split('.').pop()?.toLowerCase()
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext || '')) return '🖼️'
    const icons: Record<string, string> = {
      js: '📄', ts: '📘', jsx: '⚛️', tsx: '⚛️',
      html: '🌐', css: '🎨', json: '📋', py: '🐍',
      rs: '🦀', go: '🔷', cpp: '⚡', c: '⚡',
      md: '📝', svg: '🖼️', sql: '🗄️', yaml: '📋', yml: '📋', sh: '💻', bash: '💻',
    }
    return icons[ext || ''] || '📄'
  }

  const rootFiles = files.filter((f) => !f.parentId)

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border-color)]">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>Files</span>
        <div className="flex gap-1">
          <button onClick={() => { setShowNewInput(true); setTimeout(() => inputRef.current?.focus(), 50) }}
            className="p-0.5 text-xs hover:text-[var(--accent)] transition" title="New File">+</button>
        </div>
      </div>

      <div {...getRootProps()} className={`flex-1 overflow-y-auto p-1 relative ${isDragActive ? 'bg-[var(--accent)]/10' : ''}`}>
        <input {...getInputProps()} />

        {showNewInput && (
          <div className="flex items-center gap-1 px-2 py-1">
            <span className="text-xs">📄</span>
            <input ref={inputRef} value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') createFile()
                if (e.key === 'Escape') { setShowNewInput(false); setNewFileName('') }
              }}
              onBlur={() => { if (!newFileName.trim()) { setShowNewInput(false) } }}
              placeholder="file.js"
              className="flex-1 bg-transparent text-xs border-b outline-none px-1" style={{ borderColor: 'var(--accent)', color: 'var(--foreground)' }} autoFocus />
          </div>
        )}

        {rootFiles.length === 0 && !isDragActive && (
          <div className="text-xs text-center py-8 px-2" style={{ color: 'var(--foreground-muted)' }}>
            No files yet<br />Drop files here or click + to create
          </div>
        )}

        {rootFiles.map((file) => (
          <FileItem
            key={file.id}
            file={file}
            isActive={file.id === activeFileId}
            isRenaming={renamingId === file.id}
            renameValue={renameValue}
            onSelect={() => onFileSelect(file.id)}
            onDelete={() => deleteFile(file.id, file.name)}
            onRename={() => startRename(file.id, file.name)}
            onRenameChange={(v) => setRenameValue(v)}
            onRenameSubmit={submitRename}
            onRenameCancel={() => setRenamingId(null)}
            getIcon={getFileIcon}
          />
        ))}

        {/* Drag overlay */}
        {isDragActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--accent)]/20 rounded-lg pointer-events-none z-10">
            <p className="text-sm font-medium" style={{ color: 'var(--accent)' }}>Drop files to upload</p>
          </div>
        )}
      </div>
    </div>
  )
}

function FileItem({ file, isActive, isRenaming, renameValue, onSelect, onDelete, onRename, onRenameChange, onRenameSubmit, onRenameCancel, getIcon }: {
  file: File
  isActive: boolean
  isRenaming: boolean
  renameValue: string
  onSelect: () => void
  onDelete: () => void
  onRename: () => void
  onRenameChange: (v: string) => void
  onRenameSubmit: () => void
  onRenameCancel: () => void
  getIcon: (name: string) => string
}) {
  const [showActions, setShowActions] = useState(false)

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer text-xs group ${
        isActive ? 'bg-[var(--file-active)]' : 'hover:bg-[var(--file-hover)]'
      }`}
      style={isActive ? { color: 'var(--accent)' } : {}}
    >
      <div className="flex items-center gap-1.5 truncate flex-1 min-w-0">
        {isRenaming ? (
          <input value={renameValue}
            onChange={(e) => onRenameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onRenameSubmit()
              if (e.key === 'Escape') onRenameCancel()
            }}
            onBlur={onRenameSubmit}
            className="w-full bg-transparent text-xs border-b outline-none px-0.5"
            style={{ borderColor: 'var(--accent)', color: 'var(--foreground)' }}
            autoFocus onClick={(e) => e.stopPropagation()} />
        ) : (
          <>
            <span>{getIcon(file.name)}</span>
            <span className="truncate">{file.name}</span>
          </>
        )}
      </div>
      {!isRenaming && (showActions || isActive) && file.type !== 'folder' && (
        <div className="flex items-center gap-0.5 shrink-0">
          <button onClick={(e) => { e.stopPropagation(); onRename() }}
            className="p-0.5 opacity-0 group-hover:opacity-100 hover:text-[var(--accent)] transition" title="Rename">✏️</button>
          <button onClick={(e) => { e.stopPropagation(); onDelete() }}
            className="p-0.5 text-gray-400 hover:text-red-400 transition" title="Delete">✕</button>
        </div>
      )}
    </div>
  )
}
