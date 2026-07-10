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

    const filesToCreate: { name: string; content: string; type: string; projectId: string }[] = []

    zip.forEach((relativePath, zipEntry) => {
      if (!zipEntry.dir) {
        filesToCreate.push({
          name: relativePath,
          content: '',
          type: 'file',
          projectId,
        })
      }
    })

    await Promise.all(
      filesToCreate.map(async (f) => {
        const entry = zip.file(f.name)
        if (entry) {
          const content = await entry.async('string')
          await prisma.file.create({
            data: { ...f, content },
          })
        }
      })
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
