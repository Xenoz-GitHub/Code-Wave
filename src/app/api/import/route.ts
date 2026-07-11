import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth-server'

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionFromRequest(request)
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await request.formData()
    const projectId = formData.get('projectId') as string
    const file = formData.get('file') as File

    if (!projectId || !file) {
      return Response.json({ error: 'projectId and file are required' }, { status: 400 })
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project || project.userId !== user.id) {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }

    const JSZip = (await import('jszip')).default
    const zipData = await file.arrayBuffer()
    const zip = await JSZip.loadAsync(zipData)

    async function createPath(dirPath: string, pid: string): Promise<string | null> {
      const parts = dirPath.replace(/\/$/, '').split('/')
      let currentParent: string | null = null
      for (const part of parts) {
        if (!part) continue
        const parent = currentParent as string | null
        let existing: any
        if (parent) {
          existing = await prisma.file.findFirst({ where: { name: part, parentId: parent, projectId } })
        } else {
          existing = await prisma.file.findFirst({ where: { name: part, parentId: null, projectId, type: 'folder' } })
        }
        if (existing) {
          currentParent = existing.id
        } else {
          const newFolder = await prisma.file.create({
            data: { name: part, content: '', type: 'folder', parentId: parent, projectId },
          })
          currentParent = newFolder.id
        }
      }
      return currentParent
    }

    const entries: { name: string; content: string; parentId: string | null }[] = []

    for (const relativePath of Object.keys(zip.files)) {
      const zipEntry = zip.files[relativePath]
      if (zipEntry.dir) continue
      const parts = relativePath.split('/')
      const fileName = parts.pop()!
      let parentId: string | null = null
      if (parts.length > 0) {
        parentId = await createPath(parts.join('/'), projectId)
      }
      const content = await zipEntry.async('string')
      entries.push({ name: fileName, content, parentId })
    }

    await Promise.all(
      entries.map((e) =>
        prisma.file.create({
          data: { name: e.name, content: e.content, type: 'file', parentId: e.parentId, projectId },
        })
      )
    )

    const updatedFiles = await prisma.file.findMany({
      where: { projectId },
      orderBy: { name: 'asc' },
    })

    return Response.json(updatedFiles)
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Failed to import project' }, { status: 500 })
  }
}
