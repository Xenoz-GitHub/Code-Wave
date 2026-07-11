'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth'
import { Download, Upload, X, Trash, Spinner, Plus } from '@/lib/icons'
import UserMenu from '@/components/UserMenu'

export const dynamic = 'force-dynamic'

type Project = {
  id: string
  name: string
  language: string
  createdAt: string
  _count: { files: number }
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newLang, setNewLang] = useState('javascript')
  const [showNew, setShowNew] = useState(false)
  const [exportingId, setExportingId] = useState<string | null>(null)
  const importRefs = useRef<Record<string, HTMLInputElement>>({})

  useEffect(() => {
    authClient.getSession().then((res: any) => {
      const u = res?.data?.user
      if (!u) { router.push('/auth'); return }
      setUser(u)
      fetchProjects()
    }).catch(() => router.push('/auth'))
  }, [router])

  async function fetchProjects() {
    try {
      const res = await fetch('/api/projects')
      const data = await res.json()
      setProjects(data)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  async function createProject() {
    if (!newName.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, language: newLang }),
      })
      if (!res.ok) {
        const err = await res.json()
        console.error('Create project error:', err)
        return
      }
      const project = await res.json()
      setProjects([project, ...projects])
      setShowNew(false)
      setNewName('')
      router.push(`/editor/${project.id}`)
    } catch (e) {
      console.error(e)
    }
    setCreating(false)
  }

  async function deleteProject(id: string) {
    if (!confirm('Delete this project?')) return
    await fetch(`/api/projects?id=${id}`, { method: 'DELETE' })
    setProjects(projects.filter((p) => p.id !== id))
  }

  async function exportProject(id: string, name: string, e: React.MouseEvent) {
    e.stopPropagation()
    setExportingId(id)
    try {
      const res = await fetch(`/api/export?projectId=${id}`)
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${name}.zip`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) { console.error(e) }
    setExportingId(null)
  }

  async function importProject(id: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('projectId', id)
    formData.append('file', file)
    try {
      const res = await fetch('/api/import', { method: 'POST', body: formData })
      const data = await res.json()
      if (Array.isArray(data)) {
        setProjects(projects.map((p) => p.id === id ? { ...p, _count: { files: data.length } } : p))
      }
    } catch (e) { console.error(e) }
    if (importRefs.current[id]) importRefs.current[id].value = ''
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[var(--background)]">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-[var(--background)]">
      <header className="flex items-center justify-between px-6 py-3 border-b border-[var(--border-color)]" style={{ backgroundColor: 'var(--panel-bg)' }}>
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/')} className="text-lg font-bold" style={{ color: 'var(--accent)' }}>CodeWave</button>
          <span className="text-xs px-2 py-0.5 rounded-full border border-[var(--border-color)]" style={{ color: 'var(--foreground-muted)' }}>Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          <UserMenu user={user} />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold">Your Projects</h1>
            <button
              onClick={() => setShowNew(!showNew)}
              className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition flex items-center gap-1.5"
            >
              <Plus /> New Project
            </button>
          </div>

          {showNew && (
            <div className="mb-6 p-4 rounded-lg border border-[var(--border-color)] bg-[var(--panel-bg)]">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Project name..."
                  className="flex-1 px-3 py-2 rounded bg-[var(--background)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--accent)]"
                  onKeyDown={(e) => e.key === 'Enter' && createProject()}
                />
                <select
                  value={newLang}
                  onChange={(e) => setNewLang(e.target.value)}
                  className="px-3 py-2 rounded bg-[var(--background)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--accent)]"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="html">HTML</option>
                  <option value="css">CSS</option>
                  <option value="cpp">C++</option>
                  <option value="rust">Rust</option>
                  <option value="go">Go</option>
                  <option value="java">Java</option>
                  <option value="ruby">Ruby</option>
                  <option value="php">PHP</option>
                </select>
                <button
                  onClick={createProject}
                  disabled={creating}
                  className="px-4 py-2 bg-[var(--accent)] text-white rounded text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          )}

          {projects.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-dashed border-[var(--border-color)] flex items-center justify-center" style={{ color: 'var(--foreground-muted)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}>
                  <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
                  <polyline points="13 2 13 9 20 9" />
                </svg>
              </div>
              <p className="text-base font-medium mb-1">No projects yet</p>
              <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Create your first project to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => router.push(`/editor/${project.id}`)}
                  className="p-4 rounded-lg border border-[var(--border-color)] bg-[var(--panel-bg)] hover:border-[var(--accent)] cursor-pointer transition group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{project.name}</h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                        <span className="px-1.5 py-0.5 rounded bg-[var(--background)]">{project.language}</span>
                        <span>{project._count?.files || 0} files</span>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      <input
                        ref={(el) => { if (el) importRefs.current[project.id] = el }}
                        type="file" accept=".zip"
                        className="hidden"
                        onChange={(e) => importProject(project.id, e)}
                      />
                      <button
                        onClick={(e) => { e.stopPropagation(); importRefs.current[project.id]?.click() }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-[var(--accent)] transition"
                        style={{ color: 'var(--foreground-muted)' }}
                        title="Import ZIP"
                      >
                        <Upload />
                      </button>
                      <button
                        onClick={(e) => exportProject(project.id, project.name, e)}
                        disabled={exportingId === project.id}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-[var(--accent)] transition disabled:opacity-30"
                        style={{ color: 'var(--foreground-muted)' }}
                        title="Export ZIP"
                      >
                        {exportingId === project.id ? <Spinner /> : <Download />}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteProject(project.id) }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition"
                        style={{ color: 'var(--foreground-muted)' }}
                        title="Delete"
                      >
                        <Trash />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
