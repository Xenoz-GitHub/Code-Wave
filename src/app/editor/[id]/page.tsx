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

export default function EditorPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
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
  const importRef = useRef<HTMLInputElement>(null)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    authClient.getUser().then((u: any) => {
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
      if (filesRes.length > 0) {
        setActiveFileId(filesRes[0].id)
        setOpenTabs([filesRes[0].id])
      }
    } catch (e) {
      console.error(e)
      router.push('/dashboard')
    }
  }

  useEffect(() => {
    if (!user || !project) return
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || `ws://localhost:3001`
    let ws: WebSocket | null = null

    try {
      ws = new WebSocket(`${wsUrl}?projectId=${id}&userId=${user.id}&userName=${user.name || user.email}`)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('Collaboration connected')
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'users') {
            setCollabUsers(data.users)
          } else if (data.type === 'file-update' && data.fileId !== activeFileId) {
            setFiles((prev) => prev.map((f) => f.id === data.fileId ? { ...f, content: data.content } : f))
          } else if (data.type === 'file-created') {
            setFiles((prev) => [...prev, data.file])
          } else if (data.type === 'file-deleted') {
            setFiles((prev) => prev.filter((f) => f.id !== data.fileId))
          }
        } catch (e) {}
      }

      ws.onerror = () => {
        console.log('Collaboration unavailable (no WebSocket server)')
        wsRef.current = null
      }

      ws.onclose = () => {
        wsRef.current = null
      }
    } catch (e) {
      console.log('Collaboration unavailable')
      wsRef.current = null
    }

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

  function handleEditorChange(value: string | undefined) {
    if (!activeFileId || value === undefined) return
    setFiles((prev) =>
      prev.map((f) => (f.id === activeFileId ? { ...f, content: value } : f))
    )
    saveFileContent(activeFileId, value)
    broadcastChange(activeFileId, value)
  }

  function broadcastChange(fileId: string, content: string) {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'file-update', fileId, content }))
    }
  }

  const saveFileContent = useCallback(
    debounce(async (fileId: string, content: string) => {
      try {
        await fetch('/api/files', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: fileId, content }),
        })
      } catch (e) {
        console.error('Auto-save failed:', e)
      }
    }, 1000),
    []
  )

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
    } catch (e) {
      setOutput('Failed to execute code')
    }
    setIsRunning(false)
  }

  function handlePreview() {
    if (!activeFile) return
    setPreviewCode(activeFile.content)
    setPreviewLanguage(getLanguageFromFileName(activeFile.name))
    setShowPreview(!showPreview)
  }

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
    } catch (e) {
      console.error(e)
    }
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

  function debounce<T extends (...args: any[]) => any>(fn: T, delay: number) {
    let timer: NodeJS.Timeout
    return (...args: Parameters<T>) => {
      clearTimeout(timer)
      timer = setTimeout(() => fn(...args), delay)
    }
  }

  return (
    <div className="h-full flex flex-col bg-[var(--background)]">
      <header className="flex items-center justify-between px-3 py-1.5 border-b border-[var(--border-color)] bg-[var(--panel-bg)] shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-1 hover:text-[var(--accent)] transition text-sm"
            title="Back to Dashboard"
          >
            ←
          </button>
          <span className="text-sm font-medium truncate max-w-[120px] sm:max-w-[200px]">
            {project?.name || 'Loading...'}
          </span>
          <span className="text-xs text-gray-500 px-1.5 py-0.5 rounded bg-[var(--background)] hidden sm:inline">
            {project?.language}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {/* Collab users */}
          {collabUsers.length > 0 && (
            <button
              onClick={() => setShowCollab(!showCollab)}
              className="p-1 text-xs hover:text-[var(--accent)] transition relative"
              title={`${collabUsers.length} connected`}
            >
              👥 {collabUsers.length}
            </button>
          )}

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 text-sm hover:text-[var(--accent)] transition"
            title="Toggle Theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* Export */}
          <button
            onClick={handleExport}
            disabled={exporting}
            className="p-1.5 text-sm hover:text-[var(--accent)] transition disabled:opacity-50"
            title="Export as ZIP"
          >
            {exporting ? '⏳' : '📦'}
          </button>

          {/* Import */}
          <input ref={importRef} type="file" accept=".zip" className="hidden" onChange={handleImport} />
          <button
            onClick={() => importRef.current?.click()}
            disabled={importing}
            className="p-1.5 text-sm hover:text-[var(--accent)] transition disabled:opacity-50"
            title="Import ZIP"
          >
            {importing ? '⏳' : '📂'}
          </button>

          {/* Mobile file drawer */}
          <button
            onClick={() => setShowMobileDrawer(true)}
            className="md:hidden p-1.5 text-sm hover:text-[var(--accent)] transition"
            title="Files"
          >
            📁
          </button>

          {/* Preview */}
          <button
            onClick={handlePreview}
            className={`p-1.5 text-sm rounded transition ${showPreview ? 'text-[var(--accent)] bg-[var(--accent)]/10' : 'hover:text-[var(--accent)]'}`}
            title="Live Preview"
          >
            👁️
          </button>

          {/* Run */}
          <button
            onClick={handleRun}
            disabled={isRunning || !activeFile}
            className="px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition disabled:opacity-50"
          >
            {isRunning ? 'Running...' : '▶ Run'}
          </button>
        </div>
      </header>

      {/* Collaboration overlay */}
      {showCollab && (
        <CollaborationOverlay users={collabUsers} onClose={() => setShowCollab(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* File Tree Sidebar (Desktop) */}
        <div className="hidden md:flex flex-col w-56 border-r border-[var(--border-color)] bg-[var(--sidebar-bg)] shrink-0">
          <FileTree
            files={files}
            projectId={id}
            activeFileId={activeFileId}
            onFileSelect={handleFileSelect}
            onFileCreated={handleFileCreated}
            onFileDeleted={handleFileDeleted}
            onFileUpload={handleFileUpload}
          />
        </div>

        {/* Editor + Preview */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs */}
          {openTabs.length > 0 && (
            <div className="flex items-center bg-[var(--panel-bg)] border-b border-[var(--border-color)] overflow-x-auto shrink-0">
              {openTabs.map((fileId) => {
                const f = files.find((ff) => ff.id === fileId)
                if (!f) return null
                const isActive = fileId === activeFileId
                return (
                  <div
                    key={fileId}
                    onClick={() => setActiveFileId(fileId)}
                    className={`flex items-center gap-1 px-3 py-1.5 text-xs cursor-pointer border-r border-[var(--border-color)] whitespace-nowrap ${
                      isActive ? 'bg-[var(--tab-active-bg)] text-[var(--accent)]' : 'bg-[var(--tab-inactive-bg)] hover:bg-[var(--file-hover)]'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${getFileIconColor(f.name)}`} />
                    {f.name}
                    <button
                      onClick={(e) => handleTabClose(fileId, e)}
                      className="ml-1 p-0.5 hover:text-red-400 transition"
                    >
                      ✕
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {/* Editor + Preview split */}
          <div className="flex-1 flex overflow-hidden">
            <div className={`flex-1 overflow-hidden ${showPreview ? 'w-1/2' : 'w-full'}`}>
              {activeFile ? (
                <CodeEditor
                  file={activeFile}
                  onChange={handleEditorChange}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                  Select a file to start editing
                </div>
              )}
            </div>
            {showPreview && (
              <div className="w-1/2 border-l border-[var(--border-color)]">
                <LivePreview code={previewCode} language={previewLanguage} />
              </div>
            )}
          </div>

          {/* Output Panel */}
          <OutputPanel output={output} />
        </div>
      </div>

      {/* Mobile File Drawer */}
      {showMobileDrawer && (
        <MobileFileDrawer
          files={files}
          projectId={id}
          activeFileId={activeFileId}
          onFileSelect={(fileId) => { handleFileSelect(fileId); setShowMobileDrawer(false) }}
          onFileCreated={handleFileCreated}
          onFileDeleted={handleFileDeleted}
          onFileUpload={handleFileUpload}
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
