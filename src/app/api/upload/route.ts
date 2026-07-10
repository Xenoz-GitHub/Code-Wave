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

    const content = await file.text()
    const newFile = await prisma.file.create({
      data: {
        name: file.name,
        content: content,
        type: file.type.startsWith('image/') ? 'image' : 'file',
        projectId,
      },
    })

    return Response.json(newFile)
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
