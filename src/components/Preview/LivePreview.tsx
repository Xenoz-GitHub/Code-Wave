'use client'

import { useState, useEffect, useRef } from 'react'

type Props = {
  code: string
  language: string
}

export default function LivePreview({ code, language }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile' | 'tablet'>('desktop')

  useEffect(() => {
    if (!iframeRef.current || !code) return
    const iframe = iframeRef.current

    if (language === 'html') {
      const blob = new Blob([code], { type: 'text/html' })
      iframe.src = URL.createObjectURL(blob)
    } else if (language === 'javascript' || language === 'typescript') {
      const html = `<!DOCTYPE html><html><body><script>${code}<\/script></body></html>`
      const blob = new Blob([html], { type: 'text/html' })
      iframe.src = URL.createObjectURL(blob)
    } else if (language === 'css') {
      const html = `<!DOCTYPE html><html><head><style>${code}</style></head><body><div class="preview" style="padding:20px;font-family:sans-serif">CSS Preview</div></body></html>`
      const blob = new Blob([html], { type: 'text/html' })
      iframe.src = URL.createObjectURL(blob)
    } else {
      iframe.srcdoc = '<p style="color:gray;font-family:sans-serif;padding:20px">Preview not available for this language</p>'
    }
  }, [code, language])

  const widths: Record<string, string> = {
    mobile: '375px',
    tablet: '768px',
    desktop: '100%',
  }

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--background)' }}>
      <div className="flex items-center justify-between px-2 py-1 border-b shrink-0" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--panel-bg)' }}>
        <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Preview</span>
        <div className="flex items-center gap-1">
          {(['mobile', 'tablet', 'desktop'] as const).map((mode) => (
            <button key={mode}
              onClick={() => setPreviewMode(mode)}
              className={`px-2 py-0.5 text-xs rounded transition ${
                previewMode === mode
                  ? 'text-white' 
                  : 'hover:bg-[var(--border-color)]'
              }`}
              style={previewMode === mode ? { backgroundColor: 'var(--accent)' } : { color: 'var(--foreground-muted)' }}>
              {mode === 'mobile' ? '📱' : mode === 'tablet' ? '📟' : '🖥️'}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 flex items-start justify-center overflow-auto p-2" style={{ backgroundColor: 'var(--background-alt)' }}>
        <div style={{ width: widths[previewMode], minHeight: 200, backgroundColor: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', transition: 'width 0.2s' }}>
          <iframe
            ref={iframeRef}
            className="w-full h-full min-h-[300px] border-0"
            sandbox="allow-scripts allow-modals"
            title="Live Preview"
          />
        </div>
      </div>
    </div>
  )
}
