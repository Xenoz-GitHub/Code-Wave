import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth-server'

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionFromRequest(request)
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const projectId = request.nextUrl.searchParams.get('projectId')
    if (!projectId) return Response.json({ error: 'projectId is required' }, { status: 400 })

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { files: true },
    })
    if (!project || project.userId !== user.id) {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }

    const JSZip = (await import('jszip')).default
    const zip = new JSZip()

    const rootFiles = project.files.filter((f) => !f.parentId)
    for (const file of rootFiles) {
      zip.file(file.name, file.content)
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })

    return new Response(new Uint8Array(zipBuffer), {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${project.name}.zip"`,
      },
    })
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Failed to export project' }, { status: 500 })
  }
}
