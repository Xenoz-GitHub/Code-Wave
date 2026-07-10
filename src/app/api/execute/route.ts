import { NextRequest } from 'next/server'

const PISTON_API = 'https://emkc.org/api/v2/piston/execute'

export async function POST(request: NextRequest) {
  try {
    const { language, code } = await request.json()
    if (!language || !code) {
      return Response.json({ error: 'language and code are required' }, { status: 400 })
    }

    const response = await fetch(PISTON_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: language,
        version: '*',
        files: [{ content: code }],
      }),
    })

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
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Failed to execute code' }, { status: 500 })
  }
}

export const runtime = 'nodejs'
