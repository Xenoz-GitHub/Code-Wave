'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { authClient } from '@/lib/auth'

function useIsVisible(ref: React.RefObject<HTMLElement | null>) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const o = new IntersectionObserver(([e]) => e.isIntersecting && (setVisible(true), o.disconnect()), { threshold: 0.15 })
    o.observe(el)
    return () => o.disconnect()
  }, [ref])
  return visible
}

function ChevronLeft() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M12 5L7 10L12 15" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M8 5L13 10L8 15" />
    </svg>
  )
}

function CodeBracket() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M7 6L3 10L7 14" />
      <path d="M13 6L17 10L13 14" opacity="0.5" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M3 6H17" /><path d="M3 10H17" /><path d="M3 14H17" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M6 6L14 14" /><path d="M14 6L6 14" />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.73.083-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.776.418-1.306.762-1.604-2.665-.305-5.467-1.333-5.467-5.93 0-1.31.468-2.38 1.235-3.22-.123-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.3 1.23.96-.267 1.98-.4 3-.405 1.02.005 2.04.138 3 .405 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.24 2.874.118 3.176.77.84 1.233 1.91 1.233 3.22 0 4.61-2.807 5.62-5.48 5.92.43.37.823 1.102.823 2.22 0 1.602-.015 2.894-.015 3.287 0 .322.216.694.825.577C20.565 21.795 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

const FEATURES = [
  {
    icon: <CodeBracket />,
    title: 'Multi-Language Engine',
    desc: 'Execute JavaScript, Python, Rust, Go, C++, and 50+ languages in an isolated sandbox.',
    accent: '#6366f1',
  },
  {
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M10 3V7" /><path d="M10 13V17" /><path d="M3 10H7" /><path d="M13 10H17" />
        <circle cx="10" cy="10" r="7.5" />
      </svg>
    ),
    title: 'VS Code IntelliSense',
    desc: 'Full autocomplete, hover definitions, parameter hints, and real-time diagnostics powered by Monaco.',
    accent: '#06b6d4',
  },
  {
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M2 10C2 6 4.5 3 10 3C15.5 3 18 6 18 10C18 14 15.5 17 10 17C4.5 17 2 14 2 10Z" />
        <circle cx="10" cy="10" r="2.5" />
      </svg>
    ),
    title: 'Live Preview',
    desc: 'Render HTML, CSS, and JavaScript instantly. Switch between mobile, tablet, and desktop views.',
    accent: '#10b981',
  },
  {
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M9 4H4V15H16V8L12 4H9Z" /><path d="M9 4V8H13" />
        <path d="M8 12L10 14L12 12" /><path d="M10 10V14" />
      </svg>
    ),
    title: 'Export & Import',
    desc: 'Download your projects as ZIP files or upload existing projects. Full portability.',
    accent: '#f59e0b',
  },
  {
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <circle cx="7" cy="7" r="1.5" /><circle cx="13" cy="7" r="1.5" /><circle cx="10" cy="14" r="1.5" />
        <path d="M8.5 8L11.5 13" /><path d="M11.5 8L8.5 13" />
      </svg>
    ),
    title: 'Real-time Collab',
    desc: 'Share a link and edit code together. Live cursors, instant sync, zero friction.',
    accent: '#ec4899',
  },
  {
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M14 7C14 4.5 12 3 10 3C8 3 6 4.5 6 7" />
        <path d="M5 8.5C3.5 9.5 3 11 3 13C3 16 5.5 17.5 10 17.5C14.5 17.5 17 16 17 13C17 11 16.5 9.5 15 8.5" />
        <circle cx="10" cy="11.5" r="1.5" />
        <path d="M10 13V15" />
      </svg>
    ),
    title: 'Cloud Sync',
    desc: 'Projects auto-save to Neon DB. Access your code from any device, anywhere.',
    accent: '#8b5cf6',
  },
]

const LANGUAGES = ['JavaScript', 'TypeScript', 'Python', 'Rust', 'Go', 'C++', 'Java', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Dart', 'C#', 'Scala']

const EDITOR_CODE = [
  { line: 'import { useState } from "react"', color: '#c084fc' },
  { line: 'import { Cloud, Play } from "lucide-react"', color: '#c084fc' },
  { line: '', color: '' },
  { line: 'function App() {', color: '#e2e8f0' },
  { line: '  const [output, setOutput] = useState("")', color: '#94a3b8' },
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
  { line: '  return <div>Hello, CodeWave</div>', color: '#fbbf24' },
  { line: '}', color: '#e2e8f0' },
]

export default function LandingPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const heroVisible = useIsVisible(heroRef)
  const editorVisible = useIsVisible(editorRef)
  const featuresVisible = useIsVisible(featuresRef)
  const ctaVisible = useIsVisible(ctaRef)

  useEffect(() => {
    authClient.getUser().then((u: any) => setUser(u)).catch(() => {})
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <div style={{ backgroundColor: '#0b0e14', color: '#e2e8f0', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: scrolled ? 'rgba(11,14,20,0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(24px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.04)' : '1px solid transparent',
        }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3.5">
          <a href="/" className="flex items-center gap-2.5">
            <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg, #6366f1, #06b6d4)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}>
              <svg viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 10, height: 10 }}>
                <path d="M6 5L4 8L6 11" /><path d="M10 5L12 8L10 11" opacity="0.6" />
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.3px' }}>CodeWave</span>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }}
              style={{ color: '#64748b', fontSize: 13, textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#94a3b8' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#64748b' }}>
              Features
            </a>
            <a href="https://github.com/Xenoz-GitHub/Code-Wave" target="_blank" rel="noopener noreferrer"
              style={{ color: '#64748b', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, transition: 'color 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#94a3b8' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#64748b' }}>
              <GitHubIcon /> GitHub
            </a>
            {user ? (
              <button onClick={() => router.push('/dashboard')}
                style={{ padding: '7px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', backgroundColor: '#6366f1', color: 'white', transition: 'all 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5558e6' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#6366f1' }}>
                Dashboard
              </button>
            ) : (
              <>
                <button onClick={() => router.push('/auth')}
                  style={{ padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'transparent', color: '#94a3b8', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#e2e8f0' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#94a3b8' }}>
                  Sign In
                </button>
                <button onClick={() => router.push('/auth')}
                  style={{ padding: '7px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', backgroundColor: '#6366f1', color: 'white', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5558e6' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#6366f1' }}>
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: 'none', border: 'none', color: '#e2e8f0', cursor: 'pointer', padding: 4 }}>
            {menuOpen ? <XIcon /> : <MenuIcon />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{ backgroundColor: 'rgba(11,14,20,0.98)', borderBottom: '1px solid rgba(255,255,255,0.04)', padding: '16px 24px 24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <a href="#features" onClick={(e) => { e.preventDefault(); setMenuOpen(false); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }}
                style={{ color: '#64748b', fontSize: 14, textDecoration: 'none', padding: '8px 0' }}>
                Features
              </a>
              <a href="https://github.com/Xenoz-GitHub/Code-Wave" target="_blank" rel="noopener noreferrer"
                style={{ color: '#64748b', fontSize: 14, textDecoration: 'none', padding: '8px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                <GitHubIcon /> GitHub
              </a>
              <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.04)', margin: '4px 0' }} />
              {user ? (
                <button onClick={() => { setMenuOpen(false); router.push('/dashboard') }}
                  style={{ width: '100%', padding: '10px', borderRadius: 8, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', backgroundColor: '#6366f1', color: 'white' }}>
                  Dashboard
                </button>
              ) : (
                <>
                  <button onClick={() => { setMenuOpen(false); router.push('/auth') }}
                    style={{ width: '100%', padding: '10px', borderRadius: 8, fontSize: 14, fontWeight: 500, border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'transparent', color: '#94a3b8', cursor: 'pointer' }}>
                    Sign In
                  </button>
                  <button onClick={() => { setMenuOpen(false); router.push('/auth') }}
                    style={{ width: '100%', padding: '10px', borderRadius: 8, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', backgroundColor: '#6366f1', color: 'white' }}>
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Spacer for fixed nav */}
      <div style={{ height: 56 }} />

      {/* HERO */}
      <section ref={heroRef} style={{ paddingTop: 40, paddingBottom: 80, paddingLeft: 24, paddingRight: 24 }}>
        <div className="max-w-6xl mx-auto">
          <div style={{ maxWidth: 640, marginBottom: 64 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 1000, fontSize: 12, fontWeight: 500, marginBottom: 24, backgroundColor: 'rgba(99,102,241,0.08)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.15)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }} />
              Now in public beta
            </div>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.04em', marginBottom: 20, color: '#f1f5f9' }}>
              Code from{' '}
              <span style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                anywhere
              </span>
              <br />
              Run everywhere.
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: '#64748b', marginBottom: 32, maxWidth: 480 }}>
              A browser-based IDE with live preview, real-time collaboration, and cloud execution for 50+ languages. No setup, no downloads.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={() => router.push(user ? '/dashboard' : '/auth')}
                style={{ padding: '12px 28px', borderRadius: 10, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', backgroundColor: '#6366f1', color: 'white', boxShadow: '0 4px 24px rgba(99,102,241,0.25)', transition: 'all 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 32px rgba(99,102,241,0.35)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 24px rgba(99,102,241,0.25)'; e.currentTarget.style.transform = 'translateY(0)' }}>
                Start Coding Free
              </button>
              <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                style={{ padding: '12px 28px', borderRadius: 10, fontSize: 14, fontWeight: 500, border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'transparent', color: '#94a3b8', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#e2e8f0' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#94a3b8' }}>
                View Features
              </button>
            </div>
          </div>

          {/* EDITOR PREVIEW */}
          <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 8px 60px rgba(0,0,0,0.4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', backgroundColor: '#0f1219', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ef4444' }} />
                  <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#eab308' }} />
                  <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#22c55e' }} />
                </div>
                <span style={{ fontSize: 12, color: '#475569', marginLeft: 8 }}>App.tsx</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <span style={{ padding: '2px 10px', borderRadius: 4, fontSize: 11, backgroundColor: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>TypeScript</span>
              </div>
            </div>
            <div style={{ display: 'flex' }}>
              <div style={{ width: 40, padding: '14px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, backgroundColor: '#0d1017', borderRight: '1px solid rgba(255,255,255,0.04)' }}>
                {[<CodeBracket />, <ChevronLeft />, <ChevronRight />, <CodeBracket />].map((icon, i) => (
                  <div key={i} style={{ opacity: 0.3, cursor: 'pointer' }}>{icon}</div>
                ))}
              </div>
              <div style={{ flex: 1, padding: '16px 20px', backgroundColor: '#0b0e14', fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: 12, lineHeight: 1.8, overflowX: 'auto' }}>
                {EDITOR_CODE.map((l, i) => (
                  <div key={i} style={{ whiteSpace: 'pre', color: l.color || 'transparent', minHeight: l.line ? 'auto' : 12 }}>
                    {l.line || '\u00A0'}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 16px', fontSize: 11, backgroundColor: '#0d1017', borderTop: '1px solid rgba(255,255,255,0.04)', color: '#475569' }}>
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

      {/* LANGUAGES */}
      <section style={{ padding: '60px 24px', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="max-w-6xl mx-auto">
          <p style={{ textAlign: 'center', fontSize: 11, color: '#475569', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 24 }}>Supported Languages</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
            {LANGUAGES.map((l) => (
              <span key={l} style={{ padding: '5px 14px', borderRadius: 6, fontSize: 12, backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#64748b' }}>{l}</span>
            ))}
            <span style={{ padding: '5px 14px', borderRadius: 6, fontSize: 12, backgroundColor: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', color: '#818cf8' }}>+36 more</span>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" ref={featuresRef} style={{ padding: '100px 24px' }}>
        <div className="max-w-6xl mx-auto">
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#818cf8', marginBottom: 8 }}>Features</p>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 12, color: '#f1f5f9' }}>
              Everything a developer needs
            </h2>
            <p style={{ color: '#64748b', fontSize: 15, maxWidth: 480, margin: '0 auto' }}>
              No downloads, no configs, no limits. Just pure development in your browser.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, overflow: 'hidden' }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ padding: 28, backgroundColor: '#0b0e14', transition: 'background-color 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#0f1219' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#0b0e14' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, backgroundColor: `${f.accent}15`, color: f.accent }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, color: '#f1f5f9' }}>{f.title}</h3>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: '#64748b' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ padding: '60px 24px' }}>
        <div className="max-w-4xl mx-auto" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 32, textAlign: 'center' }}>
          {[
            { value: '50+', label: 'Languages' },
            { value: '100%', label: 'Browser' },
            { value: 'Instant', label: 'Preview' },
            { value: 'Free', label: 'No CC' },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section ref={ctaRef} style={{ padding: '80px 24px' }}>
        <div className="max-w-2xl mx-auto" style={{ padding: '48px 40px', borderRadius: 16, textAlign: 'center', backgroundColor: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.1)' }}>
          <h2 style={{ fontSize: 'clamp(1.3rem, 2.5vw, 2rem)', fontWeight: 700, marginBottom: 12, color: '#f1f5f9' }}>Start coding in seconds</h2>
          <p style={{ color: '#64748b', fontSize: 14, marginBottom: 28, maxWidth: 400, margin: '0 auto 28px' }}>
            Create a free account. No credit card. No setup. Just pure code.
          </p>
          <button onClick={() => router.push(user ? '/dashboard' : '/auth')}
            style={{ padding: '12px 32px', borderRadius: 10, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', backgroundColor: '#6366f1', color: 'white', boxShadow: '0 4px 24px rgba(99,102,241,0.25)', transition: 'all 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 32px rgba(99,102,241,0.35)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 24px rgba(99,102,241,0.25)'; e.currentTarget.style.transform = 'translateY(0)' }}>
            {user ? 'Go to Dashboard' : 'Create Free Account'}
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="max-w-6xl mx-auto" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 12, color: '#334155', flexWrap: 'wrap' }}>
          <div style={{ width: 18, height: 18, borderRadius: 5, background: 'linear-gradient(135deg, #6366f1, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" style={{ width: 6, height: 6 }}>
              <path d="M4 3L3 5L4 7" /><path d="M6 3L7 5L6 7" opacity="0.6" />
            </svg>
          </div>
          <span style={{ fontWeight: 600, color: '#475569' }}>CodeWave</span>
          <span>·</span>
          <span>Browser IDE</span>
          <span>·</span>
          <span>Next.js · Neon DB · Monaco</span>
        </div>
      </footer>
    </div>
  )
}
