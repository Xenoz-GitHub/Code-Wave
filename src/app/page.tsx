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
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    ),
    title: 'Multi-Language',
    desc: 'Write and run code in 50+ languages. From JavaScript to Rust, Python to Go.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Live Preview',
    desc: 'See HTML, CSS, and JavaScript changes instantly. Test responsiveness across devices.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
      </svg>
    ),
    title: 'IntelliSense',
    desc: 'Smart code completion, hover info, parameter hints, and error checking — just like VS Code.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    title: 'Real-time Collab',
    desc: 'Share a link and edit code together. See cursor positions and changes as they happen.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: 'Secure & Private',
    desc: 'Your code is saved securely to Neon DB. Sandboxed execution keeps everything isolated.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
      </svg>
    ),
    title: 'Mobile Ready',
    desc: 'Fully responsive. Install as a PWA on Android for an app-like experience on any device.',
  },
]

export default function LandingPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [typedText, setTypedText] = useState('')
  const [showCursor, setShowCursor] = useState(true)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const heroRef = useRef<HTMLDivElement>(null)

  const codeSnippet = `function greet(name) {
  return \`Hello, \${name}! 👋\`;
}

console.log(greet("CodeWave"));`

  useEffect(() => {
    authClient.getUser().then((u: any) => {
      setUser(u)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    const fullText = 'Code in the Cloud'
    let i = 0
    const interval = setInterval(() => {
      setTypedText(fullText.slice(0, i + 1))
      i++
      if (i >= fullText.length) clearInterval(interval)
    }, 60)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((c) => !c)
    }, 530)
    return () => clearInterval(cursorInterval)
  }, [])

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouse)
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0a0a0a]">
        <div className="animate-spin w-8 h-8 border-2 border-[#007acc] border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-full bg-[#0a0a0a] text-white overflow-x-hidden">
      {/* Gradient blob */}
      <div
        className="fixed top-[-20vh] left-[-10vw] w-[60vw] h-[60vh] rounded-full opacity-[0.03] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #007acc, transparent 70%)',
          transform: `translate(${(mousePos.x - window.innerWidth / 2) * 0.02}px, ${(mousePos.y - window.innerHeight / 2) * 0.02}px)`,
        }}
      />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold" style={{ color: '#007acc' }}>&lt;/&gt;</span>
          <span className="text-lg font-semibold">CodeWave</span>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-gray-400 hidden sm:inline">{user.email}</span>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{ backgroundColor: '#007acc', color: 'white' }}
              >
                Dashboard
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => router.push('/auth')}
                className="px-4 py-2 text-sm text-gray-300 hover:text-white transition"
              >
                Sign In
              </button>
              <button
                onClick={() => router.push('/auth')}
                className="px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90"
                style={{ backgroundColor: '#007acc', color: 'white' }}
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section ref={heroRef} className="relative z-10 flex flex-col items-center px-4 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8"
          style={{ backgroundColor: 'rgba(0, 122, 204, 0.1)', color: '#007acc', border: '1px solid rgba(0, 122, 204, 0.2)' }}>
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Now in Beta — Free to use
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6 max-w-4xl">
          {typedText}
          <span className={`ml-0.5 inline-block w-[3px] h-[1em] bg-[#007acc] align-middle ${showCursor ? 'opacity-100' : 'opacity-0'}`} />
          <br />
          <span className="text-transparent bg-clip-text" style={{
            backgroundImage: 'linear-gradient(135deg, #007acc, #4ECDC4, #96CEB4)',
          }}>
            Build Anything.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed">
          A powerful browser-based IDE with Monaco Editor, real-time collaboration,
          live preview, and execution for 50+ languages. No setup required.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={() => router.push(user ? '/dashboard' : '/auth')}
            className="px-8 py-3.5 rounded-xl text-base font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg"
            style={{ backgroundColor: '#007acc', color: 'white', boxShadow: '0 4px 20px rgba(0, 122, 204, 0.3)' }}
          >
            {user ? 'Go to Dashboard' : 'Start Coding Free'}
          </button>
          <button
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-3.5 rounded-xl text-base font-medium transition-all duration-200"
            style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#ccc' }}
          >
            Learn More
          </button>
        </div>

        {/* Code snippet mockup */}
        <div className="mt-16 w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl"
          style={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-2 px-4 py-3" style={{ backgroundColor: '#16162a', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="ml-3 text-xs text-gray-500">main.js</span>
          </div>
          <pre className="p-5 text-sm font-mono leading-relaxed overflow-x-auto" style={{ color: '#e4e4e7' }}>
            <code>{codeSnippet}</code>
          </pre>
        </div>
      </section>

      {/* Languages bar */}
      <section className="relative z-10 py-12 border-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-xs text-gray-500 text-center mb-6 uppercase tracking-widest font-medium">Supported Languages</p>
          <div className="flex flex-wrap justify-center gap-2">
            {LANGUAGES.map((lang) => (
              <span key={lang} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  color: '#888',
                }}>
                {lang}
              </span>
            ))}
            <span className="px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{ backgroundColor: 'rgba(0,122,204,0.1)', color: '#007acc', border: '1px solid rgba(0,122,204,0.2)' }}>
              +30 more
            </span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything you need to{' '}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #007acc, #4ECDC4)' }}>
                code anywhere
              </span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              A full-featured IDE in your browser. No downloads, no setup, just code.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feature, i) => (
              <div key={i} className="group p-6 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-colors duration-300"
                  style={{ backgroundColor: 'rgba(0,122,204,0.1)', color: '#007acc' }}>
                  {feature.icon}
                </div>
                <h3 className="text-base font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#888' }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24 px-4 text-center">
        <div className="max-w-2xl mx-auto p-10 rounded-2xl" style={{
          backgroundColor: 'rgba(0,122,204,0.05)',
          border: '1px solid rgba(0,122,204,0.15)',
        }}>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Start coding in seconds</h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            Create a free account, open a project, and start writing code. No credit card required.
          </p>
          <button
            onClick={() => router.push(user ? '/dashboard' : '/auth')}
            className="px-8 py-3.5 rounded-xl text-base font-semibold transition-all duration-200 hover:scale-105"
            style={{ backgroundColor: '#007acc', color: 'white', boxShadow: '0 4px 20px rgba(0, 122, 204, 0.3)' }}
          >
            {user ? 'Go to Dashboard' : 'Create Free Account'}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-4 text-center text-xs" style={{ color: '#444', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-sm font-semibold" style={{ color: '#007acc' }}>CodeWave</span>
          <span style={{ color: '#555' }}>•</span>
          <span>Browser IDE</span>
        </div>
        <p>Built with Next.js, Neon DB, and Monaco Editor</p>
      </footer>
    </div>
  )
}
