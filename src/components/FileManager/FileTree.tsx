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
}

export default function FileTree({ files, projectId, activeFileId, onFileSelect, onFileCreated, onFileDeleted, onFileUpload }: Props) {
  const [showNewInput, setShowNewInput] = useState(false)
  const [newFileName, setNewFileName] = useState('')
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
        } catch (e) {
          console.error('Upload failed:', e)
        }
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
    } catch (e) {
      console.error(e)
    }
    setNewFileName('')
    setShowNewInput(false)
  }

  async function deleteFile(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return
    await fetch(`/api/files?id=${id}`, { method: 'DELETE' })
    onFileDeleted(id)
  }

  function getFileIcon(name: string): string {
    const ext = name.split('.').pop()?.toLowerCase()
    const icons: Record<string, string> = {
      js: '📄', ts: '📘', jsx: '⚛️', tsx: '⚛️',
      html: '🌐', css: '🎨', json: '📋', py: '🐍',
      rs: '🦀', go: '🔷', cpp: '⚡', c: '⚡',
      md: '📝', svg: '🖼️', png: '🖼️', jpg: '🖼️', jpeg: '🖼️', gif: '🖼️',
      sql: '🗄️', yaml: '📋', yml: '📋', sh: '💻', bash: '💻',
    }
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext || '')) return '🖼️'
    return icons[ext || ''] || '📄'
  }

  const rootFiles = files.filter((f) => !f.parentId)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border-color)]">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Files</span>
        <div className="flex gap-1">
          <button
            onClick={() => { setShowNewInput(true); setTimeout(() => inputRef.current?.focus(), 50) }}
            className="p-0.5 text-xs hover:text-[var(--accent)] transition"
            title="New File"
          >
            +
          </button>
        </div>
      </div>

      {/* Drop zone */}
      <div {...getRootProps()} className={`flex-1 overflow-y-auto p-1 ${isDragActive ? 'bg-[var(--accent)]/10' : ''}`}>
        <input {...getInputProps()} />

        {showNewInput && (
          <div className="flex items-center gap-1 px-2 py-1">
            <span className="text-xs">📄</span>
            <input
              ref={inputRef}
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') createFile()
                if (e.key === 'Escape') { setShowNewInput(false); setNewFileName('') }
              }}
              onBlur={() => { if (!newFileName.trim()) { setShowNewInput(false) } }}
              placeholder="file.js"
              className="flex-1 bg-transparent text-xs border-b border-[var(--accent)] outline-none px-1"
              autoFocus
            />
          </div>
        )}

        {rootFiles.length === 0 && !isDragActive && (
          <div className="text-xs text-gray-500 text-center py-8 px-2">
            No files yet<br />
            Drop files here or click + to create
          </div>
        )}

        {rootFiles.map((file) => (
          <FileItem
            key={file.id}
            file={file}
            isActive={file.id === activeFileId}
            onSelect={() => onFileSelect(file.id)}
            onDelete={() => deleteFile(file.id, file.name)}
            getIcon={getFileIcon}
          />
        ))}
      </div>

      {isDragActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--accent)]/20 rounded-lg pointer-events-none">
          <p className="text-sm font-medium">Drop files to upload</p>
        </div>
      )}
    </div>
  )
}

function FileItem({ file, isActive, onSelect, onDelete, getIcon }: {
  file: File
  isActive: boolean
  onSelect: () => void
  onDelete: () => void
  getIcon: (name: string) => string
}) {
  const [showActions, setShowActions] = useState(false)

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer text-xs group ${
        isActive ? 'bg-[var(--file-active)] text-[var(--accent)]' : 'hover:bg-[var(--file-hover)]'
      }`}
    >
      <div className="flex items-center gap-1.5 truncate">
        <span>{getIcon(file.name)}</span>
        <span className="truncate">{file.name}</span>
      </div>
      {(showActions || isActive) && file.type !== 'folder' && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="p-0.5 text-gray-400 hover:text-red-400 transition shrink-0"
          title="Delete"
        >
          ✕
        </button>
      )}
    </div>
  )
}
