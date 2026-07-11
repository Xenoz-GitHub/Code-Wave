'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { authClient } from '@/lib/auth'

const LANGUAGES = [
  'JavaScript', 'TypeScript', 'Python', 'Rust', 'Go', 'C++', 'Java',
  'Ruby', 'PHP', 'Swift', 'Kotlin', 'Dart', 'C', 'C#', 'Scala',
  'Perl', 'Lua', 'Haskell', 'Zig', 'Nim',
]

const FEATURES = [
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
      </svg>
    ),
    title: 'Multi-Language Runtime',
    desc: 'Execute code in 50+ languages instantly. JavaScript, Python, Rust, Go, C++, and more — all running in a secure sandbox.',
    gradient: 'from-blue-400 to-cyan-300',
    color: '#3b82f6',
  },
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
    title: 'VS Code IntelliSense',
    desc: 'Full code completion, parameter hints, hover info, and error diagnostics powered by Monaco Editor — the same engine behind VS Code.',
    gradient: 'from-purple-400 to-pink-300',
    color: '#a855f7',
  },
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
      </svg>
    ),
    title: 'Live Preview Engine',
    desc: 'See HTML, CSS, and JavaScript render in real-time. Toggle between mobile, tablet, and desktop viewports instantly.',
    gradient: 'from-emerald-400 to-teal-300',
    color: '#10b981',
  },
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20.016c-2.808 0-5.28-.936-7.416-2.808A11.99 11.99 0 011.5 12c1.272-3.264 3.36-5.856 6.264-7.776C10.668 2.304 12 2 12 2s1.332.304 4.236 2.224C19.14 6.144 21.228 8.736 22.5 12a11.99 11.99 0 01-3.084 5.208c-2.136 1.872-4.608 2.808-7.416 2.808z"/><path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/>
      </svg>
    ),
    title: 'Real-time Preview',
    desc: 'Every keystroke updates instantly. No save, no refresh — just code and see.',
    gradient: 'from-amber-400 to-orange-300',
    color: '#f59e0b',
  },
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
    title: 'Real-time Collaboration',
    desc: 'Share a project link and edit code together with your team. See live cursors and changes as they happen.',
    gradient: 'from-rose-400 to-pink-300',
    color: '#f43f5e',
  },
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    ),
    title: 'Cloud Sync & Export',
    desc: 'Automatic saving to Neon DB. Export or import any project as ZIP. Your code follows you everywhere.',
    gradient: 'from-violet-400 to-indigo-300',
    color: '#8b5cf6',
  },
]

const CODE_DEMO = `import { useState } from "react";
import { Globe, Sparkles } from "lucide-react";

function CodeWaveDemo() {
  const [code, setCode] = useState("Hello, World!");
  const [preview, setPreview] = useState("");

  const handleRun = async () => {
    const result = await fetch("/api/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: "javascript",
        code: \`console.log("\${code}")\`,
      }),
    });
    const data = await result.json();
    setPreview(data.output);
  };

  return (
    <div className="editor">
      <Globe className="w-5 h-5 text-blue-400" />
      <Sparkles className="w-5 h-5 text-yellow-400" />
      <button onClick={handleRun}>Run</button>
      <pre>{preview}</pre>
    </div>
  );
}`

function useTypewriter(text: string, speed = 50) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDisplayed('')
    setDone(false)
    let i = 0
    const timer = setInterval(() => {
      setDisplayed(text.slice(0, i + 1))
      i++
      if (i >= text.length) {
        clearInterval(timer)
        setDone(true)
      }
    }, speed)
    return () => clearInterval(timer)
  }, [text, speed])

  return { displayed, done }
}

function AnimatedGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      <div className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  )
}

function FloatingOrb({ className, size, color, delay }: { className?: string; size: number; color: string; delay: number }) {
  return (
    <div
      className={`absolute rounded-full blur-3xl animate-float pointer-events-none ${className || ''}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color}, transparent 70%)`,
        animationDelay: `${delay}s`,
        opacity: 0.07,
      }}
    />
  )
}

function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const particles: { x: number; y: number; vx: number; vy: number; size: number }[] = []
    const count = 80

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.5 + 0.5,
      })
    }

    function resize() {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resize()
    window.addEventListener('resize', resize)

    let animId: number

    function animate() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(59, 130, 246, 0.15)'
        ctx.fill()

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[j].x - p.x
          const dy = particles[j].y - p.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 150) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.03 * (1 - dist / 150)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      animId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none -z-10" />
}

export default function LandingPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const featuresRef = useRef<HTMLDivElement>(null)
  const [visibleFeatures, setVisibleFeatures] = useState<Set<number>>(new Set())

  const headline = 'Code in the Cloud. Build Anything.'
  const { displayed: typedLine, done: typingDone } = useTypewriter(headline, 45)

  useEffect(() => {
    authClient.getUser().then((u: any) => {
      setUser(u)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute('data-index'))
            setVisibleFeatures((prev) => new Set(prev).add(idx))
          }
        })
      },
      { threshold: 0.2 }
    )

    const cards = document.querySelectorAll('[data-feature-card]')
    cards.forEach((c) => observer.observe(c))

    return () => observer.disconnect()
  }, [])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center" style={{ backgroundColor: '#02050a' }}>
        <div className="animate-spin w-8 h-8 border-2 border-[#3b82f6] border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-full overflow-x-hidden" style={{ backgroundColor: '#02050a', color: '#e2e8f0' }}>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59,130,246,0.15); }
          50% { box-shadow: 0 0 40px rgba(59,130,246,0.3); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-float { animation: float 8s ease-in-out infinite; }
        .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
        .animate-shimmer {
          background: linear-gradient(90deg, transparent, rgba(59,130,246,0.05), transparent);
          background-size: 200% 100%;
          animation: shimmer 3s ease-in-out infinite;
        }
      `}</style>

      <ParticleField />
      <FloatingOrb className="top-1/4 left-[10%]" size={500} color="#3b82f6" delay={0} />
      <FloatingOrb className="top-1/3 right-[15%]" size={400} color="#8b5cf6" delay={2} />
      <FloatingOrb className="bottom-1/4 left-[30%]" size={350} color="#06b6d4" delay={4} />
      <AnimatedGrid />

      {/* NAV */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
            style={{ backgroundColor: '#3b82f6', color: 'white' }}>&lt;/&gt;</div>
          <span className="text-lg font-semibold tracking-tight" style={{ color: '#f1f5f9' }}>CodeWave</span>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm hidden sm:inline" style={{ color: '#64748b' }}>{user.email}</span>
              <button onClick={() => router.push('/dashboard')}
                className="px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90"
                style={{ backgroundColor: '#3b82f6', color: 'white' }}>
                Dashboard
              </button>
            </>
          ) : (
            <>
              <button onClick={() => router.push('/auth')}
                className="px-4 py-2 text-sm transition" style={{ color: '#94a3b8' }}>
                Sign In
              </button>
              <button onClick={() => router.push('/auth')}
                className="px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90"
                style={{ backgroundColor: '#3b82f6', color: 'white' }}>
                Get Started
              </button>
            </>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section className="relative z-10 flex flex-col items-center pt-24 pb-16 px-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8"
          style={{
            backgroundColor: 'rgba(59,130,246,0.08)',
            color: '#60a5fa',
            border: '1px solid rgba(59,130,246,0.15)',
          }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#22c55e' }} />
          <span>Beta live — <span style={{ color: '#94a3b8' }}>free to use</span></span>
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6 max-w-5xl min-h-[1.2em]" style={{ color: '#f1f5f9' }}>
          {typedLine}
          <span className="ml-0.5 inline-block w-[3px] h-[0.85em] align-middle"
            style={{ backgroundColor: '#3b82f6', animation: 'pulse 1s step-end infinite' }} />
        </h1>

        <p className="text-lg sm:text-xl max-w-2xl mb-10 leading-relaxed" style={{ color: '#64748b' }}>
          A browser-based IDE with live preview, real-time collaboration, and code execution
          for 50+ languages. No setup. No downloads. Just your browser.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
          <button onClick={() => router.push(user ? '/dashboard' : '/auth')}
            className="px-8 py-3.5 rounded-xl text-base font-semibold transition-all duration-200 hover:scale-105 animate-pulse-glow"
            style={{ backgroundColor: '#3b82f6', color: 'white' }}>
            {user ? 'Open Dashboard' : 'Start Coding Free'}
          </button>
          <button onClick={() => featuresRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-3.5 rounded-xl text-base font-medium transition-all duration-200"
            style={{ border: '1px solid rgba(255,255,255,0.06)', color: '#94a3b8' }}>
            Explore Features
          </button>
        </div>

        {/* EDITOR MOCKUP */}
        <div className="w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl animate-pulse-glow"
          style={{
            backgroundColor: '#0c0f1a',
            border: '1px solid rgba(59,130,246,0.1)',
            boxShadow: '0 0 60px rgba(59,130,246,0.06)',
          }}>
          {/* Title bar */}
          <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: '#080b14', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="ml-3 text-xs" style={{ color: '#475569' }}>CodeWave — demo.jsx</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-16 h-4 rounded" style={{ backgroundColor: '#1e293b' }} />
              <span className="w-20 h-4 rounded" style={{ backgroundColor: '#1e293b' }} />
            </div>
          </div>

          {/* Sidebar + Editor */}
          <div className="flex">
            {/* Sidebar */}
            <div className="w-12 flex flex-col items-center py-3 gap-3" style={{ backgroundColor: '#080b14', borderRight: '1px solid rgba(255,255,255,0.04)' }}>
              {['📁', '🔍', '📄', '⚙️', '🔀'].map((icon, i) => (
                <span key={i} className="text-sm opacity-40 hover:opacity-80 cursor-pointer transition">{icon}</span>
              ))}
            </div>

            {/* File tree */}
            <div className="w-44 py-3 px-3 text-xs leading-6 font-mono" style={{ backgroundColor: '#0a0d18', borderRight: '1px solid rgba(255,255,255,0.04)' }}>
              {[
                { name: '📁 src', active: false, indent: '' },
                { name: '  📄 App.tsx', active: true, indent: '' },
                { name: '  📄 main.ts', active: false, indent: '' },
                { name: '  📁 components', active: false, indent: '' },
                { name: '    📄 Editor.tsx', active: false, indent: '' },
                { name: '    📄 Preview.tsx', active: false, indent: '' },
                { name: '📁 public', active: false, indent: '' },
                { name: '📄 package.json', active: false, indent: '' },
                { name: '📄 tsconfig.json', active: false, indent: '' },
              ].map((file, i) => (
                <div key={i} className={`truncate px-1 rounded ${file.active ? 'text-blue-400' : ''}`}
                  style={{ backgroundColor: file.active ? 'rgba(59,130,246,0.08)' : 'transparent' }}>
                  {file.name}
                </div>
              ))}
            </div>

            {/* Code editor */}
            <div className="flex-1 overflow-x-auto">
              <div className="flex items-center text-xs border-b" style={{ backgroundColor: '#0c0f1a', borderColor: 'rgba(255,255,255,0.04)' }}>
                <div className="flex items-center gap-1.5 px-3 py-1.5 border-r cursor-pointer"
                  style={{ backgroundColor: '#0c0f1a', borderColor: 'rgba(255,255,255,0.04)', color: '#60a5fa' }}>
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  demo.jsx
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 cursor-pointer" style={{ color: '#475569' }}>
                  <span className="w-2 h-2 rounded-full bg-gray-600" />
                  styles.css
                </div>
              </div>

              <pre className="p-5 text-xs sm:text-sm leading-6 font-mono overflow-x-auto select-all"
                style={{ color: '#94a3b8' }}>
                <code>{CODE_DEMO}</code>
              </pre>
            </div>
          </div>

          {/* Status bar */}
          <div className="flex items-center justify-between px-4 py-1.5 text-xs" style={{ backgroundColor: '#080b14', borderTop: '1px solid rgba(255,255,255,0.04)', color: '#475569' }}>
            <div className="flex items-center gap-4">
              <span>⬡ JavaScript JSX</span>
              <span>Ln 18, Col 32</span>
            </div>
            <div className="flex items-center gap-4">
              <span>UTF-8</span>
              <span>Spaces: 2</span>
              <span>✨ Prettier</span>
            </div>
          </div>
        </div>
      </section>

      {/* LANGUAGES BAR */}
      <section className="relative z-10 py-16 border-y" style={{ borderColor: 'rgba(255,255,255,0.03)' }}>
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-xs text-center mb-8 uppercase tracking-[0.2em] font-medium" style={{ color: '#475569' }}>
            Supported Runtimes
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {LANGUAGES.map((lang) => (
              <span key={lang}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 hover:scale-105 hover:bg-blue-500/10 hover:text-blue-400 cursor-default"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  color: '#64748b',
                }}>
                {lang}
              </span>
            ))}
            <span className="px-3.5 py-1.5 rounded-lg text-xs font-medium"
              style={{ backgroundColor: 'rgba(59,130,246,0.08)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.15)' }}>
              +30 more
            </span>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section ref={featuresRef} className="relative z-10 py-28 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#f1f5f9' }}>
              Built for{' '}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #06b6d4)' }}>
                modern development
              </span>
            </h2>
            <p className="max-w-xl mx-auto" style={{ color: '#64748b' }}>
              Everything a developer needs, right in the browser.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
            {FEATURES.map((feature, i) => (
              <div key={i}
                data-feature-card
                data-index={i}
                className="group relative p-8 transition-all duration-500 cursor-default"
                style={{
                  backgroundColor: '#02050a',
                  animation: visibleFeatures.has(i) ? 'slide-up 0.6s ease-out forwards' : 'none',
                  opacity: visibleFeatures.has(i) ? 1 : 0,
                  animationDelay: `${i * 0.1}s`,
                }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(59,130,246,0.03), transparent 40%)`,
                  }}
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    e.currentTarget.style.setProperty('--mouse-x', `${((e.clientX - rect.left) / rect.width) * 100}%`)
                    e.currentTarget.style.setProperty('--mouse-y', `${((e.clientY - rect.top) / rect.height) * 100}%`)
                  }}
                />

                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110"
                    style={{
                      backgroundColor: `${feature.color}15`,
                      color: feature.color,
                      boxShadow: `0 0 20px ${feature.color}10`,
                    }}>
                    {feature.icon}
                  </div>

                  <h3 className="text-base font-semibold mb-3" style={{ color: '#f1f5f9' }}>{feature.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#64748b' }}>{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '50+', label: 'Languages' },
            { value: '100%', label: 'Browser-based' },
            { value: 'Instant', label: 'Live Preview' },
            { value: 'Free', label: 'No CC needed' },
          ].map((stat, i) => (
            <div key={i}>
              <div className="text-3xl font-bold mb-1" style={{ color: '#f1f5f9' }}>{stat.value}</div>
              <div className="text-xs uppercase tracking-widest" style={{ color: '#475569' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24 px-4">
        <div className="max-w-2xl mx-auto p-12 rounded-2xl text-center relative overflow-hidden"
          style={{
            backgroundColor: 'rgba(59,130,246,0.03)',
            border: '1px solid rgba(59,130,246,0.1)',
          }}>
          <div className="absolute inset-0 animate-shimmer pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#f1f5f9' }}>
              Start coding in seconds
            </h2>
            <p className="mb-8 max-w-md mx-auto" style={{ color: '#64748b' }}>
              Create a free account. No credit card. No downloads. Just pure code.
            </p>
            <button onClick={() => router.push(user ? '/dashboard' : '/auth')}
              className="px-8 py-3.5 rounded-xl text-base font-semibold transition-all duration-200 hover:scale-105"
              style={{ backgroundColor: '#3b82f6', color: 'white' }}>
              {user ? 'Go to Dashboard' : 'Create Free Account'}
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 py-8 px-4 text-center text-xs" style={{ color: '#334155', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold"
            style={{ backgroundColor: '#3b82f6', color: 'white' }}>&lt;/&gt;</div>
          <span className="text-sm font-semibold" style={{ color: '#475569' }}>CodeWave</span>
          <span style={{ color: '#334155' }}>·</span>
          <span style={{ color: '#334155' }}>Browser IDE</span>
        </div>
        <p>Built with Next.js · Neon DB · Monaco Editor</p>
      </footer>
    </div>
  )
}
