import { NextRequest } from 'next/server'
import { createAuthClient } from '@neondatabase/neon-js/auth'

const authUrl = process.env.NEXT_PUBLIC_NEON_AUTH_URL || ''

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _serverClient: any = null

export async function getSessionFromRequest(request: NextRequest) {
  try {
    if (!_serverClient) {
      _serverClient = createAuthClient(authUrl)
    }
    const cookieHeader = request.headers.get('cookie') || ''
    const session = await _serverClient.getSession({
      fetchOptions: {
        headers: { Cookie: cookieHeader },
      },
    })
    return session?.user || null
  } catch (e) {
    console.error('Auth error:', e)
    return null
  }
}
