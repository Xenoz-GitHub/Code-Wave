import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth-server'

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionFromRequest(request)
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const projectId = request.nextUrl.searchParams.get('id')

    if (projectId) {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { _count: { select: { files: true } } },
      })
      if (!project || project.userId !== user.id) {
        return Response.json({ error: 'Not found' }, { status: 404 })
      }
      return Response.json(project)
    }

    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      include: { _count: { select: { files: true } } },
      orderBy: { updatedAt: 'desc' },
    })

    return Response.json(projects)
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionFromRequest(request)
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { name, language } = await request.json()
    if (!name?.trim()) return Response.json({ error: 'Name is required' }, { status: 400 })

    const extMap: Record<string, string> = {
      javascript: 'js', typescript: 'ts', python: 'py',
      html: 'html', cpp: 'cpp', rust: 'rs', go: 'go',
      java: 'java', ruby: 'rb', php: 'php', css: 'css',
    }

    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        language: language || 'javascript',
        userId: user.id,
        files: {
          create: [
            { name: `main.${extMap[language] || 'js'}`, content: '', type: 'file' },
          ],
        },
      },
      include: { _count: { select: { files: true } } },
    })

    return Response.json(project)
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Failed to create project' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getSessionFromRequest(request)
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const id = request.nextUrl.searchParams.get('id')
    if (!id) return Response.json({ error: 'ID is required' }, { status: 400 })

    const project = await prisma.project.findUnique({ where: { id } })
    if (!project || project.userId !== user.id) {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }

    await prisma.project.delete({ where: { id } })
    return Response.json({ success: true })
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Failed to delete project' }, { status: 500 })
  }
}
