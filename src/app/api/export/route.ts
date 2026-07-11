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
    const allFiles = project.files

    function addFilesToZip(parentId: string | null, zipFolder: typeof zip) {
      for (const f of allFiles.filter((ff) => ff.parentId === parentId)) {
        if (f.type === 'folder') {
          const folder = zipFolder.folder(f.name)
          if (folder) addFilesToZip(f.id, folder)
        } else {
          const parts: string[] = [f.name]
          let pid = f.parentId
          while (pid) {
            const parent = allFiles.find((ff) => ff.id === pid)
            if (parent) { parts.unshift(parent.name); pid = parent.parentId }
            else break
          }
          zipFolder.file(parts.join('/'), f.content)
        }
      }
    }
    addFilesToZip(null, zip)

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
