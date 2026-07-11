import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth-server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionFromRequest(request)
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const file = await prisma.file.findUnique({ where: { id } })
    if (!file) return Response.json({ error: 'Not found' }, { status: 404 })

    const project = await prisma.project.findUnique({ where: { id: file.projectId } })
    if (!project || project.userId !== user.id) {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }

    const ext = file.name.split('.').pop()?.toLowerCase()
    const mimeMap: Record<string, string> = {
      png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
      gif: 'image/gif', svg: 'image/svg+xml', webp: 'image/webp',
      ico: 'image/x-icon', bmp: 'image/bmp',
    }
    const contentType = mimeMap[ext || ''] || 'application/octet-stream'
    const isImage = contentType.startsWith('image/')

    return new Response(isImage ? Buffer.from(file.content, 'base64') : file.content, {
      headers: { 'Content-Type': contentType },
    })
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Failed to fetch file' }, { status: 500 })
  }
}
