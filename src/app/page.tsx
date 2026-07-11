'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { authClient } from '@/lib/auth'

function CodeBracketIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M7 6L3 10L7 14" />
      <path d="M13 6L17 10L13 14" opacity="0.5" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M4 6H20" /><path d="M4 12H20" /><path d="M4 18H20" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M18 6L6 18" /><path d="M6 6L18 18" />
    </svg>
  )
}

const FEATURES = [
  {
    icon: <CodeBracketIcon />,
    title: 'Multi-Language Engine',
    desc: 'Execute JavaScript, Python, Rust, Go, C++, and 50+ languages in an isolated sandbox.',
    accent: '#be3056',
  },
  {
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M10 3V7" /><path d="M10 13V17" /><path d="M3 10H7" /><path d="M13 10H17" />
        <circle cx="10" cy="10" r="7.5" />
      </svg>
    ),
    title: 'VS Code IntelliSense',
    desc: 'Full autocomplete, hover definitions, parameter hints, and real-time diagnostics.',
    accent: '#d94a6b',
  },
  {
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M2 10C2 6 4.5 3 10 3C15.5 3 18 6 18 10C18 14 15.5 17 10 17C4.5 17 2 14 2 10Z" />
        <circle cx="10" cy="10" r="2.5" />
      </svg>
    ),
    title: 'Live Preview',
    desc: 'Render HTML, CSS, and JavaScript instantly. Switch between mobile, tablet, and desktop views.',
    accent: '#e8668a',
  },
  {
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M9 4H4V15H16V8L12 4H9Z" /><path d="M9 4V8H13" />
        <path d="M8 12L10 14L12 12" /><path d="M10 10V14" />
      </svg>
    ),
    title: 'Export & Import',
    desc: 'Download your projects as ZIP files or upload existing projects. Full portability.',
    accent: '#f4a2b8',
  },
  {
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <circle cx="7" cy="7" r="1.5" /><circle cx="13" cy="7" r="1.5" /><circle cx="10" cy="14" r="1.5" />
        <path d="M8.5 8L11.5 13" /><path d="M11.5 8L8.5 13" />
      </svg>
    ),
    title: 'Real-time Collab',
    desc: 'Share a link and edit code together. Live cursors, instant sync, zero friction.',
    accent: '#be3056',
  },
  {
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M14 7C14 4.5 12 3 10 3C8 3 6 4.5 6 7" />
        <path d="M5 8.5C3.5 9.5 3 11 3 13C3 16 5.5 17.5 10 17.5C14.5 17.5 17 16 17 13C17 11 16.5 9.5 15 8.5" />
        <circle cx="10" cy="11.5" r="1.5" />
        <path d="M10 13V15" />
      </svg>
    ),
    title: 'Cloud Sync',
    desc: 'Projects auto-save to Neon DB. Access your code from any device, anywhere.',
    accent: '#d94a6b',
  },
]

const LANGUAGES = ['JavaScript', 'TypeScript', 'Python', 'Rust', 'Go', 'C++', 'Java', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Dart', 'C#', 'Scala']

const EDITOR_CODE = [
  { line: 'import { useState } from "react"', color: '#c084fc' },
  { line: 'import { Cloud, Play } from "lucide-react"', color: '#c084fc' },
  { line: '', color: '' },
  { line: 'function App() {', color: '#e2e8f0' },
  { line: '  const [output, setOutput] = useState("")', color: '#9a8a8e' },
  { line: '', color: '' },
  { line: '  const runCode = async () => {', color: '#e2e8f0' },
  { line: '    const res = await fetch("/api/execute", {', color: '#e2e8f0' },
  { line: '      method: "POST",', color: '#e2e8f0' },
  { line: '      headers: { "Content-Type": "application/json" },', color: '#e2e8f0' },
  { line: '      body: JSON.stringify({ language: "js", code })', color: '#e2e8f0' },
  { line: '    })', color: '#e2e8f0' },
  { line: '    const data = await res.json()', color: '#e2e8f0' },
  { line: '    setOutput(data.output)', color: '#e2e8f0' },
  { line: '  }', color: '#e2e8f0' },
  { line: '', color: '' },
  { line: '  return <div>Hello, CodeWave</div>', color: '#f4a2b8' },
  { line: '}', color: '#e2e8f0' },
]

export default function LandingPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true)
  const mountedRef = useRef(true)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    setIsDesktop(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    mountedRef.current = true
    authClient.getSession().then((res: any) => {
      if (mountedRef.current) setUser(res?.data?.user || null)
    }).catch(() => {})
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { mountedRef.current = false; window.removeEventListener('scroll', onScroll) }
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <div style={{ backgroundColor: '#0e080a', color: '#f0e8e6', minHeight: '100vh' }}>
      {/* ─── NAV ─── */}
      <nav
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          transition: 'all 0.3s ease',
          backgroundColor: scrolled ? 'rgba(14,8,10,0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(190,48,86,0.12)' : '1px solid transparent',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', height: 56 }}>
          {/* Logo */}
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <svg viewBox="0 0 40 40" style={{ width: 32, height: 32, flexShrink: 0 }}>
              <defs>
                <linearGradient id="log" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#be3056" />
                  <stop offset="100%" stopColor="#d94a6b" />
                </linearGradient>
              </defs>
              <rect width="40" height="40" rx="10" fill="url(#log)" />
              <path d="M14 14L9 20L14 26" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <path d="M26 14L31 20L26 26" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.5" />
            </svg>
            <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.3px', color: '#f0e8e6' }}>CodeWave</span>
          </a>

          {/* Desktop nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            {isDesktop && (
              <>
                <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                  <a
                    href="#features"
                    onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }) }}
                    style={{ color: '#9a8a8e', fontSize: 13, textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#d0c4c2' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#9a8a8e' }}
                  >Features</a>
                  <a
                    href="https://github.com/Xenoz-GitHub/Code-Wave" target="_blank" rel="noopener noreferrer"
                    style={{ color: '#9a8a8e', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, transition: 'color 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#d0c4c2' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#9a8a8e' }}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 14, height: 14 }}>
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.73.083-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.776.418-1.306.762-1.604-2.665-.305-5.467-1.333-5.467-5.93 0-1.31.468-2.38 1.235-3.22-.123-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.3 1.23.96-.267 1.98-.4 3-.405 1.02.005 2.04.138 3 .405 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.24 2.874.118 3.176.77.84 1.233 1.91 1.233 3.22 0 4.61-2.807 5.62-5.48 5.92.43.37.823 1.102.823 2.22 0 1.602-.015 2.894-.015 3.287 0 .322.216.694.825.577C20.565 21.795 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    GitHub
                  </a>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {user ? (
                    <button onClick={() => router.push('/dashboard')}
                      style={{ padding: '7px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', backgroundColor: '#be3056', color: 'white', transition: 'all 0.2s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#d94a6b' }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#be3056' }}
                    >Dashboard</button>
                  ) : (
                    <>
                      <button onClick={() => router.push('/auth')}
                        style={{ padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'transparent', color: '#9a8a8e', cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#d0c4c2' }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#9a8a8e' }}
                      >Sign In</button>
                      <button onClick={() => router.push('/auth')}
                        style={{ padding: '7px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', backgroundColor: '#be3056', color: 'white', transition: 'all 0.2s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#d94a6b' }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#be3056' }}
                      >Get Started</button>
                    </>
                  )}
                </div>
              </>
            )}
            {/* Mobile hamburger */}
            {!isDesktop && (
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={{ background: 'none', border: 'none', color: '#f0e8e6', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {menuOpen ? <XIcon /> : <MenuIcon />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{ backgroundColor: 'rgba(14,8,10,0.98)', borderBottom: '1px solid rgba(190,48,86,0.12)', padding: '8px 16px 20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <a href="#features" onClick={(e) => { e.preventDefault(); setMenuOpen(false); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }) }}
                style={{ color: '#9a8a8e', fontSize: 14, textDecoration: 'none', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
              >Features</a>
              <a href="https://github.com/Xenoz-GitHub/Code-Wave" target="_blank" rel="noopener noreferrer"
                style={{ color: '#9a8a8e', fontSize: 14, textDecoration: 'none', padding: '10px 0', display: 'flex', alignItems: 'center', gap: 6, borderBottom: '1px solid rgba(255,255,255,0.04)' }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 14, height: 14 }}>
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.73.083-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.776.418-1.306.762-1.604-2.665-.305-5.467-1.333-5.467-5.93 0-1.31.468-2.38 1.235-3.22-.123-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.3 1.23.96-.267 1.98-.4 3-.405 1.02.005 2.04.138 3 .405 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.24 2.874.118 3.176.77.84 1.233 1.91 1.233 3.22 0 4.61-2.807 5.62-5.48 5.92.43.37.823 1.102.823 2.22 0 1.602-.015 2.894-.015 3.287 0 .322.216.694.825.577C20.565 21.795 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
                GitHub
              </a>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                {user ? (
                  <button onClick={() => { setMenuOpen(false); router.push('/dashboard') }}
                    style={{ width: '100%', padding: '10px', borderRadius: 8, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', backgroundColor: '#be3056', color: 'white' }}
                  >Dashboard</button>
                ) : (
                  <>
                    <button onClick={() => { setMenuOpen(false); router.push('/auth') }}
                      style={{ width: '100%', padding: '10px', borderRadius: 8, fontSize: 14, fontWeight: 500, border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'transparent', color: '#9a8a8e', cursor: 'pointer' }}
                    >Sign In</button>
                    <button onClick={() => { setMenuOpen(false); router.push('/auth') }}
                      style={{ width: '100%', padding: '10px', borderRadius: 8, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', backgroundColor: '#be3056', color: 'white' }}
                    >Get Started</button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Spacer */}
      <div style={{ height: 56 }} />

      {/* ─── HERO ─── */}
      <section style={{ padding: '60px 16px 80px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ maxWidth: 640, marginBottom: 48 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 1000, fontSize: 12, fontWeight: 500, marginBottom: 20, backgroundColor: 'rgba(190,48,86,0.08)', color: '#d94a6b', border: '1px solid rgba(190,48,86,0.2)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block', flexShrink: 0 }} />
              Now in public beta
            </div>
            <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 3.2rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.04em', marginBottom: 16, color: '#f0e8e6' }}>
              Code from{' '}
              <span style={{ background: 'linear-gradient(135deg, #be3056, #d94a6b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                anywhere
              </span>
              <br />
              Run everywhere.
            </h1>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: '#9a8a8e', marginBottom: 28, maxWidth: 480 }}>
              A browser-based IDE with live preview, real-time collaboration, and cloud execution for 50+ languages. No setup, no downloads.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button onClick={() => router.push(user ? '/dashboard' : '/auth')}
                style={{ padding: '11px 26px', borderRadius: 10, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', backgroundColor: '#be3056', color: 'white', boxShadow: '0 4px 20px rgba(190,48,86,0.3)', transition: 'all 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 28px rgba(190,48,86,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(190,48,86,0.3)'; e.currentTarget.style.transform = 'translateY(0)' }}
              >Start Coding Free</button>
              <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                style={{ padding: '11px 26px', borderRadius: 10, fontSize: 14, fontWeight: 500, border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'transparent', color: '#9a8a8e', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#d0c4c2' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#9a8a8e' }}
              >View Features</button>
            </div>
          </div>

          {/* Editor preview */}
          <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(190,48,86,0.1)', boxShadow: '0 8px 60px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', backgroundColor: '#130a0d', borderBottom: '1px solid rgba(190,48,86,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }} />
                  <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#eab308', display: 'inline-block' }} />
                  <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }} />
                </div>
                <span style={{ fontSize: 12, color: '#6a5a5e', marginLeft: 8 }}>App.tsx</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <span style={{ padding: '2px 10px', borderRadius: 4, fontSize: 11, backgroundColor: 'rgba(190,48,86,0.1)', color: '#d94a6b' }}>TypeScript</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <div style={{ width: 40, padding: '14px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, backgroundColor: '#0e080a', borderRight: '1px solid rgba(190,48,86,0.06)' }}>
                {[<CodeBracketIcon />, <CodeBracketIcon />, <CodeBracketIcon />, <CodeBracketIcon />].map((icon, i) => (
                  <div key={i} style={{ opacity: 0.2, cursor: 'pointer' }}>{icon}</div>
                ))}
              </div>
              <div style={{ flex: 1, padding: '16px 20px', backgroundColor: '#0e080a', fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: 12, lineHeight: 1.8, overflowX: 'auto' }}>
                {EDITOR_CODE.map((l, i) => (
                  <div key={i} style={{ whiteSpace: 'pre', color: l.color || 'transparent', minHeight: l.line ? 'auto' : 12 }}>
                    {l.line || '\u00A0'}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 16px', fontSize: 11, backgroundColor: '#130a0d', borderTop: '1px solid rgba(190,48,86,0.06)', color: '#6a5a5e' }}>
              <div style={{ display: 'flex', gap: 16 }}>
                <span>JavaScript JSX</span>
                <span>Ln 18, Col 32</span>
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <span>UTF-8</span>
                <span>Spaces: 2</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── LANGUAGES ─── */}
      <section style={{ padding: '48px 16px', borderTop: '1px solid rgba(190,48,86,0.08)', borderBottom: '1px solid rgba(190,48,86,0.08)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: 11, color: '#6a5a5e', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 20 }}>Supported Languages</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 6 }}>
            {LANGUAGES.map((l) => (
              <span key={l} style={{ padding: '4px 12px', borderRadius: 6, fontSize: 12, backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', color: '#7a6a6e' }}>{l}</span>
            ))}
            <span style={{ padding: '4px 12px', borderRadius: 6, fontSize: 12, backgroundColor: 'rgba(190,48,86,0.08)', border: '1px solid rgba(190,48,86,0.15)', color: '#d94a6b' }}>+36 more</span>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" style={{ padding: '80px 16px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#d94a6b', marginBottom: 8 }}>Features</p>
            <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 2.2rem)', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 12, color: '#f0e8e6' }}>
              Everything a developer needs
            </h2>
            <p style={{ color: '#9a8a8e', fontSize: 14, maxWidth: 480, margin: '0 auto' }}>
              No downloads, no configs, no limits. Just pure development in your browser.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 1, backgroundColor: 'rgba(190,48,86,0.04)', borderRadius: 12, overflow: 'hidden' }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ padding: 24, backgroundColor: 'transparent', transition: 'background-color 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(190,48,86,0.03)' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, backgroundColor: `${f.accent}18`, color: f.accent }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: '#f0e8e6' }}>{f.title}</h3>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: '#9a8a8e' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section style={{ padding: '48px 16px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24, textAlign: 'center' }}>
          {[
            { value: '50+', label: 'Languages' },
            { value: '100%', label: 'In Browser' },
            { value: 'Instant', label: 'Live Preview' },
            { value: 'Free', label: 'No Credit Card' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '20px 0' }}>
              <div style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 700, color: '#f0e8e6', marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#6a5a5e', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section style={{ padding: '60px 16px 80px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 24px', borderRadius: 16, textAlign: 'center', backgroundColor: 'rgba(190,48,86,0.04)', border: '1px solid rgba(190,48,86,0.1)' }}>
          <h2 style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)', fontWeight: 700, marginBottom: 10, color: '#f0e8e6' }}>Start coding in seconds</h2>
          <p style={{ color: '#9a8a8e', fontSize: 14, marginBottom: 24, maxWidth: 360, margin: '0 auto 24px' }}>
            Create a free account. No credit card. No setup. Just pure code.
          </p>
          <button onClick={() => router.push(user ? '/dashboard' : '/auth')}
            style={{ padding: '11px 32px', borderRadius: 10, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', backgroundColor: '#be3056', color: 'white', boxShadow: '0 4px 20px rgba(190,48,86,0.3)', transition: 'all 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 28px rgba(190,48,86,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(190,48,86,0.3)'; e.currentTarget.style.transform = 'translateY(0)' }}
          >{user ? 'Go to Dashboard' : 'Create Free Account'}</button>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ padding: '20px 16px', borderTop: '1px solid rgba(190,48,86,0.06)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12, color: '#4a3a3e', flexWrap: 'wrap' }}>
          <svg viewBox="0 0 40 40" style={{ width: 18, height: 18 }}>
            <rect width="40" height="40" rx="10" fill="#be3056" />
            <path d="M14 14L9 20L14 26" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M26 14L31 20L26 26" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.5" />
          </svg>
          <span style={{ fontWeight: 600, color: '#6a5a5e' }}>CodeWave</span>
          <span style={{ color: '#3a2a2e' }}>·</span>
          <span style={{ color: '#4a3a3e' }}>Browser IDE</span>
          <span style={{ color: '#3a2a2e' }}>·</span>
          <span style={{ color: '#4a3a3e' }}>Next.js · Neon DB · Monaco</span>
        </div>
      </footer>


    </div>
  )
}
