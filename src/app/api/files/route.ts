import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth-server'

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionFromRequest(request)
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const projectId = request.nextUrl.searchParams.get('projectId')
    if (!projectId) return Response.json({ error: 'projectId is required' }, { status: 400 })

    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project || project.userId !== user.id) {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }

    const files = await prisma.file.findMany({
      where: { projectId },
      orderBy: { name: 'asc' },
    })

    return Response.json(files)
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Failed to fetch files' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionFromRequest(request)
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { projectId, name, content, type, parentId } = await request.json()
    if (!projectId || !name) return Response.json({ error: 'projectId and name are required' }, { status: 400 })

    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project || project.userId !== user.id) {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }

    const file = await prisma.file.create({
      data: { name, content: content || '', type: type || 'file', parentId: parentId || null, projectId },
    })

    return Response.json(file)
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Failed to create file' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getSessionFromRequest(request)
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { id, name, content } = await request.json()
    if (!id) return Response.json({ error: 'id is required' }, { status: 400 })

    const file = await prisma.file.findUnique({ where: { id } })
    if (!file) return Response.json({ error: 'Not found' }, { status: 404 })

    const project = await prisma.project.findUnique({ where: { id: file.projectId } })
    if (!project || project.userId !== user.id) {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }

    const updated = await prisma.file.update({
      where: { id },
      data: { ...(name && { name }), ...(content !== undefined && { content }) },
    })

    return Response.json(updated)
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Failed to update file' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getSessionFromRequest(request)
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const id = request.nextUrl.searchParams.get('id')
    if (!id) return Response.json({ error: 'id is required' }, { status: 400 })

    const file = await prisma.file.findUnique({ where: { id } })
    if (!file) return Response.json({ error: 'Not found' }, { status: 404 })

    const project = await prisma.project.findUnique({ where: { id: file.projectId } })
    if (!project || project.userId !== user.id) {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }

    // Cascade delete children if folder
    const children = await prisma.file.findMany({ where: { parentId: id } })
    for (const child of children) {
      await prisma.file.delete({ where: { id: child.id } })
    }
    await prisma.file.delete({ where: { id } })
    return Response.json({ success: true })
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Failed to delete file' }, { status: 500 })
  }
}
