'use client'

import { NeonAuthUIProvider } from '@neondatabase/neon-js/auth/react'
import { authClient } from '@/lib/auth'

export default function NeonAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <NeonAuthUIProvider emailOTP authClient={authClient}>
      {children}
    </NeonAuthUIProvider>
  )
}
