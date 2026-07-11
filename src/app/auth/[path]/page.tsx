import { AuthView } from '@neondatabase/auth-ui'
import { authViewPaths } from '@neondatabase/auth-ui/server'

export const dynamicParams = false

export function generateStaticParams() {
  return Object.values(authViewPaths).map((path) => ({ path }))
}

export default async function AuthPathPage({
  params,
}: {
  params: Promise<{ path: string }>
}) {
  const { path } = await params

  return (
    <div className="h-full flex items-center justify-center bg-[var(--background)]" style={{ minHeight: '100dvh' }}>
      <div className="w-full max-w-md p-6">
        <div className="text-center mb-6">
          <svg viewBox="0 0 40 40" style={{ width: 40, height: 40, margin: '0 auto 12px' }}>
            <rect width="40" height="40" rx="10" fill="#be3056" />
            <path d="M14 14L9 20L14 26" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M26 14L31 20L26 26" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.5" />
          </svg>
          <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>CodeWave</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>Sign in to start coding</p>
        </div>
        <div className="rounded-lg border p-6" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--panel-bg)' }}>
          <AuthView path={path} />
        </div>
      </div>
    </div>
  )
}
