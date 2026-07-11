'use client'

import React, { useState } from 'react'
import { FileIcon, FilePlus, Edit, Trash, Upload, Plus, X, Spinner } from '@/lib/icons'

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
  onClose: () => void
}

export default function MobileFileDrawer({ files, projectId, activeFileId, onFileSelect, onFileCreated, onFileDeleted, onFileUpload, onFileRename, onClose }: Props) {
  const [showNewInput, setShowNewInput] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [uploading, setUploading] = useState(false)

  async function createFile() {
    if (!newFileName.trim()) return
    try {
      const res = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, name: newFileName, type: 'file' }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.id) onFileCreated(data)
      }
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
      if (res.ok) {
        const data = await res.json()
        if (data.id) onFileUpload(data)
      }
    } catch (e) { console.error(e) }
    setUploading(false)
  }

  async function deleteFile(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return
    try {
      const res = await fetch(`/api/files?id=${id}`, { method: 'DELETE' })
      if (!res.ok) return
      onFileDeleted(id)
    } catch (e) { console.error(e) }
  }

  async function submitRename() {
    if (!renamingId || !renameValue.trim()) return
    if (onFileRename) onFileRename(renamingId, renameValue.trim())
    setRenamingId(null)
    setRenameValue('')
  }

  function renderFileIcon(name: string) {
    return <FileIcon name={name} />
  }

  const rootFiles = files.filter((f) => !f.parentId)

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 bg-[var(--panel-bg)] rounded-t-xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)]">
          <span className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>Files</span>
          <div className="flex items-center gap-2">
            <label className="text-sm cursor-pointer hover:text-[var(--accent)] transition p-1">
              {uploading ? <span className="animate-spin inline-block"><Spinner /></span> : <Upload />}
              <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
            <button onClick={() => setShowNewInput(true)} className="p-1 hover:text-[var(--accent)] transition"><Plus /></button>
            <button onClick={onClose} className="p-1" style={{ color: 'var(--foreground-muted)' }}><X /></button>
          </div>
        </div>

        <div className="overflow-y-auto p-2">
          {showNewInput && (
            <div className="flex items-center gap-2 px-3 py-2">
              <input value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') createFile(); if (e.key === 'Escape') { setShowNewInput(false); setNewFileName('') } }}
                placeholder="file.js"
                className="flex-1 border rounded px-3 py-2 text-sm outline-none"
                style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border-color)', color: 'var(--foreground)' }}
                autoFocus />
              <button onClick={createFile} className="text-sm" style={{ color: 'var(--accent)' }}>Add</button>
            </div>
          )}

          {rootFiles.length === 0 && (
            <div className="text-center py-8 text-sm" style={{ color: 'var(--foreground-muted)' }}>
              No files yet. Tap + to create or upload a ZIP.
            </div>
          )}

          {rootFiles.map((file) => {
            const isRenaming = renamingId === file.id
            return (
              <div key={file.id}
                className={`flex items-center justify-between px-3 py-3 rounded-lg cursor-pointer text-sm ${
                  file.id === activeFileId ? 'bg-[var(--accent)]/10' : 'hover:bg-[var(--file-hover)]'
                }`}
                style={file.id === activeFileId ? { color: 'var(--accent)' } : {}}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0" onClick={() => onFileSelect(file.id)}>
                  {isRenaming ? (
                    <input value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') submitRename()
                        if (e.key === 'Escape') setRenamingId(null)
                      }}
                      onBlur={submitRename}
                      className="flex-1 bg-transparent border-b text-sm outline-none px-0.5"
                      style={{ borderColor: 'var(--accent)', color: 'var(--foreground)' }}
                      autoFocus onClick={(e) => e.stopPropagation()} />
                  ) : (
                    <>
                      <span className="flex items-center">{renderFileIcon(file.name)}</span>
                      <span className="truncate">{file.name}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!isRenaming && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setRenamingId(file.id); setRenameValue(file.name) }}
                      className="p-1 hover:text-[var(--accent)] transition" title="Rename">
                      <Edit />
                    </button>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); deleteFile(file.id, file.name) }}
                    className="p-1 hover:text-red-400 transition" title="Delete">
                    <X />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
