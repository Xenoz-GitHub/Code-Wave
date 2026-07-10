import { createAuthClient } from '@neondatabase/neon-js/auth'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _client: any = createAuthClient(
  process.env.NEXT_PUBLIC_NEON_AUTH_URL || ''
)

export const authClient = _client
