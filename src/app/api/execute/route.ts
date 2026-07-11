import { NextRequest } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth-server'

const PISTON_API = 'https://emkc.org/api/v2/piston/execute'

const LANGUAGE_VERSIONS: Record<string, string> = {
  javascript: '18.15.0',
  typescript: '5.0.3',
  python: '3.10.0',
  rust: '1.68.0',
  go: '1.20.0',
  cpp: '10.2.0',
  java: '15.0.2',
  ruby: '3.2.0',
  php: '8.2.0',
  swift: '5.3.3',
  kotlin: '1.8.0',
  dart: '3.0.0',
  csharp: '6.0.0',
  scala: '3.2.0',
  c: '10.2.0',
  bash: '5.2.0',
  lua: '5.4.0',
  r: '4.2.0',
  perl: '5.36.0',
  haskell: '9.0.1',
  elixir: '1.14.0',
}

const TIMEOUT_MS = 60000

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionFromRequest(request)
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { language, code } = await request.json()
    if (!language || !code) {
      return Response.json({ error: 'language and code are required' }, { status: 400 })
    }

    const version = LANGUAGE_VERSIONS[language]

    if (!version) {
      return Response.json({ error: `Unsupported language: ${language}` }, { status: 400 })
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

    try {
      const response = await fetch(PISTON_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          language,
          version,
          files: [{ content: code }],
        }),
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const error = await response.text()
        return Response.json({ error: `Execution service error: ${error}` }, { status: 502 })
      }

      const result = await response.json()
      return Response.json({
        output: result.run?.output || '',
        stderr: result.run?.stderr || '',
        code: result.run?.code || 0,
        language: result.language,
      })
    } catch (e: unknown) {
      clearTimeout(timeoutId)
      if ((e as Error)?.name === 'AbortError') {
        return Response.json({ error: 'Execution timed out after 60 seconds' }, { status: 504 })
      }
      throw e
    }
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Failed to execute code' }, { status: 500 })
  }
}

export const runtime = 'nodejs'
