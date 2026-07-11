import { NextRequest } from 'next/server'
import { createNeonAuth } from '@neondatabase/neon-js/auth/next/server'

const baseUrl = process.env.NEON_AUTH_BASE_URL || ''
const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET || ''

if (!baseUrl || !cookieSecret) {
  console.error('Missing NEON_AUTH_BASE_URL or NEON_AUTH_COOKIE_SECRET environment variables')
}

export const auth = createNeonAuth({
  baseUrl,
  cookies: {
    secret: cookieSecret,
    sessionDataTtl: 300,
  },
})

export async function getSessionFromRequest(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie') || ''
    const { data: session } = await auth.getSession({
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
