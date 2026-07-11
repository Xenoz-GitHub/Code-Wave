'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth'
import { useTheme } from '@/providers/ThemeProvider'
import FileTree from '@/components/FileManager/FileTree'
import CodeEditor from '@/components/Editor/CodeEditor'
import OutputPanel from '@/components/Output/OutputPanel'
import LivePreview from '@/components/Preview/LivePreview'
import MobileFileDrawer from '@/components/FileManager/MobileFileDrawer'
import CollaborationOverlay from '@/components/Collaboration/CollaborationOverlay'
import { getLanguageFromFileName } from '@/lib/utils'
import { ChevronLeft, ArrowLeft, Sun, Moon, Download, Upload, Folder, FilePlus, Eye, Play, Users, Plus, X, FileIcon, Spinner } from '@/lib/icons'

export const dynamic = 'force-dynamic'

type File = {
  id: string
  name: string
  content: string
  type: string
  parentId: string | null
  projectId: string
}

type CollabUser = {
  id: string
  name: string
  color: string
}

type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error'

const LS_PREFIX = 'codewave-draft-'

function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout> | null = null
  const debounced = (...args: any[]) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
  return debounced as T
}

function useIsDesktop() {
  const [desktop, setDesktop] = useState(true)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    setDesktop(mq.matches)
    const handler = (e: MediaQueryListEvent) => setDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return desktop
}

export default function EditorPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const isDesktop = useIsDesktop()
  const [user, setUser] = useState<any>(null)
  const [project, setProject] = useState<any>(null)
  const [files, setFiles] = useState<File[]>([])
  const [activeFileId, setActiveFileId] = useState<string | null>(null)
  const [openTabs, setOpenTabs] = useState<string[]>([])
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showMobileDrawer, setShowMobileDrawer] = useState(false)
  const [previewCode, setPreviewCode] = useState('')
  const [previewLanguage, setPreviewLanguage] = useState('')
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [collabUsers, setCollabUsers] = useState<CollabUser[]>([])
  const [showCollab, setShowCollab] = useState(false)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved')
  const importRef = useRef<HTMLInputElement>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const contentBackupRef = useRef<Map<string, string>>(new Map())

  // Track unsaved changes for beforeunload
  const hasUnsavedRef = useRef(false)
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsavedRef.current) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [])

  // Load user and project
  useEffect(() => {
    authClient.getSession().then((res: any) => {
      const u = res?.data?.user
      if (!u) { router.push('/auth'); return }
      setUser(u)
      loadProject()
    }).catch(() => router.push('/auth'))
  }, [id, router])

  async function loadProject() {
    try {
      const [projectRes, filesRes] = await Promise.all([
        fetch(`/api/projects?id=${id}`).then(r => r.json()).catch(() => null),
        fetch(`/api/files?projectId=${id}`).then(r => r.json()),
      ])
      if (projectRes?.error || !Array.isArray(filesRes)) {
        router.push('/dashboard')
        return
      }
      setProject(projectRes)
      setFiles(filesRes)

      // Try to restore from localStorage backup
      const lsKey = `${LS_PREFIX}${id}`
      try {
        const backup = localStorage.getItem(lsKey)
        if (backup) {
          const parsed = JSON.parse(backup) as Record<string, string>
          filesRes.forEach((f: File) => {
            if (parsed[f.id] && parsed[f.id] !== f.content) {
              f.content = parsed[f.id]
            }
          })
          localStorage.removeItem(lsKey)
        }
      } catch {}

      if (filesRes.length > 0) {
        setActiveFileId(filesRes[0].id)
        setOpenTabs([filesRes[0].id])
      }
    } catch (e) {
      console.error(e)
      router.push('/dashboard')
    }
  }

  // Collaboration WebSocket
  useEffect(() => {
    if (!user || !project) return
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || `ws://localhost:3001`
    let ws: WebSocket | null = null
    try {
      ws = new WebSocket(`${wsUrl}?projectId=${id}&userId=${user.id}&userName=${user.name || user.email}`)
      wsRef.current = ws
      ws.onopen = () => console.log('Collaboration connected')
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'users') setCollabUsers(data.users)
          else if (data.type === 'file-update' && data.fileId !== activeFileId) {
            setFiles((prev) => prev.map((f) => f.id === data.fileId ? { ...f, content: data.content } : f))
          } else if (data.type === 'file-created') setFiles((prev) => [...prev, data.file])
          else if (data.type === 'file-deleted') setFiles((prev) => prev.filter((f) => f.id !== data.fileId))
        } catch {}
      }
      ws.onerror = () => { wsRef.current = null }
      ws.onclose = () => { wsRef.current = null }
    } catch { wsRef.current = null }
    return () => { ws?.close(); wsRef.current = null }
  }, [user, project, id])

  const activeFile = files.find((f) => f.id === activeFileId)

  function handleFileSelect(fileId: string) {
    const file = files.find((f) => f.id === fileId)
    if (!file || file.type === 'folder') return
    setActiveFileId(fileId)
    if (!openTabs.includes(fileId)) {
      setOpenTabs([...openTabs, fileId])
    }
  }

  function handleTabClose(fileId: string, e: React.MouseEvent) {
    e.stopPropagation()
    const newTabs = openTabs.filter((id) => id !== fileId)
    setOpenTabs(newTabs)
    if (activeFileId === fileId) {
      setActiveFileId(newTabs[newTabs.length - 1] || null)
    }
  }

  // Save to server with debounce
  const saveToServer = useCallback(
    debounce(async (fileId: string, content: string) => {
      try {
        const res = await fetch('/api/files', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: fileId, content }),
        })
        if (res.ok) {
          setSaveStatus('saved')
          hasUnsavedRef.current = false
          contentBackupRef.current.delete(fileId)
        } else {
          setSaveStatus('error')
        }
      } catch {
        setSaveStatus('error')
      }
    }, 1200),
    []
  )

  function handleEditorChange(value: string | undefined) {
    if (!activeFileId || value === undefined) return
    setSaveStatus('unsaved')
    hasUnsavedRef.current = true

    setFiles((prev) =>
      prev.map((f) => (f.id === activeFileId ? { ...f, content: value } : f))
    )

    // LocalStorage backup
    try {
      const lsKey = `${LS_PREFIX}${id}`
      const backup = JSON.parse(localStorage.getItem(lsKey) || '{}')
      backup[activeFileId] = value
      localStorage.setItem(lsKey, JSON.stringify(backup))
    } catch {}

    // Auto-save to server
    setSaveStatus('saving')
    saveToServer(activeFileId, value)

    // Broadcast to collaborators
    broadcastChange(activeFileId, value)
  }

  function broadcastChange(fileId: string, content: string) {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'file-update', fileId, content }))
    }
  }

  async function handleRun() {
    if (!activeFile) return
    setIsRunning(true)
    setOutput('Running...\n')
    try {
      const lang = getLanguageFromFileName(activeFile.name)
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: lang, code: activeFile.content }),
      })
      const result = await res.json()
      if (result.error) {
        setOutput(`Error: ${result.error}`)
      } else {
        setOutput(result.output || result.stderr || '(no output)')
      }
    } catch {
      setOutput('Failed to execute code')
    }
    setIsRunning(false)
  }

  function handlePreview() {
    if (!activeFile) return
    setShowPreview(!showPreview)
  }

  // Keep preview content in sync with active file
  useEffect(() => {
    if (showPreview && activeFile) {
      setPreviewCode(activeFile.content)
      setPreviewLanguage(getLanguageFromFileName(activeFile.name))
    }
  }, [showPreview, activeFile?.content, activeFile?.name])

  async function handleExport() {
    setExporting(true)
    try {
      const res = await fetch(`/api/export?projectId=${id}`)
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${project?.name || 'project'}.zip`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) { console.error(e) }
    setExporting(false)
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    const formData = new FormData()
    formData.append('projectId', id)
    formData.append('file', file)
    try {
      const res = await fetch('/api/import', { method: 'POST', body: formData })
      const data = await res.json()
      if (Array.isArray(data)) {
        setFiles(data)
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'import', files: data }))
        }
      }
    } catch (e) { console.error(e) }
    setImporting(false)
    if (importRef.current) importRef.current.value = ''
  }

  async function handleFileCreated(file: File) {
    setFiles((prev) => [...prev, file])
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'file-created', file }))
    }
  }

  async function handleFileDeleted(fileId: string) {
    setFiles((prev) => prev.filter((f) => f.id !== fileId))
    if (activeFileId === fileId) {
      const newTabs = openTabs.filter((id) => id !== fileId)
      setOpenTabs(newTabs)
      setActiveFileId(newTabs[newTabs.length - 1] || null)
    }
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'file-deleted', fileId }))
    }
  }

  async function handleFileUpload(file: File) {
    setFiles((prev) => [...prev, file])
  }

  async function handleFileRename(fileId: string, newName: string) {
    try {
      await fetch('/api/files', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: fileId, name: newName }),
      })
      setFiles((prev) => prev.map((f) => f.id === fileId ? { ...f, name: newName } : f))
    } catch (e) { console.error(e) }
  }

  const saveStatusLabel: Record<SaveStatus, string> = {
    saved: 'Saved',
    saving: 'Saving...',
    unsaved: 'Unsaved',
    error: 'Save failed',
  }
  const saveStatusColor: Record<SaveStatus, string> = {
    saved: '#22c55e',
    saving: '#eab308',
    unsaved: '#f97316',
    error: '#ef4444',
  }

  return (
    <div className="h-full flex flex-col bg-[var(--background)]">
      {/* ─── HEADER ─── */}
      <header className="flex items-center justify-between px-2 sm:px-3 py-1.5 border-b border-[var(--border-color)] bg-[var(--panel-bg)] shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-1 hover:text-[var(--accent)] transition shrink-0"
            title="Back to Dashboard"
          ><ArrowLeft /></button>
          <span className="text-sm font-medium truncate max-w-[100px] sm:max-w-[200px]">
            {project?.name || 'Loading...'}
          </span>
          <span className="text-xs text-[var(--foreground-muted)] px-1.5 py-0.5 rounded bg-[var(--background)] hidden sm:inline">
            {project?.language}
          </span>
          {/* Save status */}
          {activeFile && (
            <span className="hidden sm:flex items-center gap-1 text-xs" style={{ color: saveStatusColor[saveStatus] }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: saveStatusColor[saveStatus], display: 'inline-block' }} />
              {saveStatusLabel[saveStatus]}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {collabUsers.length > 0 && (
            <button
              onClick={() => setShowCollab(!showCollab)}
              className="p-1 hover:text-[var(--accent)] transition relative flex items-center gap-1"
              title={`${collabUsers.length} connected`}
            >
              <Users /> <span className="text-xs">{collabUsers.length}</span>
            </button>
          )}
          <button onClick={toggleTheme} className="p-1.5 hover:text-[var(--accent)] transition" title="Toggle Theme">
            {theme === 'dark' ? <Sun /> : <Moon />}
          </button>
          <button onClick={handleExport} disabled={exporting}
            className="p-1.5 hover:text-[var(--accent)] transition disabled:opacity-50" title="Export as ZIP">
            {exporting ? <Spinner /> : <Download />}
          </button>
          <input ref={importRef} type="file" accept=".zip" className="hidden" onChange={handleImport} />
          <button onClick={() => importRef.current?.click()} disabled={importing}
            className="p-1.5 hover:text-[var(--accent)] transition disabled:opacity-50" title="Import ZIP">
            {importing ? <Spinner /> : <Upload />}
          </button>
          {!isDesktop && (
            <button onClick={() => setShowMobileDrawer(true)}
              className="md:hidden p-1.5 hover:text-[var(--accent)] transition" title="Files">
              <Folder />
            </button>
          )}
          <button onClick={handlePreview}
            className={`p-1.5 rounded transition ${showPreview ? 'text-[var(--accent)] bg-[var(--accent)]/10' : 'hover:text-[var(--accent)]'}`}
            title="Live Preview">
            <Eye />
          </button>
          <button onClick={handleRun} disabled={isRunning || !activeFile}
            className="px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-1">
            {isRunning ? <><Spinner /> Running...</> : <><Play /> Run</>}
          </button>
        </div>
      </header>

      {/* Collaboration overlay */}
      {showCollab && <CollaborationOverlay users={collabUsers} onClose={() => setShowCollab(false)} />}

      {/* ─── MAIN LAYOUT ─── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* File Tree (desktop) */}
        {isDesktop && (
          <div className="w-56 border-r border-[var(--border-color)] bg-[var(--sidebar-bg)] shrink-0 flex flex-col">
            <FileTree
              files={files}
              projectId={id}
              activeFileId={activeFileId}
              onFileSelect={handleFileSelect}
              onFileCreated={handleFileCreated}
              onFileDeleted={handleFileDeleted}
              onFileUpload={handleFileUpload}
              onFileRename={handleFileRename}
            />
          </div>
        )}

        {/* Editor + Preview */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Tabs */}
          {openTabs.length > 0 && (
            <div className="flex items-center bg-[var(--panel-bg)] border-b border-[var(--border-color)] overflow-x-auto shrink-0 scrollbar-thin">
              {openTabs.map((fileId) => {
                const f = files.find((ff) => ff.id === fileId)
                if (!f) return null
                const isActive = fileId === activeFileId
                return (
                  <div key={fileId}
                    onClick={() => setActiveFileId(fileId)}
                    className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs cursor-pointer border-r border-[var(--border-color)] whitespace-nowrap shrink-0 ${
                      isActive ? 'bg-[var(--tab-active-bg)] text-[var(--accent)]' : 'bg-[var(--tab-inactive-bg)] hover:bg-[var(--file-hover)]'
                    }`}>
                    <span className={`w-2 h-2 rounded-full ${getFileIconColor(f.name)}`} />
                    <span className="truncate max-w-[80px] sm:max-w-[120px]">{f.name}</span>
                    <button onClick={(e) => handleTabClose(fileId, e)} className="ml-1 p-0.5 hover:text-red-400 transition shrink-0"><X /></button>
                  </div>
                )
              })}
            </div>
          )}

          {/* Editor + Preview split */}
          <div className="flex-1 flex overflow-hidden">
            <div className={`flex-1 overflow-hidden ${showPreview ? 'w-1/2' : 'w-full'}`}>
              {activeFile ? (
                (activeFile.type === 'image' || /\.(png|jpg|jpeg|gif|svg|webp)$/i.test(activeFile.name)) ? (
                  <div className="h-full flex items-center justify-center p-4 bg-[var(--editor-bg)]">
                    <img
                      src={`/api/files/${activeFile.id}`}
                      alt={activeFile.name}
                      className="max-w-full max-h-full object-contain rounded"
                      style={{ maxWidth: '100%', maxHeight: '100%' }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  </div>
                ) : (
                  <CodeEditor file={activeFile} onChange={handleEditorChange} />
                )
              ) : (
                <div className="h-full flex items-center justify-center text-sm" style={{ color: 'var(--foreground-muted)' }}>
                  Select a file to start editing
                </div>
              )}
            </div>
            {showPreview && (
              <div className="w-1/2 border-l border-[var(--border-color)] min-w-0">
                <LivePreview code={previewCode} language={previewLanguage} />
              </div>
            )}
          </div>

          {/* Output */}
          <OutputPanel output={output} />
        </div>
      </div>

      {/* Mobile file drawer */}
      {showMobileDrawer && !isDesktop && (
        <MobileFileDrawer
          files={files}
          projectId={id}
          activeFileId={activeFileId}
          onFileSelect={(fileId) => { handleFileSelect(fileId); setShowMobileDrawer(false) }}
          onFileCreated={handleFileCreated}
          onFileDeleted={handleFileDeleted}
          onFileUpload={handleFileUpload}
          onFileRename={handleFileRename}
          onClose={() => setShowMobileDrawer(false)}
        />
      )}
    </div>
  )
}

function getFileIconColor(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase()
  const colors: Record<string, string> = {
    js: 'bg-yellow-400', ts: 'bg-blue-400', jsx: 'bg-cyan-400', tsx: 'bg-blue-400',
    html: 'bg-orange-400', css: 'bg-purple-400', json: 'bg-green-400',
    py: 'bg-yellow-600', rs: 'bg-orange-600', go: 'bg-cyan-400',
    cpp: 'bg-pink-400', c: 'bg-blue-400', md: 'bg-gray-400',
    svg: 'bg-yellow-300', png: 'bg-pink-300', jpg: 'bg-pink-300', jpeg: 'bg-pink-300', gif: 'bg-purple-300',
  }
  return colors[ext || ''] || 'bg-gray-400'
}
